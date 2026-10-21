// BrowserRouter: Enables routing in the application.
// Routes: Groups all the routes together.
// Route: Maps a URL path to a specific component.
// Navigate: Redirects the user to another route.
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './Features/Auth/Components/LoginPage';
import SignupPage from './Features/Auth/SignupPage';
import OtpVerification from './Features/Auth/OtpVerification';
import HomePage from './Features/Students/HomePage';

// Redirect unauthenticated users to login.(home page is protected)
function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem('accessToken');

  if (!token) {
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

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
