import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Layout } from './components/Layout';
import { LoadingSpinner } from './components/UI';

// Public Pages
import { LandingPage } from './pages/LandingPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ChangePasswordPage } from './pages/auth/ChangePasswordPage';

// Main Pages
import { DashboardPage } from './pages/DashboardPage';

// Lazy load other pages
const ProgressPage = React.lazy(() => import('./pages/ProgressPage'));
const ComparePage = React.lazy(() => import('./pages/ComparePage'));
const LeaderboardPage = React.lazy(() => import('./pages/LeaderboardPage'));
const GoalsPage = React.lazy(() => import('./pages/GoalsPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const FeedbackPage = React.lazy(() => import('./pages/FeedbackPage'));

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, passwordResetRequired } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user needs to change password, redirect to change-password page
  // But allow access to the change-password page itself
  if (passwordResetRequired && window.location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Home Route Component (shows landing or dashboard based on auth)
const HomeRoute: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return (
      <Layout>
        <DashboardPage />
      </Layout>
    );
  }

  return <LandingPage />;
};

// Loading Component
const PageLoading: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <LoadingSpinner size="lg" />
  </div>
);

const App: React.FC = () => {
  return (
    <div className="App">
      <Routes>
        {/* Home Route - Landing or Dashboard based on auth */}
        <Route path="/" element={<HomeRoute />} />

        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />

        {/* Dashboard Route (for redirects) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/progress/*"
          element={
            <ProtectedRoute>
              <Layout>
                <React.Suspense fallback={<PageLoading />}>
                  <ProgressPage />
                </React.Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/compare"
          element={
            <ProtectedRoute>
              <Layout>
                <React.Suspense fallback={<PageLoading />}>
                  <ComparePage />
                </React.Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Layout>
                <React.Suspense fallback={<PageLoading />}>
                  <LeaderboardPage />
                </React.Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <Layout>
                <React.Suspense fallback={<PageLoading />}>
                  <GoalsPage />
                </React.Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <React.Suspense fallback={<PageLoading />}>
                  <SettingsPage />
                </React.Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <Layout>
                <React.Suspense fallback={<PageLoading />}>
                  <FeedbackPage />
                </React.Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
