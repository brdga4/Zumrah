// BrowserRouter: Enables routing in the application.
// Routes: Groups all the routes together.
// Route: Maps a URL path to a specific component.
// Navigate: Redirects the user to another route.
import { Fragment, useEffect, useSyncExternalStore } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import {
  clearAccessToken,
  getAccessToken,
  getTokenExpirationTime,
  notifyAuthChange,
  subscribeToAuthChanges,
} from './Features/Auth/authSession';

import LoginPage from './Features/Auth/Components/LoginPage';
import SignupPage from './Features/Auth/SignupPage';
import OtpVerification from './Features/Auth/OtpVerification';
import HomePage from './Features/Students/HomePage';
import ProfilePage from "./Features/Students/ProfilePage";
import CoursesPage from './Features/Courses/CoursesPage';
import CourseFilesPage from "./Features/Materials/CourseFilesPage";

// Redirect unauthenticated users to login.(home page is protected)
function ProtectedRoute({ children }) {
  const token = useSyncExternalStore(subscribeToAuthChanges, getAccessToken);

  useEffect(() => {
    if (!token) return;

    const expiryTime = getTokenExpirationTime(token);
    let timeoutId;

    function checkExpiration() {
      clearTimeout(timeoutId);
      const remainingTime = expiryTime - Date.now();

      if (remainingTime <= 0) {
        clearAccessToken(token);
        return;
      }

      // Also pick up token removal/replacement while this tab was suspended.
      notifyAuthChange();
      // Browsers cannot schedule a single timeout longer than about 24.8 days.
      timeoutId = setTimeout(checkExpiration, Math.min(remainingTime, 2147483647));
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') checkExpiration();
    }

    checkExpiration();
    window.addEventListener('focus', checkExpiration);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('focus', checkExpiration);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // A replacement token must not retain the previous student's page/chat state.
  return <Fragment key={token}>{children}</Fragment>;
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
