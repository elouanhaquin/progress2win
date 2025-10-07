import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Layout } from './components/Layout';
import { LoadingSpinner } from './components/UI';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Main Pages
import { DashboardPage } from './pages/DashboardPage';

// Lazy load other pages
const ProgressPage = React.lazy(() => import('./pages/ProgressPage'));
const ComparePage = React.lazy(() => import('./pages/ComparePage'));
const LeaderboardPage = React.lazy(() => import('./pages/LeaderboardPage'));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
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

        {/* Protected Routes */}
        <Route
          path="/"
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
          path="/notifications"
          element={
            <ProtectedRoute>
              <Layout>
                <React.Suspense fallback={<PageLoading />}>
                  <NotificationsPage />
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

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
