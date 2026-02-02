import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AppLayout from './layouts/AppLayout';

// Loading spinner component
function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: '3px solid #e2e8f0',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <div style={{ color: '#64748b', fontSize: 14 }}>{message}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Protected route wrapper - redirects to login if not authenticated
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const useMockData = import.meta.env.VITE_USE_REAL_API !== 'true';

  if (loading) {
    return <LoadingSpinner />;
  }

  // Skip auth check when using mock data
  if (useMockData) {
    return children;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Auth route wrapper - redirects to app if already authenticated
function AuthRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const useMockData = import.meta.env.VITE_USE_REAL_API !== 'true';

  if (loading) {
    return <LoadingSpinner />;
  }

  // If using mock data or authenticated, redirect to app
  if (useMockData || isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return children;
}

// Landing page wrapper - redirects to app if authenticated
function LandingRoute() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const useMockData = import.meta.env.VITE_USE_REAL_API !== 'true';

  // If authenticated (real API mode), redirect to app
  if (!loading && !useMockData && isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  const handleEnterApp = () => {
    navigate('/app');
  };

  return <LandingPage onEnterApp={handleEnterApp} />;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Routes>
      {/* Landing page - public */}
      <Route path="/" element={<LandingRoute />} />

      {/* Auth routes - redirect to app if already logged in */}
      <Route
        path="/login"
        element={
          <AuthRoute>
            <LoginPage onNavigateToRegister={() => navigate('/register')} />
          </AuthRoute>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRoute>
            <RegisterPage onNavigateToLogin={() => navigate('/login')} />
          </AuthRoute>
        }
      />

      {/* App routes - protected */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
