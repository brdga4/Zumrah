import { useRef } from "react";
import Button from "./Button";
import Dialog from "./Dialog";
import LoadingIndicator from "./LoadingIndicator";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  loadingLabel = "جارٍ التأكيد...",
  destructive = false,
  loading = false,
  error,
  returnFocusRef,
}) {
  const cancelRef = useRef(null);

  // Dialog owns modal behavior; the feature still owns its request, loading and errors.
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={message}
      size="sm"
      busy={loading}
      initialFocusRef={cancelRef}
      returnFocusRef={returnFocusRef}
      footer={
        <>
          {/* Start on Cancel so opening a destructive dialog never primes confirmation. */}
          <Button ref={cancelRef} variant="secondary" size="md" disabled={loading} onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            size="md"
            loading={loading}
            onClick={() => { if (!loading) onConfirm(); }}
          >
            <span className="zumrah-dialog-button-content">
              {loading && <LoadingIndicator inline decorative />}
              {loading ? loadingLabel : confirmLabel}
            </span>
          </Button>
        </>
      }
    >
      {error && <p className="zumrah-dialog-error" role="alert">{error}</p>}
    </Dialog>
  );
}
