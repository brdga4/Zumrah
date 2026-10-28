// Import Text styles
import "./Text.css";

// Shared component for displaying text with different styles
export default function Text({
  tone = "default",
  size = "body",
  weight = "regular",
  className = "",
  ...props
}) {
  // Return a paragraph with the selected CSS classes
  return (
    <p
      className={`text text-${tone} text-${size} text-${weight} ${className}`}
      {...props}
    />
  );
}