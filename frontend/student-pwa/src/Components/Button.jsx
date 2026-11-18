import "./Button.css";

export default function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  size = "lg",
  fullWidth = false,
  className,
  loading = false,
  ...rest
}) {
  // Build a list of CSS classes using the base style, variant, size,
  // optional full-width style, and any custom class passed by the page.

  const buttonClassName = [
    "zumrah-button",
    `zumrah-button--${variant}`,
    `zumrah-button--${size}`,
    fullWidth && "zumrah-button--full-width",
    className,

    // filter(Boolean) removes false, undefined, and empty values.
    // join(" ") combines the remaining classes into one space-separated string for className.
  ].filter(Boolean).join(" ");

  return (
    <button
      {...rest}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading ? true : rest["aria-busy"]}
      className={buttonClassName}
    >
      {children}
    </button>
  );
}
