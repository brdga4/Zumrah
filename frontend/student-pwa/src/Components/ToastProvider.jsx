import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { ToastContext } from "./ToastContext";
import "./Toast.css";

const AUTO_DISMISS_MS = 6000;
const TOAST_ICONS = { success: CircleCheck, error: CircleAlert, info: Info };
const TOAST_LABELS = { success: "نجاح", error: "خطأ", info: "معلومة" };

function Toast({ notification, onDismiss }) {
  const { id, instanceId, type, message } = notification;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const remainingTime = useRef(AUTO_DISMISS_MS);
  const paused = hovered || focused;
  const Icon = TOAST_ICONS[type];

  useEffect(() => {
    // Errors stay visible; other messages pause while the user reads or focuses them.
    if (type === "error" || paused) return;

    const startedAt = performance.now();
    const timeoutId = window.setTimeout(() => onDismiss(id, instanceId), remainingTime.current);

    return () => {
      // Preserve the remaining duration and cancel timers on dismissal or unmount.
      window.clearTimeout(timeoutId);
      remainingTime.current = Math.max(0, remainingTime.current - (performance.now() - startedAt));
    };
  }, [id, instanceId, type, paused, onDismiss]);

  return (
    <div
      className={`zumrah-toast zumrah-toast--${type}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <Icon className="zumrah-toast__icon" size={22} aria-hidden="true" />
      <p className="zumrah-toast__message">
        <span className="zumrah-toast__label">{TOAST_LABELS[type]}: </span>
        {message}
      </p>
      <button
        type="button"
        className="zumrah-toast__close"
        aria-label="إغلاق الإشعار"
        onClick={() => onDismiss(id, instanceId)}
      >
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

export default function ToastProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id, instanceId) => {
    // An old timer must not dismiss a newer notification that reuses the public ID.
    setNotifications((current) => current.filter((notification) => (
      notification.id !== id ||
      (instanceId !== undefined && notification.instanceId !== instanceId)
    )));
  }, []);

  const notify = useCallback(({ type = "info", message, id } = {}) => {
    // Keep success toasts disabled except for file upload confirmation.
    if (type === "success" && id !== "course-file-upload-success") return;
    if (typeof message !== "string" || !message.trim()) return;

    const instanceId = ++nextId.current;
    const notification = {
      id: id ?? `zumrah-toast-${instanceId}`,
      instanceId,
      type: Object.hasOwn(TOAST_ICONS, type) ? type : "info",
      message,
    };

    // A caller-supplied ID prevents repeated feedback for the same action while visible.
    setNotifications((current) => {
      if (current.some((item) => item.id === notification.id)) return current;
      return [...current, notification];
    });

    return notification.id;
  }, []);

  const context = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <ToastContext.Provider value={context}>
      {children}
      {/* Keep the live region mounted so new messages are announced without moving focus. */}
      <section
        className="zumrah-toasts"
        dir="rtl"
        aria-label="الإشعارات"
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions"
      >
        {notifications.map((notification) => (
          <Toast key={notification.instanceId} notification={notification} onDismiss={dismiss} />
        ))}
      </section>
    </ToastContext.Provider>
  );
}
