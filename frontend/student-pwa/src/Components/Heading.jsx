// Import Heading styles
import "./Heading.css";

// Shared component for displaying headings (h1, h2, h3)
export default function Heading({ level, className = "", ...props }) {

  // Create the HTML heading tag based on the level
  const Tag = `h${level}`;

  // Render the heading with its CSS classes
  return (
    <Tag className={`heading heading-${level} ${className}`} {...props} />
  );
}