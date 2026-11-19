import "./LoadingIndicator.css";

export default function LoadingIndicator({
  label = "جارٍ التحميل...",
  size = "sm",
  inline = false,
  decorative = false,
}) {
  const className = [
    "zumrah-loading",
    `zumrah-loading--${size}`,
    inline && "zumrah-loading--inline",
    decorative && "zumrah-loading--decorative",
  ].filter(Boolean).join(" ");

  // A button can announce its own pending text; decorative mode avoids saying it twice.
  // Otherwise, the visible label is a polite status message for assistive technology.
  return (
    <span
      className={className}
      role={decorative ? undefined : "status"}
      aria-atomic={decorative ? undefined : true}
      aria-hidden={decorative ? true : undefined}
    >
      <span className="zumrah-loading-spinner" aria-hidden="true" />
      {!decorative && <span className="zumrah-loading-label">{label}</span>}
    </span>
  );
}
