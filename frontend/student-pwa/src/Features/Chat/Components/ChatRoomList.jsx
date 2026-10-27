// ==========================================
// 1. IMPORT SHARED COMPONENTS
// ==========================================

import Card from "../../../Components/Card";
import Badge from "../../../Components/Badge";
import Heading from "../../../Components/Heading";
import Text from "../../../Components/Text";
// Import ChatRoomList styles
import "./ChatRoomList.css"; 

// ==========================================
// 2. DISPLAY THE CHAT ROOM LIST
// Receive rooms and the function to open a chat.
// ==========================================

export default function ChatRoomList({ rooms, onOpenRoom }) {

  // Separate major and course chat rooms
  const majorRooms = rooms.filter((room) => room.kind === "major");
  const courseRooms = rooms.filter((room) => room.kind === "course");

  return (
    <Card className="chat-room-list">

      <Heading level={2}>غرف المحادثة</Heading>
      <Text size="small" tone="muted">
        اختر غرفة لفتح المحادثة.
      </Text>

      {/* 3. Major chat rooms */}
      <div className="chat-room-group">
        <Text>غرفة التخصص</Text>

        {majorRooms.map((room) => (
          <ChatRoomEntry
            key={room.id}
            room={room}
            onOpen={() => onOpenRoom(room)}
          />
        ))}
      </div>

      {/* 4. Course chat rooms */}
      <div className="chat-room-group">
        <Text>غرف المقررات</Text>

        {courseRooms.length > 0 ? (
          courseRooms.map((room) => (
            <ChatRoomEntry
              key={room.id}
              room={room}
              onOpen={() => onOpenRoom(room)}
            />
          ))
        ) : (
          <Text tone="muted" size="small">
            سجل في مقرر للانضمام إلى محادثته.
          </Text>
        )}
      </div>

    </Card>
  );
}

// ==========================================
// 5. DISPLAY A SINGLE CHAT ROOM
// Reusable button for each room.
// ==========================================

function ChatRoomEntry({ room, onOpen }) {
  return (
    <button
      type="button"
      className={`chat-room-entry chat-room-entry-${room.kind}`}
      onClick={onOpen}
    >
      <span className="chat-room-entry-top">
        <span className="chat-room-entry-name">
          {room.name}
        </span>

        <Badge variant="soft">
          {room.kind === "major" ? "عامة" : room.label}
        </Badge>
      </span>

      <span className="chat-room-entry-description">
        {room.description}
      </span>
    </button>
  );
}