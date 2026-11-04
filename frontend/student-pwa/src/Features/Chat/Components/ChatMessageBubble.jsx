import "./ChatMessageBubble.css";

export default function ChatMessageBubble({ message, isOutgoing }) {
  return (
    <div
      className={
        isOutgoing
          ? "chat-message outgoing"
          : "chat-message incoming"
      }
    >
      <div className="chat-bubble">
        <span className="chat-sender">
          {message.studentName}
        </span>

        <p className="chat-text">
          {message.content}
        </p>
        {message.sentAt && (
          <time className="chat-time" dateTime={message.sentAt}>
            {new Date(message.sentAt).toLocaleTimeString("en-US", {
              timeZone: "Asia/Riyadh",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        )}
      </div>
    </div>
  );
}
