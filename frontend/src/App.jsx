import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, emailToSlug } from './context/AuthContext.jsx';

// ── Lazy-loaded pages ────────────────────────────────────────────────────────
const LandingPage        = lazy(() => import('./pages/LandingPage.jsx'));
const AuthPage           = lazy(() => import('./pages/AuthPage.jsx'));
const AdminLoginPage     = lazy(() => import('./pages/AdminLoginPage.jsx'));
const OrganizerDashboard = lazy(() => import('./pages/OrganizerDashboard.jsx'));
const OrganizerEventDetails = lazy(() => import('./pages/OrganizerEventDetails.jsx'));
const AttendeePortal     = lazy(() => import('./pages/AttendeePortal.jsx'));
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard.jsx'));

// ── Loading screen ───────────────────────────────────────────────────────────
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

// ── Route guard ──────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles && user && !roles.includes(user.role)) {
    // Redirect mismatch-role users to their own home
    const slug = emailToSlug(user.email);
    if (user.role === 'ROLE_ATTENDEE') return <Navigate to={`/attendee/${slug}/dashboard`} replace />;
    if (user.role === 'ROLE_ORGANIZER') return <Navigate to={`/organizer/${slug}/dashboard`} replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// ── Role-aware home redirect ─────────────────────────────────────────────────
const HomeRedirect = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated) {
    // Show landing page to unauthenticated visitors
    return (
      <Suspense fallback={<LoadingScreen />}>
        <LandingPage />
      </Suspense>
    );
  }

  const slug = emailToSlug(user.email);
  if (user.role === 'ROLE_ADMIN')     return <Navigate to="/admin/dashboard"                   replace />;
  if (user.role === 'ROLE_ORGANIZER') return <Navigate to={`/organizer/${slug}/dashboard`}     replace />;
  return                                     <Navigate to={`/attendee/${slug}/dashboard`}      replace />;
};

// ── App routes ───────────────────────────────────────────────────────────────
const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* ── Public ──────────────────────────────────────────────────────── */}
      <Route path="/" element={<HomeRedirect />} />

      <Route
        path="/login"
        element={
          isAuthenticated
            ? <HomeRedirect />
            : (
              <Suspense fallback={<LoadingScreen />}>
                <AuthPage />
              </Suspense>
            )
        }
      />

      {/* Admin-only login portal */}
      <Route
        path="/adminlogin"
        element={
          isAuthenticated && user?.role === 'ROLE_ADMIN'
            ? <Navigate to="/admin/dashboard" replace />
            : (
              <Suspense fallback={<LoadingScreen />}>
                <AdminLoginPage />
              </Suspense>
            )
        }
      />

      {/* ── Admin ───────────────────────────────────────────────────────── */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute roles={['ROLE_ADMIN']}>
            <Suspense fallback={<LoadingScreen />}>
              <AnalyticsDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* ── Organizer ───────────────────────────────────────────────────── */}
      <Route
        path="/organizer/:username/dashboard"
        element={
          <ProtectedRoute roles={['ROLE_ORGANIZER', 'ROLE_ADMIN']}>
            <Suspense fallback={<LoadingScreen />}>
              <OrganizerDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/organizer/:username/event/:id"
        element={
          <ProtectedRoute roles={['ROLE_ORGANIZER', 'ROLE_ADMIN']}>
            <Suspense fallback={<LoadingScreen />}>
              <OrganizerEventDetails />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* ── Attendee ────────────────────────────────────────────────────── */}
      <Route
        path="/attendee/:username/dashboard"
        element={
          <ProtectedRoute roles={['ROLE_ATTENDEE']}>
            <Suspense fallback={<LoadingScreen />}>
              <AttendeePortal initialTab="discover" />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendee/:username/tickets"
        element={
          <ProtectedRoute roles={['ROLE_ATTENDEE']}>
            <Suspense fallback={<LoadingScreen />}>
              <AttendeePortal initialTab="tickets" />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* ── Legacy alias redirects (keep old bookmarks working) ─────────── */}
      <Route path="/auth"      element={<Navigate to="/login" replace />} />
      <Route path="/portal"    element={<Navigate to="/login" replace />} />
      <Route path="/dashboard" element={<Navigate to="/login" replace />} />
      <Route path="/analytics" element={<Navigate to="/login" replace />} />

      {/* ── Catch-all ───────────────────────────────────────────────────── */}
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
