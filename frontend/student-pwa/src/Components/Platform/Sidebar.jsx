// 1. Import shared components and React Router
import { Link } from "react-router-dom";
import Logo from "../Logo";
import Avatar from "../Avatar";
import Text from "../Text";

// 2. Define navigation items
const items = [
  { id: "home", label: "الرئيسية", href: "/home" },
  { id: "profile", label: "الملف الشخصي", href: "/profile" },
];

// 3. Receive student data and active page
export default function Sidebar({ active, studentName, majorName }) {
  return (
    <aside className="platform-sidebar">

      {/* 4. Display the Zumrah logo */}
      <Link to="/home" className="platform-sidebar-brand">
        <Logo size="small" />
      </Link>

      {/* 5. Display navigation links */}
      <nav className="platform-sidebar-nav">
        <Text className="platform-sidebar-label">القائمة</Text>

        {items.map((item) => (
          <Link
            key={item.id}
            to={item.href}
            className={`nav-link ${active === item.id ? "is-active" : ""}`}
            aria-current={active === item.id ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* 6. Display student information */}
      <div className="platform-sidebar-footer">
        <div className="platform-sidebar-user">
          <Avatar name={studentName} />

          <div className="platform-sidebar-user-text">
            <Text size="small" weight="semibold">
              {studentName}
            </Text>

            <Text size="small" tone="muted">
              {majorName}
            </Text>
          </div>
        </div>
      </div>

    </aside>
  );
}