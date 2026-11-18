import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, LogOut, MessageCircle, UserRound } from "lucide-react";
import Logo from "../Logo";
import { clearAccessToken } from "../../Features/Auth/authSession";

const items = [
  { id: "home", label: "المحادثات", href: "/home", icon: MessageCircle },
  { id: "courses", label: "المقررات", href: "/courses", icon: BookOpen },
  { id: "profile", label: "الملف الشخصي", href: "/profile", icon: UserRound },
];

export default function Sidebar({ active }) {
  const navigate = useNavigate();
  const [tooltipsDismissed, setTooltipsDismissed] = useState(false);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") setTooltipsDismissed(true);
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  function showTooltips() {
    setTooltipsDismissed(false);
  }

  function handleNavigation(event, id) {
    // Keep the current Chat location key and selected room on repeated clicks.
    if (
      active === id &&
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      event.preventDefault();
    }
  }

  function handleLogout() {
    clearAccessToken();
    navigate("/login", { replace: true });
  }

  return (
    <aside
      className={`platform-sidebar${tooltipsDismissed ? " platform-sidebar--tooltips-dismissed" : ""}`}
    >
      <Link
        to="/home"
        className="platform-sidebar-brand"
        aria-label="زمرة - المحادثات"
        onClick={(event) => handleNavigation(event, "home")}
      >
        <Logo size="extra-small" />
      </Link>

      <nav className="platform-sidebar-nav" aria-label="التنقل الرئيسي">
        {items.map(({ id, label, href, icon: Icon }) => (
          <div
            key={id}
            className="platform-nav-item"
            onMouseEnter={showTooltips}
            onFocus={showTooltips}
          >
            <Link
              to={href}
              className={`nav-link${active === id ? " is-active" : ""}`}
              aria-label={label}
              aria-current={active === id ? "page" : undefined}
              aria-describedby={tooltipsDismissed ? undefined : `sidebar-tooltip-${id}`}
              onClick={(event) => handleNavigation(event, id)}
            >
              <Icon size={22} aria-hidden="true" focusable="false" />
            </Link>
            <span id={`sidebar-tooltip-${id}`} role="tooltip" className="platform-nav-tooltip">
              {label}
            </span>
          </div>
        ))}
      </nav>

      <div className="platform-sidebar-footer">
        <div className="platform-nav-item" onMouseEnter={showTooltips} onFocus={showTooltips}>
          <button
            type="button"
            className="nav-link platform-sidebar-logout"
            aria-label="تسجيل الخروج"
            aria-describedby={tooltipsDismissed ? undefined : "sidebar-tooltip-logout"}
            onClick={handleLogout}
          >
            <LogOut size={22} aria-hidden="true" focusable="false" />
          </button>
          <span id="sidebar-tooltip-logout" role="tooltip" className="platform-nav-tooltip">
            تسجيل الخروج
          </span>
        </div>
      </div>
    </aside>
  );
}