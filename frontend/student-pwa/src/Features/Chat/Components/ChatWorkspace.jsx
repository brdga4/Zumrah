
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ChatRoomList from "./ChatRoomList";
import "./ChatWorkspace.css";

// Receives four props from HomePage
export default function ChatWorkspace({
  rooms,
  activeRoom,
  onOpenRoom,
  children,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Control whether the conversation is visible on mobile
  // Open it directly if the student came from CoursesPage
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(
    Boolean(location.state?.roomId)
  );

  // Open the selected chat room
  function handleOpenRoom(room) {
    onOpenRoom(room);
    setIsMobileChatOpen(true);
  }

  return (
    <div
      className={`chat-workspace ${isMobileChatOpen ? "mobile-chat-open" : ""}`}
      dir="rtl"
    >
      {/* Chat rooms sidebar */}
      <aside className="chat-workspace-rooms">
        <ChatRoomList
          rooms={rooms}
          activeRoom={activeRoom}
          onOpenRoom={handleOpenRoom}
        />
      </aside>

      {/* Main conversation area */}
      <section className="chat-workspace-main">

        {/* Active room header */}
        <header className="chat-workspace-header">

          {/* Back to rooms - visible only on mobile */}
          <button
            type="button"
            className="chat-workspace-back-button"
            onClick={() => setIsMobileChatOpen(false)}
          >
            → رجوع
          </button>

          <h2>{activeRoom?.name || "المحادثات"}</h2>

          {/* Files button - only for course chats */}
          {activeRoom?.kind === "course" && (
            <button
              type="button"
              className="chat-workspace-files-button"
              onClick={() =>
                navigate(`/courses/${activeRoom.courseId}/files`)
              }
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2Z" />
              </svg>
              <span>الملفات</span>
            </button>
          )}
        </header>

        {/* Messages and composer */}
        <div className="chat-workspace-content">
          {children}
        </div>

      </section>
    </div>
  );
}
