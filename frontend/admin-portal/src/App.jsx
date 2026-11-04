import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
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

function ProtectedAdminRoute() {
  const accessToken = sessionStorage.getItem('accessToken');

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<AdminLoginPage />} />

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