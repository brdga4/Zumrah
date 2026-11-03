import { useState, useEffect, useRef } from "react";
import { getChatHistory } from "../chatApi";

import "./ChatMessages.css";

import ChatMessageBubble from "./ChatMessageBubble";

import { createChatConnection } from "../chatConnection";
//------------------------------------------------------------------------------------------------------------------------------------------------------

// Fetch and display messages for the selected chat room
export default function ChatMessages({ roomId, studentId  }) {
  // State to store the chat messages
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Reference to the SignalR connection
   const connectionRef = useRef(null);
   // Reference to the messages list container for scrolling
   const messagesListRef = useRef(null);
   // State for the message input
   const [messageText, setMessageText] = useState("");

  //------------------------------------------------------------------------------------------------------------------------------------------------------ 
  useEffect(() => {
    if (!roomId) return;

    let active = true;
    setLoading(true);

    getChatHistory(roomId)
      .then((data) => {
        if (active) setMessages(data.messages);
      })
      .catch((error) => {
        console.error("Failed to load chat history:", error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [roomId]);
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


  // Scroll to the latest message
  useEffect(() => {
    const list = messagesListRef.current;
    if (!list) return;

    list.scrollTop = list.scrollHeight;
  }, [messages]);
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
      <div className="chat-messages-list" ref={messagesListRef}>
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