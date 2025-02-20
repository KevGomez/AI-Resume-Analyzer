import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser, loading, checkSession } = useAuth();
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const validateSession = async () => {
      const isValid = await checkSession();
      setIsValidSession(isValid);
    };
    validateSession();
  }, [checkSession]);

  if (loading || isValidSession === null) {
    return <LoadingSpinner />;
  }

  if (!currentUser || !isValidSession) {
    // Redirect to login while saving the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
