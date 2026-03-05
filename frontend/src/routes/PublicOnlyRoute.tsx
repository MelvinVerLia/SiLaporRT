import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import AuthLoadingScreen from "../components/ui/AuthLoadingScreen";
import { Role } from "../types/auth.types";

export default function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, isLoggingOut, user } = useAuthContext();

  if (isLoggingOut) {
    return <AuthLoadingScreen message="Sedang keluar..." />;
  }

  if (isLoading) {
    return <AuthLoadingScreen message="Memeriksa status login..." />;
  }

  if (isAuthenticated) {
    if (user?.role === Role.RT_ADMIN) return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
