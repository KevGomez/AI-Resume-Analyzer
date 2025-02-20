import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ResumeProvider } from '../context/ResumeContext';

// Lazy load components
const MainLayout = lazy(() => import('../layouts/MainLayout'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Upload = lazy(() => import('../pages/Upload'));
const Analysis = lazy(() => import('../pages/Analysis'));
const NotFound = lazy(() => import('../pages/NotFound'));
const Login = lazy(() => import('../pages/Login'));
const Signup = lazy(() => import('../pages/Signup'));
const ProtectedRoute = lazy(() => import('../components/auth/ProtectedRoute'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes - Wrapped in ResumeProvider */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ResumeProvider>
                <MainLayout />
              </ResumeProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="upload" element={<Upload />} />
          <Route path="analysis" element={<Analysis />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
} 