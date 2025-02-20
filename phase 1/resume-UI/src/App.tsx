import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { injectThemeScript } from "./utils/themeScript";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import AppRoutes from "./routes/AppRoutes";

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

// Inject theme script immediately
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
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
