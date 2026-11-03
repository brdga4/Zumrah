import { useState } from "react";
import { Link } from "react-router-dom";

import Badge from "../../../Components/Badge";
import Heading from "../../../Components/Heading";
import Text from "../../../Components/Text";
// Import ChatRoomList styles
import "./ChatRoomList.css"; 

// ==========================================
// 2. DISPLAY THE CHAT ROOM LIST
// Receive rooms and the function to open a chat.
// ==========================================

export default function ChatRoomList({ rooms, activeRoom, onOpenRoom }) {

  const [query, setQuery] = useState("");

  const search = query.trim().toLowerCase();

  const filteredRooms = rooms.filter((room) =>
    `${room.name} ${room.description || ""}`
      .toLowerCase()
      .includes(search)
  );

  const majorRooms = filteredRooms.filter((room) => room.kind === "major");
  const courseRooms = filteredRooms.filter((room) => room.kind === "course");

  return (
    <div className="chat-room-list">

      <Heading level={2}>المحادثات</Heading>

      <input
        className="chat-room-search"
        type="search"
        placeholder="ابحث عن غرفة"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="ابحث عن غرفة"
      />

      {/* 3. Major chat rooms */}
      <div className="chat-room-group">
        <Text>غرفة التخصص</Text>

        {majorRooms.map((room) => (
          <ChatRoomEntry
            key={room.id}
            room={room}
            isActive={activeRoom?.id === room.id}
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
              isActive={activeRoom?.id === room.id}
              onOpen={() => onOpenRoom(room)}
            />
          ))
        ) : (
          <Text tone="muted" size="small">
            سجل في مقرر للانضمام إلى محادثته.
          </Text>
        )}
      </div>
      {/* Discover courses */}
      <Link to="/courses" className="chat-room-discover">
        استكشف المقررات
      </Link>
    </div>
  );
}

// ==========================================
// 5. DISPLAY A SINGLE CHAT ROOM
// Reusable button for each room.
// ==========================================

function ChatRoomEntry({ room, onOpen, isActive }) {
  return (
    <button
      type="button"
      className={`chat-room-entry chat-room-entry-${room.kind} ${isActive ? "chat-room-entry--active" : ""}`}
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