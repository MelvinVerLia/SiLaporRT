import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import AuthLoadingScreen from "../components/ui/AuthLoadingScreen";

export default function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, isLoggingOut } = useAuthContext();

  if (isLoggingOut) {
    return <AuthLoadingScreen message="Sedang keluar..." />;
  }

  if (isLoading) {
    return <AuthLoadingScreen message="Memeriksa status login..." />;
  }

  if (isAuthenticated) return <Navigate to="/" replace />;

  return children;
}
