import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuthContext } from "../contexts/AuthContext";

export default function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthContext();

  // Saat status sesi belum pasti, jangan render apa-apa (hindari flicker)
  if (isLoading) return null;

  // Kalau sudah login, lempar ke home
  if (isAuthenticated) return <Navigate to="/" replace />;

  return children;
}
