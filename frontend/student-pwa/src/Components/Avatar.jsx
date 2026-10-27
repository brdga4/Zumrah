// Import Avatar styles
import "./Avatar.css";

// Shared component that displays the first letter of a user's name
export default function Avatar({
  name,
  size = "default",
  className = "",
  ...props
}) {
  // Render the avatar using the first letter of the name
  return (
    <span
      className={`avatar avatar-${size} ${className}`}
      aria-hidden="true"
      {...props}
    >
      {name.trim().charAt(0)}
    </span>
  );
}