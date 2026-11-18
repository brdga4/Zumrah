import { useEffect } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';

import AdminLayout from './Components/AdminLayout';
import CollegeManagementPage from './Features/Academics/Components/CollegeManagementPage';
import CourseAssignmentPage from './Features/Academics/Components/CourseAssignmentPage';
import CourseManagementPage from './Features/Academics/Components/CourseManagementPage';
import MajorManagementPage from './Features/Academics/Components/MajorManagementPage';
import AdminLoginPage from './Features/Auth/Components/AdminLoginPage';
import AdminDashboard from './Features/Dashboard/AdminDashboard';
import FileReviewPage from './Features/Moderation/Components/FileReviewPage';
import ReportReviewPage from './Features/Moderation/Components/ReportReviewPage';

// JWT exp uses seconds; Date.now() uses milliseconds.
// This is an expiry check only, NOT JWT signature verification.
function getExpiryTime(token) {
  if (!token) return 0;

  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );

    return typeof payload.exp === 'number' ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

function clearAdminStorage() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('admin');
}

function GuestAdminRoute({ children }) {
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    if (token && getExpiryTime(token) <= Date.now()) {
      clearAdminStorage();
    }
  }, [token]);

  return token ? <Navigate to="/dashboard" replace /> : children;
}

function ProtectedAdminRoute() {
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    const expiryTime = getExpiryTime(token);

    if (!token || expiryTime <= Date.now()) {
      clearAdminStorage();
      navigate('/login', { replace: true });
      return undefined;
    }

    const timerId = setTimeout(() => {
      if (
        localStorage.getItem('accessToken') === token &&
        getExpiryTime(token) <= Date.now()
      ) {
        clearAdminStorage();
        navigate('/login', { replace: true });
      }
    }, Math.max(0, expiryTime - Date.now()));

    function handleStorage(event) {
      if (event.key === 'accessToken' && !event.newValue) {
        navigate('/login', { replace: true });
      }
    }

    window.addEventListener('storage', handleStorage);

    return () => {
      clearTimeout(timerId);
      window.removeEventListener('storage', handleStorage);
    };
  }, [token, navigate]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/login"
          element={
            <GuestAdminRoute>
              <AdminLoginPage />
            </GuestAdminRoute>
          }
        />

        <Route element={<ProtectedAdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route
              path="/academics/colleges"
              element={<CollegeManagementPage />}
            />
            <Route
              path="/academics/majors"
              element={<MajorManagementPage />}
            />
            <Route
              path="/academics/courses"
              element={<CourseManagementPage />}
            />
            <Route
              path="/academics/course-assignments"
              element={<CourseAssignmentPage />}
            />
            <Route path="/moderation/files" element={<FileReviewPage />} />
            <Route
              path="/moderation/reports"
              element={<ReportReviewPage />}
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;