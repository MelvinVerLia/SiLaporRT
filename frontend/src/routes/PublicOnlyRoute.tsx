import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import AuthLoadingScreen from "../components/ui/AuthLoadingScreen";

export default function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, isLoggingOut } = useAuthContext();

  // Jika sedang logout, tampilkan logout loading screen
  if (isLoggingOut) {
    return <AuthLoadingScreen message="Sedang keluar..." />;
  }

  // Saat status sesi belum pasti, jangan render apa-apa (hindari flicker)
  if (isLoading) {
    return <AuthLoadingScreen message="Memeriksa status login..." />;
  }

  // Kalau sudah login, lempar ke home
  if (isAuthenticated) return <Navigate to="/" replace />;

  return children;
}
