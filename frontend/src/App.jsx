import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import AuthPage           from './pages/AuthPage.jsx';
import AdminLoginPage     from './pages/AdminLoginPage.jsx';
import OrganizerDashboard from './pages/OrganizerDashboard.jsx';
import AttendeePortal     from './pages/AttendeePortal.jsx';
import AnalyticsDashboard from './pages/AnalyticsDashboard.jsx';

// ── Loading screen ──────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div style={{
    minHeight: '100vh', background: '#050505',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <div style={{
      width: '2rem', height: '2rem',
      border: '2px solid rgba(255,255,255,0.12)',
      borderTopColor: 'rgba(255,255,255,0.6)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }} />
  </div>
);

// ── Protected route ─────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  // Role guard — if roles specified, check membership
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/portal" replace />;
  }

  return <>{children}</>;
};

// ── Role-based default redirect ─────────────────────────────────────────────
const HomeRedirect = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (user?.role === 'ROLE_ORGANIZER' || user?.role === 'ROLE_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/portal" replace />;
};

// ── App routes ──────────────────────────────────────────────────────────────
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public — regular auth page */}
      <Route
        path="/auth"
        element={isAuthenticated ? <HomeRedirect /> : <AuthPage />}
      />

      {/* Admin-only login portal */}
      <Route
        path="/adminlogin"
        element={isAuthenticated && user?.role === 'ROLE_ADMIN' ? <Navigate to="/admin/dashboard" replace /> : <AdminLoginPage />}
      />

      {/* Admin dashboard — analytics scoped to all events */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute roles={['ROLE_ADMIN']}>
            <AnalyticsDashboard />
          </ProtectedRoute>
        }
      />

      {/* Organizer / Admin dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={['ROLE_ORGANIZER', 'ROLE_ADMIN']}>
            <OrganizerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Attendee portal (all authenticated users can see events) */}
      <Route
        path="/portal"
        element={
          <ProtectedRoute>
            <AttendeePortal />
          </ProtectedRoute>
        }
      />

      {/* Analytics — organizer/admin only */}
      <Route
        path="/analytics"
        element={
          <ProtectedRoute roles={['ROLE_ORGANIZER', 'ROLE_ADMIN']}>
            <AnalyticsDashboard />
          </ProtectedRoute>
        }
      />

      {/* Root → smart redirect based on role */}
      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
