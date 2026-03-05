import { Navigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { Role } from "../types/auth.types";

/**
 * Wraps a child route element and redirects RT_ADMIN users to /admin.
 * Non-admin or unauthenticated users see the child as normal.
 */
export default function AdminRedirect({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) return null;

  if (isAuthenticated && user?.role === Role.RT_ADMIN) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
