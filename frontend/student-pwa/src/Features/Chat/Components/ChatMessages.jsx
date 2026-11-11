import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { getChatHistory } from "../chatApi";

import "./ChatMessages.css";

import ChatMessageBubble from "./ChatMessageBubble";

import { createChatConnection } from "../chatConnection";
//------------------------------------------------------------------------------------------------------------------------------------------------------

// Fetch and display messages for the selected chat room
export default function ChatMessages({ roomId, studentId }) {
  // State to store the chat messages
  const [messages, setMessages] = useState([]);
  
  // Store the cursor for the next page of older messages.
  const [nextBefore, setNextBefore] = useState(null);
  // Track whether older messages are being loaded.
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  // Prevent multiple pagination requests at the same time.
  const loadingOlderRef = useRef(false);


  const [loadedRoomId, setLoadedRoomId] = useState(null);
  const loading = Boolean(roomId) && loadedRoomId !== roomId;

  // Reference to the SignalR connection
  const connectionRef = useRef(null);
  // Reference to the messages list container for scrolling
  const messagesListRef = useRef(null);
  // Remember the scroll position before loading older messages.
  const scrollRestoreRef = useRef(null);
  // Keep track of the active older-messages request.
const olderRequestRef = useRef(null);
  // State for the message input
  const [messageText, setMessageText] = useState("");

  //------------------------------------------------------------------------------------------------------------------------------------------------------ 
  useEffect(() => {
    if (!roomId) return;

    let active = true;
    

    getChatHistory(roomId)
      .then((data) => {
        setMessages(data.messages ?? []);
        setNextBefore(data.nextBefore ?? null);
      })
      .catch((error) => {
        console.error("Failed to load chat history:", error);
      })
      .finally(() => {
        if (active) setLoadedRoomId(roomId);
      });

    return () => {
      active = false;

      // Cancel older history requests when switching rooms.
      olderRequestRef.current?.abort();

      // Clear the saved scroll position.
      scrollRestoreRef.current = null;
    };
  }, [roomId]);

  // Load older messages when the student scrolls to the top.
  async function loadOlderMessages() {
    if (!roomId || loadedRoomId !== roomId || !nextBefore || loadingOlderRef.current) return;

    loadingOlderRef.current = true;
    setIsLoadingOlder(true);

    const controller = new AbortController();
    olderRequestRef.current = controller;
    try {
      // Fetch the previous page using the pagination cursor.
      const data = await getChatHistory(roomId, {
        before: nextBefore,
        signal: controller.signal,
      });

      // Ignore results from a cancelled request.
      if (controller.signal.aborted) return;

      // Save the current scroll position before adding older messages.
      const list = messagesListRef.current;

      if (list) {
        scrollRestoreRef.current = {
          scrollHeight: list.scrollHeight,
          scrollTop: list.scrollTop,
        };
      }

      // Add older messages without duplicating existing ones.
      setMessages((previous) => {
        const existingIds = new Set(
          previous.map((message) => message.messageId)
        );

        const olderMessages = (data.messages ?? []).filter(
          (message) => !existingIds.has(message.messageId)
        );

        return [...olderMessages, ...previous];
      });

      // Store the cursor for the next page.
      setNextBefore(data.nextBefore ?? null);

    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Failed to load older messages:", error);
      }
    } finally {
      if (olderRequestRef.current === controller) {
        olderRequestRef.current = null;
        loadingOlderRef.current = false;
        setIsLoadingOlder(false);
      }
    }
  }
  //--------------------------------------------------------------------------------------------------------------------------
  // Connect to SignalR and receive new messages
useEffect(() => {
  if (!roomId) return;

  const connection = createChatConnection();
  let cancelled = false;

  // Receive new messages from the backend
  connection.on("ReceiveMessage", (message) => {
    if (String(message.chatRoomId) !== String(roomId)) return;

    setMessages((previous) => {
      if (previous.some((m) => m.messageId === message.messageId)) {
        return previous;
      }
      return [...previous, message];
    });
  });

  // Rejoin the room after reconnecting
  connection.onreconnected(() => {
    if (!cancelled) {
      connection.invoke("JoinRoom", roomId).catch(console.error);
    }
  });

  async function connect() {
    try {
      await connection.start();

      if (cancelled) {
        await connection.stop();
        return;
      }

      await connection.invoke("JoinRoom", roomId);
      connectionRef.current = connection;
      console.log("SignalR joined room:", roomId);
    } catch (error) {
      if (!cancelled) console.error("SignalR connection failed:", error);
    }
  }

  connect();

  // Disconnect when leaving the room
  return () => {
    cancelled = true;
    connection.stop();
  };
}, [roomId]);


  // Restore the scroll position after older messages are added.
  useLayoutEffect(() => {
    const list = messagesListRef.current;
    if (!list) return;

    const savedPosition = scrollRestoreRef.current;

    if (savedPosition) {
      // Keep the student at the same message after loading older history.
      list.scrollTop =
        savedPosition.scrollTop +
        (list.scrollHeight - savedPosition.scrollHeight);

      scrollRestoreRef.current = null;
      return;
    }

    // Scroll to the latest message when no restoration is needed.
    list.scrollTop = list.scrollHeight;
  }, [messages, loading]);
  //--------------------------------------------------------------------------------------------------------------------------------
  if (!roomId) return <p>اختر غرفة للمحادثة</p>;
  if (loading) return <p>جارٍ تحميل الرسائل...</p>;
  //--------------------------------------------------------------------------------------------------------------------------------

  async function handleSendMessage() {
    if (!messageText.trim() || !connectionRef.current) return;

    try {
      await connectionRef.current.invoke(
      "SendMessage",
      roomId,
      messageText.trim()
    );

    setMessageText("");
  } catch (error) {
    console.error("Failed to send message:", error);
  }
}

  //--------------------------------------------------------------------------------------------------------------------------------
  return (
    <div className="chat-messages">
      <div
        className="chat-messages-list"
        ref={messagesListRef}
        onScroll={(event) => {
          // Load older messages when scrolling near the top.
          if (event.currentTarget.scrollTop <= 60) {
            loadOlderMessages();
          }
        }}
      >
        {isLoadingOlder && (
          <div className="chat-history-loading" role="status">
            جاري تحميل الرسائل السابقة...
          </div>
        )}
        {messages.map((message) => (
          <ChatMessageBubble
            key={message.messageId}
            message={message}
            isOutgoing={String(message.studentId) === String(studentId)}
          />
        ))}
      </div>
      <div className="chat-composer">
        <input
          type="text"
          placeholder="اكتب رسالتك..."
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <button
          type="button"
          onClick={handleSendMessage}
          disabled={!messageText.trim()}
          aria-label="إرسال الرسالة"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
          </svg>
        </button>
      </div>
    </div>
  );
}