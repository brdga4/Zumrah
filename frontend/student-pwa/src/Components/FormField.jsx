import { useId } from "react";
import "./FormField.css";

// Both native controls use the same label and announce errors in the same way.
export default function FormField({ as: Control, id, label, error, ...controlProps }) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;
  const describedBy = [controlProps["aria-describedby"], error && errorId]
    .filter(Boolean).join(" ") || undefined;

  return (
    <div className="zumrah-field">
      <label htmlFor={fieldId}>{label}</label>
      <Control
        {...controlProps}
        id={fieldId}
        aria-invalid={error ? true : controlProps["aria-invalid"]}
        aria-describedby={describedBy}
      />
      <span className="zumrah-field-error" id={errorId} role="alert">{error}</span>
    </div>
  );
}
