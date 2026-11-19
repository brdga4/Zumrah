import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import "./Dialog.css";

export default function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  busy = false,
  dismissOnBackdrop = true,
  initialFocusRef,
  returnFocusRef,
}) {
  const dialogRef = useRef(null);
  const titleRef = useRef(null);
  const backdropPointerRef = useRef(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const preferredReturnTarget = returnFocusRef?.current;

    // showModal() supplies the top layer, keyboard containment and inert background.
    if (!dialog.open) dialog.showModal();

    const initialFocus = initialFocusRef?.current;
    const focusTarget = initialFocus && !initialFocus.disabled
      ? initialFocus
      : titleRef.current;
    focusTarget?.focus({ preventScroll: true });

    return () => {
      if (dialog.open) dialog.close();

      // A caller can supply a persistent target when the opening control disappears.
      const returnTarget = preferredReturnTarget?.isConnected ? preferredReturnTarget : previousFocus;
      if (returnTarget?.isConnected) returnTarget.focus({ preventScroll: true });
    };
  }, [open, initialFocusRef, returnFocusRef]);

  function requestClose() {
    if (!busy) onClose();
  }

  function isBackdropClick(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    return event.target === event.currentTarget && (
      event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom
    );
  }

  return (
    <dialog
      ref={dialogRef}
      className={`zumrah-dialog zumrah-dialog--${size}`}
      dir="rtl"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      aria-busy={busy || undefined}
      onCancel={(event) => {
        // React owns the open state, so Escape requests closure instead of hiding it directly.
        event.preventDefault();
        requestClose();
      }}
      onPointerDown={(event) => {
        backdropPointerRef.current = isBackdropClick(event);
      }}
      onPointerCancel={() => { backdropPointerRef.current = false; }}
      onClick={(event) => {
        // Starting a drag inside the content must not become a backdrop dismissal.
        if (dismissOnBackdrop && backdropPointerRef.current && isBackdropClick(event)) {
          requestClose();
        }
        backdropPointerRef.current = false;
      }}
    >
      <header className="zumrah-dialog-header">
        <div className="zumrah-dialog-heading">
          <h2 id={titleId} ref={titleRef} tabIndex={-1} className="zumrah-dialog-title">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="zumrah-dialog-description">{description}</p>
          )}
        </div>
        <button
          type="button"
          className="zumrah-dialog-close"
          aria-label="إغلاق النافذة"
          disabled={busy}
          onClick={requestClose}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </header>
      {children != null && children !== false && (
        <div className="zumrah-dialog-content">{children}</div>
      )}
      {footer && <footer className="zumrah-dialog-footer">{footer}</footer>}
    </dialog>
  );
}
