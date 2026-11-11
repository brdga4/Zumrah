// Import shared platform layout styles
import "./platform.css";
// 1. Import layout components
import Header from "./Header";
import Sidebar from "./Sidebar";

// 2. Receive page information and real student data
export default function PlatformLayout({
  active,
  title,
  subtitle,
  backHref,
  student,
  children,
  showSidebar = true,
  brandHeader = false,
}) {
  // 3. Extract student information from the backend response
  const studentName = student?.name || "طالب";
  const majorName = student?.major?.majorName || "";

  // 4. Render the shared page layout
  return (
    <div
      className={showSidebar ? "platform" : "platform platform--no-sidebar"}
      dir="rtl"
    >
      
      {showSidebar && (
        <Sidebar
          active={active}
          studentName={studentName}
          majorName={majorName}
          showUserInfo={active !== "profile"  && active !== "courses" }
        />
      )}

      <div className="platform-main">
        {/* Hide the header avatar only on the profile page */}
        <Header
          title={title}
          subtitle={subtitle}
          backHref={backHref}
          studentName={studentName}
          majorName={majorName}
          brand={brandHeader}
          showUserInfo={active !== "profile"}
        />

        {/* 5. Display the page content */}
        <main className="platform-content">
          {children}
        </main>
      </div>
    </div>
  );
}