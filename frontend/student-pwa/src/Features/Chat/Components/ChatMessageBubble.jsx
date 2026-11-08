
import { useEffect, useRef, useState } from "react";

// Import the report dialog component
import ReportMessageDialog from "./ReportMessageDialog";

import "./ChatMessageBubble.css";

// Receive the message data and whether it belongs to the current student
export default function ChatMessageBubble({ message, isOutgoing }) {

  // State: Controls whether the three-dot menu is visible
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // State: Controls whether the report dialog is visible
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  // State: Tracks successful reports during this component's lifetime
  const [isReported, setIsReported] = useState(false);

  // Ref: Holds a reference to the message actions HTML element
  const menuRef = useRef(null);

  // Only allow reporting other students' messages with a valid message ID
  const canReport = !isOutgoing && Boolean(message.messageId);

  // Close the three-dot menu when clicking outside of it
  useEffect(() => {

    // Do not register the event listener if the menu is closed
    if (!isMenuOpen) return;

    function handleOutsideClick(event) {

      // Check whether the clicked element is outside the menu container
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    // Listen for clicks outside the menu
    document.addEventListener("pointerdown", handleOutsideClick);

    // Remove the listener when the menu closes or component unmounts
    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };

  }, [isMenuOpen]);

  // Render the message bubble and its available actions
  return (
    <>
      <div
        className={`chat-message ${isOutgoing ? "outgoing" : "incoming"}`}
      >

        {/* Show message options only for incoming messages */}
        {canReport && (
          <div className="chat-message-actions" ref={menuRef}>

            {/* Button that opens or closes the options menu */}
            <button
              type="button"
              className="chat-message-options-button"
              aria-label="خيارات الرسالة"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              ⋯
            </button>

            {/* Render the dropdown only when the menu is open */}
            {isMenuOpen && (
              <div className="chat-message-menu" dir="rtl">

                {/* Option to report this specific message */}
                <button
                  type="button"
                  className="chat-message-report-option"
                  disabled={isReported}
                  onClick={() => {

                    // Close the dropdown menu
                    setIsMenuOpen(false);

                    // Open the report dialog
                    setIsReportDialogOpen(true);
                  }}
                >

                  {/* Flag icon */}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 22V4" />
                    <path d="M4 4c4-3 8 3 12 0v12c-4 3-8-3-12 0" />
                  </svg>

                  {/* Display the report status */}
                  {isReported
                    ? "تم الإبلاغ عن الرسالة"
                    : "الإبلاغ عن الرسالة"}

                </button>
              </div>
            )}
          </div>
        )}

        {/* Original message bubble */}
        <div className="chat-bubble">

          {/* Name of the student who sent the message */}
          <span className="chat-sender">
            {message.studentName}
          </span>

          {/* Message text */}
          <p className="chat-text">
            {message.content}
          </p>

          {/* Show the timestamp only when sentAt exists */}
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

      {/* Render the report dialog for the selected message */}
      {isReportDialogOpen && (
        <ReportMessageDialog

          message={message}
          onClose={() => setIsReportDialogOpen(false)}
          onReported={() => setIsReported(true)}
        />
      )}
    </>
  );
}

