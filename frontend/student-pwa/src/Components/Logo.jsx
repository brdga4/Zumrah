// Import the Logo styles
import "./Logo.css";

// Shared component for displaying the Zumrah logo
export default function Logo({
  size = "small",
  weight = "bold",
  tone = "primary",
  className = "",
  ...props
}) {
  // Render the logo with its selected styles
  return (
    <span
      className={`logo logo-${size} logo-${weight} logo-${tone} ${className}`}
      aria-label="زُمْرَة"
      {...props}
    >
      زُمْرَة
    </span>
  );
}