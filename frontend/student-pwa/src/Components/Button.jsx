import "./Button.css";
export default function Button({ children,
  onClick,
  type = "button",
  disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="zumrah-button"
    >
      {children}
    </button>
  );
}
