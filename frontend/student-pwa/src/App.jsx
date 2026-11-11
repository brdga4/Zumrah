// BrowserRouter: Enables routing in the application.
// Routes: Groups all the routes together.
// Route: Maps a URL path to a specific component.
// Navigate: Redirects the user to another route.
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import LoginPage from './Features/Auth/Components/LoginPage';
import SignupPage from './Features/Auth/SignupPage';
import OtpVerification from './Features/Auth/OtpVerification';
import HomePage from './Features/Students/HomePage';
import ProfilePage from "./Features/Students/ProfilePage";
import CoursesPage from './Features/Courses/CoursesPage';
import CourseFilesPage from "./Features/Materials/CourseFilesPage";

// Redirect unauthenticated users to login.(home page is protected)
function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const token = sessionStorage.getItem('accessToken');

  let expiryTime = 0;

  // Read the expiration time from the JWT token.
  if (token) {
    try {
      const payload = JSON.parse(
        atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
      );

      expiryTime = payload.exp * 1000;
    } catch {
      expiryTime = 0;
    }
  }

  useEffect(() => {
    // Redirect immediately if the token is missing or expired.
    if (!token || expiryTime <= Date.now()) {
      sessionStorage.removeItem('accessToken');
      navigate('/login', { replace: true });
      return;
    }

    // Automatically log out when the token expires.
    const timeoutId = setTimeout(() => {
      sessionStorage.removeItem('accessToken');
      navigate('/login', { replace: true });
    }, expiryTime - Date.now());

    return () => clearTimeout(timeoutId);
  }, [token, expiryTime, navigate]);

  if (!token || !expiryTime) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<OtpVerification />} />
        // Protect the home page route to ensure only authenticated users can access it.
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <CoursesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses/:courseId/files"
          element={
            <ProtectedRoute>
              <CourseFilesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
