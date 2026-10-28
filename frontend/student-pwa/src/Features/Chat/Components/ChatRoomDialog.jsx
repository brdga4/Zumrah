// Import chat dialog styles
import "./ChatRoomDialog.css";
// 1. Import React hooks and shared components
import { useEffect, useRef, useState } from "react";
import Heading from "../../../Components/Heading";
import Text from "../../../Components/Text";

// 2. Receive the selected chat room and close function
export default function ChatRoomDialog({ room, onClose }) {
  const dialogRef = useRef(null);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState({});

  // 3. Open or close the chat dialog
  useEffect(() => {
    const dialog = dialogRef.current;

    if (room && !dialog.open) {
      dialog.showModal();
    } else if (!room && dialog.open) {
      dialog.close();
    }
  }, [room]);

  // 4. Simulate sending messages locally (no backend yet)
  function handleSubmit(event) {
    event.preventDefault();

    if (!room || !draft.trim()) return;

    const message = {
      id: Date.now(),
      text: draft.trim(),
    };

    setMessages((current) => ({
      ...current,
      [room.id]: [...(current[room.id] || []), message],
    }));

    setDraft("");
  }

  // 5. Render the chat interface
  return (
    <dialog
      ref={dialogRef}
      className="chat-dialog"
      dir="rtl"
      aria-label={room?.name || "المحادثة"}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      {room && (
        <div className="chat-dialog-body">

          {/* Chat header */}
          <div className="chat-room-info">
            <Heading level={2}>{room.name}</Heading>
            <button type="button" onClick={onClose}>
              إغلاق
            </button>
          </div>

          {/* Chat messages */}
          <div className="chat-messages">
            <Text tone="muted">اليوم</Text>

            {(messages[room.id] || []).map((message) => (
              <div className="chat-message chat-message-own" key={message.id}>
                <div className="chat-bubble">
                  <Text>{message.text}</Text>
                </div>
              </div>
            ))}
          </div>

          {/* Message input */}
          <form className="chat-composer" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="اكتب رسالتك..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />

            <button type="submit" disabled={!draft.trim()}>
              إرسال
            </button>
          </form>

        </div>
      )}
    </dialog>
  );
}