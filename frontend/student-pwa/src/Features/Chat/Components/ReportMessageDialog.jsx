
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// API function responsible for sending the report
import { reportMessage } from "../chatApi";

import "./ReportMessageDialog.css";

// Available reporting reasons
// label: Arabic text displayed to the student
// value: English text sent to the backend
const REPORT_REASONS = [
  {
    label: "محتوى مسيء أو غير لائق",
    value: "Inappropriate content",
  },
  {
    label: "رسائل مزعجة أو إعلانات",
    value: "Spam",
  },
  {
    label: "معلومات مضللة",
    value: "Misinformation",
  },
  {
    label: "سبب آخر",
    value: "Other",
  },
];

// Receive the selected message and callback functions from the parent
export default function ReportMessageDialog({
  message,
  onClose,
  onReported,
}) {

  // State: Stores the selected reason (first option selected by default)
  const [reason, setReason] = useState(REPORT_REASONS[0].value);

  // State: Tracks whether the API request is in progress
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State: Stores any error message returned during submission
  const [error, setError] = useState("");

  // State: Controls the success confirmation screen
  const [isReported, setIsReported] = useState(false);

  // Allow the student to close the dialog by pressing Escape
  useEffect(() => {

    function handleKeyDown(event) {

      // Prevent closing the dialog while submitting a report
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    // Listen for keyboard events
    document.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };

  }, [isSubmitting, onClose]);

  // Send the report to the backend
  async function handleReport() {

    // Prevent duplicate requests while the first one is processing
    if (isSubmitting) return;

    // Start loading and clear any previous error
    setIsSubmitting(true);
    setError("");

    try {

      // POST /api/messages/{messageId}/reports
      // Pass the message ID and the selected reason
      await reportMessage(message.messageId, reason);

      // Inform the parent that the message was reported
      onReported();

      // Show the confirmation screen instead of closing the dialog
      setIsReported(true);

    } catch (err) {

      // Handle different HTTP errors returned by the backend
      if (err.status === 409) {
        setError("سبق لك الإبلاغ عن هذه الرسالة.");

      } else if (err.status === 403) {
        setError("ليس لديك صلاحية للإبلاغ عن هذه الرسالة.");

      } else if (err.status === 404) {
        setError("الرسالة غير موجودة.");

      } else {
        setError("تعذر إرسال البلاغ. حاول مرة أخرى.");
      }

    } finally {

      // Stop the loading state whether the request succeeds or fails
      setIsSubmitting(false);
    }
  }

  // createPortal renders the dialog directly inside document.body
  // This prevents the chat scroll container from clipping the dialog
  // Normally, return (...) renders JSX inside the component's usual HTML location.
  // Here, return createPortal(...) renders the JSX in a different HTML location.
  // createPortal() is a function imported from react-dom.
  // document.body refers to the <body> element of the HTML page.
  // We use it to display the report dialog directly inside <body>,
  // instead of inside the chat container, so scrolling and overflow
  // do not clip the dialog and it can appear above the entire page.
  return createPortal(
    <div
      className="report-dialog-overlay"
      dir="rtl"
      onMouseDown={(event) => {

        // Close only when clicking outside the dialog
        if (
          event.target === event.currentTarget &&
          !isSubmitting
        ) {
          onClose();
        }
      }}
    >
      {/* Main dialog container */}
      <section
        className="report-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-dialog-title"
        aria-describedby="report-dialog-description"
      >

        {/* Show confirmation after a successful report */}
        {isReported ? (
          <div className="report-success">

            {/* Success heading */}
            <h2
              className="report-dialog-title"
              id="report-dialog-title"
            >
              تم إرسال البلاغ
            </h2>

            {/* Success message */}
            <p
              className="report-dialog-description"
              id="report-dialog-description"
            >
              تم إرسال البلاغ بنجاح، وهو بانتظار المراجعة.
            </p>

            {/* Close the confirmation dialog */}
            <div className="report-dialog-actions">
              <button
                type="button"
                className="report-dialog-cancel"
                onClick={onClose}
              >
                إغلاق
              </button>
            </div>
          </div>

        ) : (

          /* Show the report form before successful submission */
          <>
            {/* Warning icon */}
            <div
              className="report-dialog-warning"
              aria-hidden="true"
            >
              !
            </div>

            {/* Dialog heading */}
            <h2
              className="report-dialog-title"
              id="report-dialog-title"
            >
              الإبلاغ عن رسالة
            </h2>

            {/* Description with the sender's name */}
            <p
              className="report-dialog-description"
              id="report-dialog-description"
            >
              سيراجع مشرفو الزمرة رسالة{" "}
              <strong>
                {message.studentName || "الطالب"}
              </strong>.
            </p>

            {/* Preview the reported message */}
            <blockquote className="report-dialog-quote">
              {message.content}
            </blockquote>

            {/* Available reporting reasons */}
            <fieldset
              className="report-dialog-reasons"
              disabled={isSubmitting}
            >
              <legend>سبب البلاغ</legend>

              {/* Display each reason as a radio button */}
              {REPORT_REASONS.map((option) => (
                <label
                  key={option.value}
                  className={`report-dialog-reason ${
                    reason === option.value ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={option.value}
                    checked={reason === option.value}
                    onChange={() => setReason(option.value)}
                  />

                  <span>{option.label}</span>
                </label>
              ))}
            </fieldset>

            {/* Display the backend error if one exists */}
            {error && (
              <p className="report-dialog-error" role="alert">
                {error}
              </p>
            )}

            {/* Report form buttons */}
            <div className="report-dialog-actions">

              {/* Cancel without submitting */}
              <button
                type="button"
                className="report-dialog-cancel"
                onClick={onClose}
                disabled={isSubmitting}
              >
                إلغاء
              </button>

              {/* Submit the report to the backend */}
              <button
                type="button"
                className="report-dialog-submit"
                onClick={handleReport}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "جارٍ الإرسال..."
                  : "إرسال البلاغ"}
              </button>
            </div>
          </>
        )}

      </section>
    </div>,

    // Render outside the parent's DOM tree
    document.body
  );
}
