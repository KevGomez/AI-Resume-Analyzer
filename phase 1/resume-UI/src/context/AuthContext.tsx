import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { auth } from "../config/firebase";
import { User } from "firebase/auth";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const TOKEN_EXPIRY_KEY = "token_expiry";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to check if the session is valid
  const checkSession = async (): Promise<boolean> => {
    try {
      const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (!expiryTime) {
        return false;
      }

      const isExpired = Date.now() > parseInt(expiryTime);
      if (isExpired) {
        await logout();
        return false;
      }

      // If user exists and token is not expired, session is valid
      return !!currentUser;
    } catch (error) {
      console.error("Error checking session:", error);
      return false;
    }
  };

  // Function to handle logout
  const logout = async (): Promise<void> => {
    try {
      await auth.signOut();
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      setCurrentUser(null);
      window.location.href = "/login"; // Use window.location for navigation
    } catch (error) {
      console.error("Error logging out:", error);
      setError("Failed to log out");
    }
  };

  // Effect to handle auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      async (user) => {
        if (user) {
          // Get the user's ID token
          const token = await user.getIdToken();
          // Set token expiry time
          localStorage.setItem(
            TOKEN_EXPIRY_KEY,
            (Date.now() + SESSION_DURATION).toString()
          );
          setCurrentUser(user);
        } else {
          // If no user, clear session
          localStorage.removeItem(TOKEN_EXPIRY_KEY);
          setCurrentUser(null);
        }
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    // Check session validity on mount
    const checkInitialSession = async () => {
      const isValid = await checkSession();
      if (!isValid && window.location.pathname !== "/login") {
        window.location.href = "/login"; // Use window.location for navigation
      }
    };
    checkInitialSession();

    // Set up periodic session checks
    const sessionCheckInterval = setInterval(async () => {
      const isValid = await checkSession();
      if (!isValid && window.location.pathname !== "/login") {
        window.location.href = "/login"; // Use window.location for navigation
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      unsubscribe();
      clearInterval(sessionCheckInterval);
    };
  }, []);

  const value = {
    currentUser,
    loading,
    error,
    logout,
    checkSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
