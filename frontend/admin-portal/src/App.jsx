import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';
import MajorManagementPage from './Features/Academics/Components/MajorManagementPage';
import AdminLoginPage from './Features/Auth/Components/AdminLoginPage';
import AdminDashboard from './Features/Dashboard/AdminDashboard';
import CollegeManagementPage from './Features/Academics/Components/CollegeManagementPage';
import AdminLayout from './Components/AdminLayout';
import CourseManagementPage from './Features/Academics/Components/CourseManagementPage';

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
            <Route path="/academics/colleges" element={<CollegeManagementPage />} />
            <Route path="/academics/majors" element={<MajorManagementPage />} />
            <Route path="/academics/courses" element={<CourseManagementPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;