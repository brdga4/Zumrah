import "./platform.css";
import Heading from "../Heading";
import Text from "../Text";
import Sidebar from "./Sidebar";

export default function PlatformLayout({
  active,
  title,
  subtitle,
  children,
}) {
  const isHome = active === "home";

  return (
    <div className={isHome ? "platform platform--home" : "platform"} dir="rtl">
      <Sidebar active={active} />

      <div className="platform-main">
        <main className={isHome ? "platform-content platform-content--home" : "platform-content"}>
          {title && (
            <Heading
              level={1}
              className={`platform-page-title${isHome ? " platform-page-title--hidden" : ""}`}
            >
              {title}
            </Heading>
          )}

          {subtitle && !isHome && (
            <Text size="small" tone="muted" className="platform-page-subtitle">
              {subtitle}
            </Text>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}