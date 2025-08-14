import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ReactNode } from "react";

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: ReactNode;
  requiredRole?: "RT_ADMIN" | "CITIZEN";
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Tahan render sampai status sesi diketahui
  if (isLoading) return null;

  // Belum login -> arahkan ke login, simpan lokasi asal
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Cek role (jika diperlukan)
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
