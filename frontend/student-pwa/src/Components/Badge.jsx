// Import the Badge styles
import "./Badge.css";

// Shared component used to display small status labels, such as "Enrolled" or "Available".
export default function Badge({ variant = "solid", className = "", ...props }) {

  // Return a span element with the selected CSS variant
  return (
    <span
      className={`badge badge-${variant} ${className}`}
      {...props}
    />
  );
}