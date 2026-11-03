import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './AdminLayout.css';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const admin = getStoredAdmin();
  const adminName = admin?.username || 'المسؤول';

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function handleLogout() {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('admin');

    navigate('/login', { replace: true });
  }

  function getNavigationClass({ isActive }) {
    return `navigation-item${isActive ? ' navigation-item--active' : ''}`;
  }

  return (
    <div
      className={`admin-layout ${isMenuOpen ? 'admin-layout--menu-open' : ''}`}
      dir="rtl"
    >
      <header className="admin-header">
        <div className="admin-brand">
          <strong>زُمرة</strong>
          <span>الإدارة</span>
        </div>

        <button
          className="menu-button"
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
          <span>القائمة</span>
        </button>
      </header>

      <aside className="admin-sidebar">
        <nav className="admin-navigation">
          <p className="navigation-label">عام</p>

          <NavLink
            className={getNavigationClass}
            to="/dashboard"
            onClick={closeMenu}
          >
            لوحة التحكم
          </NavLink>

          <p className="navigation-label">الإدارة الأكاديمية</p>

          <NavLink
            className={getNavigationClass}
            to="/academics/colleges"
            onClick={closeMenu}
          >
            الكليات
          </NavLink>

          <NavLink
            className={getNavigationClass}
            to="/academics/majors"
            onClick={closeMenu}
          >
            التخصصات
          </NavLink>

          <NavLink
            className={getNavigationClass}
            to="/academics/courses"
            onClick={closeMenu}
          >
            المقررات
          </NavLink>

          <span className="navigation-item navigation-item--disabled">
            إسناد المقررات
          </span>

          <p className="navigation-label">الإشراف على المحتوى</p>

          <span className="navigation-item navigation-item--disabled">
            مراجعة الملفات
          </span>

          <span className="navigation-item navigation-item--disabled">
            بلاغات الرسائل
          </span>
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <span className="admin-sidebar__avatar">
              {adminName.charAt(0)}
            </span>

            <div>
              <strong>{adminName}</strong>
              <span>مشرف المنصة</span>
            </div>
          </div>

          <button
            className="logout-button"
            type="button"
            onClick={handleLogout}
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

function getStoredAdmin() {
  const savedAdmin = sessionStorage.getItem('admin');

  if (!savedAdmin) {
    return null;
  }

  try {
    return JSON.parse(savedAdmin);
  } catch {
    return null;
  }
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12h16" />
      <path d="M4 6h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}