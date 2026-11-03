import ChatRoomList from "./ChatRoomList";
import "./ChatWorkspace.css";

// Receives four props: rooms, activeRoom, onOpenRoom, and children.
// Displays the chat room list and the selected conversation.
export default function ChatWorkspace({
  rooms,
  activeRoom,
  onOpenRoom,
  children,
}) {
    return (
        <div className="chat-workspace" dir="rtl">
            {/* Chat rooms sidebar */}
            <aside className="chat-workspace-rooms">
                <ChatRoomList
                    rooms={rooms}
                    onOpenRoom={onOpenRoom}
                />
            </aside>

            {/* Main conversation area */}
            <section className="chat-workspace-main">

                {/* Active room header */}
                <header className="chat-workspace-header">
                    <h2>{activeRoom?.name || "المحادثات"}</h2>
                </header>

                {/* Messages and composer will render here */}
                <div className="chat-workspace-content">
                    {children}
                </div>

            </section>
        </div>
    );
}