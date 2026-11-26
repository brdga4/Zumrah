import "./platform.css";
import Heading from "../Heading";
import Text from "../Text";
import Sidebar from "./Sidebar";

export default function PlatformLayout({
  active,
  layout = "page",
  title,
  subtitle,
  children,
  sidebarProps
}) {
  // Keep Chat's full-height layout independent of the active navigation item.
  const isChat = layout === "chat";

  return (
    <div className={isChat ? "platform platform--chat" : "platform"} dir="rtl">
      <Sidebar {...sidebarProps} active={active} />

      <div className="platform-main">
        <main className={isChat ? "platform-content platform-content--chat" : "platform-content"}>
          {title && (
            <Heading
              level={1}
              className={`platform-page-title${isChat ? " platform-page-title--hidden" : ""}`}
            >
              {title}
            </Heading>
          )}

          {subtitle && !isChat && (
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