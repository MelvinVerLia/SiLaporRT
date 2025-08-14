import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ReactNode } from "react";

export default function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Saat status sesi belum pasti, jangan render apa-apa (hindari flicker)
  if (isLoading) return null;

  // Kalau sudah login, lempar ke home
  if (isAuthenticated) return <Navigate to="/" replace />;

  return children;
}
