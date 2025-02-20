import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { injectThemeScript } from "./utils/themeScript";

// Lazy load components
const MainLayout = lazy(() => import("./layouts/MainLayout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Upload = lazy(() => import("./pages/Upload"));
const Analysis = lazy(() => import("./pages/Analysis"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ProtectedRoute = lazy(() => import("./components/auth/ProtectedRoute"));

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen bg-dark-300">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

// Inject theme script immediately in a self-executing function
(() => {
  if (typeof window !== "undefined") {
    injectThemeScript();
  }
})();

function App() {
  // Ensure theme is applied after hydration
  useEffect(() => {
    const theme =
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    document.documentElement.classList.add(theme);
  }, []);

  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Auth Routes */}
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="upload"
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              }
            />
            <Route
              path="analysis"
              element={
                <ProtectedRoute>
                  <Analysis />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
