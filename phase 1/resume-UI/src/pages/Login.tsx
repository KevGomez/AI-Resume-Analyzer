import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/common/Button";
import { authService } from "../services/authService";
import { LoginFormData } from "../types";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { checkSession } = useAuth();

  const locationState = location.state as LocationState;
  const from = locationState?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      // Verify session is properly set up
      const isValid = await checkSession();
      if (isValid) {
        navigate(from, { replace: true });
      } else {
        setError('Failed to establish session. Please try again.');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred during login'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return <LoadingSpinner text="Logging in..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold mb-4">
            <span className="bg-gradient-to-r from-primary-400 to-accent-400 text-transparent bg-clip-text">
              Welcome Back
            </span>
          </h1>
          <p className="text-white/70 text-lg">
            Sign in to continue to Resume Analyzer
          </p>
        </div>

        <div className="bg-dark-300/30 backdrop-blur-sm border border-white/10 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white/70 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-white/30"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white/70 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-white/30"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              loadingText="Signing in..."
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/50 text-base">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-primary-400 hover:text-primary-300 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
