#!/usr/bin/env bash
# Interactive Zumrah SignalR chat client for Ubuntu / WSL.
set -euo pipefail
umask 077

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
    echo 'Node.js and npm are required. Install them in Ubuntu WSL, then rerun this script.' >&2
    echo 'For example: sudo apt update && sudo apt install -y nodejs npm' >&2
    exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if (( NODE_MAJOR < 18 )); then
    echo "Node.js 18 or newer is required (found $(node --version))." >&2
    exit 1
fi

if [[ -z "${TOKEN:-}" ]]; then
    read -r -s -p 'Zumrah student JWT (hidden): ' TOKEN
    printf '\n'
fi
if [[ -z "${CHAT_ROOM_ID:-}" ]]; then
    read -r -p 'Chat room GUID: ' CHAT_ROOM_ID
fi

if [[ -z "$TOKEN" || -z "$CHAT_ROOM_ID" ]]; then
    echo 'Both TOKEN and CHAT_ROOM_ID are required.' >&2
    exit 1
fi
if ! [[ "$CHAT_ROOM_ID" =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$ ]]; then
    echo 'CHAT_ROOM_ID must be a GUID, such as 12345678-1234-1234-1234-123456789abc.' >&2
    exit 1
fi

WORKDIR="${XDG_CACHE_HOME:-$HOME/.cache}/zumrah-signalr-chat"
mkdir -p "$WORKDIR"
if [[ ! -f "$WORKDIR/package.json" ]]; then
    printf '{"private":true,"type":"module"}\n' > "$WORKDIR/package.json"
fi

if [[ ! -f "$WORKDIR/node_modules/@microsoft/signalr/package.json" ]]; then
    echo 'Installing SignalR JavaScript client (first run only)...'
    (cd "$WORKDIR" && npm install --no-audit --no-fund @microsoft/signalr)
fi

cat > "$WORKDIR/chat.mjs" <<'JAVASCRIPT'
import * as signalR from '@microsoft/signalr';
import readline from 'node:readline';

const token = process.env.TOKEN;
const roomId = process.env.CHAT_ROOM_ID;
const hubUrl = process.env.HUB_URL || 'http://127.0.0.1:5157/hubs/chat';

const connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, { accessTokenFactory: () => token })
    .withAutomaticReconnect()
    .build();

let rl;
let shuttingDown = false;

function show(text) {
    if (rl) process.stdout.write('\n');
    console.log(text);
    if (rl) rl.prompt(true);
}

connection.on('ReceiveMessage', (message) => {
    const sender = message.studentName || message.studentId || 'Student';
    show(`[${sender}] ${message.content}`);
});

connection.on('MessageRejected', (error) => {
    show(`REJECTED: ${error.code || 'ERROR'} — ${error.message || ''}`);
});

connection.onreconnecting(() => {
    show('Connection lost. Reconnecting...');
});

connection.onreconnected(async () => {
    try {
        await connection.invoke('JoinRoom', roomId);
        show('Reconnected and rejoined the chat room.');
    } catch (error) {
        show(`Reconnected, but could not rejoin: ${error.message}`);
    }
});

connection.onclose((error) => {
    if (!shuttingDown) {
        show(`Connection closed${error ? ': ' + error.message : '.'} Run the script again to reconnect.`);
    }
});

try {
    console.log(`Connecting to ${hubUrl} ...`);
    await connection.start();
    await connection.invoke('JoinRoom', roomId);
} catch (error) {
    console.error(`Could not connect/join: ${error.message}`);
    await connection.stop();
    process.exit(1);
}

console.log('Connected and joined chat room:', roomId);
console.log('Type a message and press Enter. Commands: /help, /quit (or Ctrl+C).');

rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
    prompt: 'chat> '
});
rl.on('SIGINT', () => rl.close());
rl.prompt();

for await (const input of rl) {
    const content = input.trim();

    if (content === '/quit' || content === '/exit') break;
    if (content === '/help') {
        console.log('Send: type a message and press Enter. Exit: /quit or Ctrl+C.');
    } else if (content) {
        if (connection.state !== signalR.HubConnectionState.Connected) {
            console.log('Not connected. Your message was NOT sent; retry after reconnection.');
        } else {
            try {
                await connection.invoke('SendMessage', roomId, content);
                // Server will broadcast ReceiveMessage or emit MessageRejected.
            } catch (error) {
                console.error(`Send failed: ${error.message}`);
            }
        }
    }
    rl.prompt();
}

shuttingDown = true;
await connection.stop();
console.log('Disconnected.');
JAVASCRIPT

export TOKEN CHAT_ROOM_ID
export HUB_URL="${HUB_URL:-http://127.0.0.1:5157/hubs/chat}"
cd "$WORKDIR"
exec node chat.mjs
