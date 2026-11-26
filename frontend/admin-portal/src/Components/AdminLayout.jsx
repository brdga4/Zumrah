import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Building2,
  FileCheck2,
  Flag,
  LayoutDashboard,
  Link2,
} from 'lucide-react';
import PlatformLayout from '@student/Components/Platform/PlatformLayout';

const adminItems = [
  {
    id: 'dashboard',
    label: 'لوحة التحكم',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'colleges',
    label: 'الكليات',
    href: '/academics/colleges',
    icon: Building2,
  },
  {
    id: 'courses',
    label: 'المقررات',
    href: '/academics/courses',
    icon: BookOpen,
  },
  {
    id: 'course-assignments',
    label: 'إسناد المقررات',
    href: '/academics/course-assignments',
    icon: Link2,
  },
  {
    id: 'files',
    label: 'مراجعة الملفات',
    href: '/moderation/files',
    icon: FileCheck2,
  },
  {
    id: 'reports',
    label: 'بلاغات الرسائل',
    href: '/moderation/reports',
    icon: Flag,
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeItem =
    adminItems.find((item) => item.href === location.pathname)?.id ||
    'dashboard';

  function handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('admin');

    navigate('/login', { replace: true });
  }

  return (
    <PlatformLayout
      active={activeItem}
      sidebarProps={{
        items: adminItems,
        brandHref: '/dashboard',
        brandId: 'dashboard',
        onLogout: handleLogout,
      }}
    >
      <Outlet />
    </PlatformLayout>
  );
}
