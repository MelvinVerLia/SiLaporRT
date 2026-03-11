import { Navigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import { useEffect, useRef } from "react";

function RequireCompleteProfile({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  const toast = useToast();
  const warnedRef = useRef(false);

  const isIncomplete =
    user &&
    (!user.phone || !user.address || !user.rtId) &&
    user.isDeleted !== true;

  useEffect(() => {
    if (isIncomplete && !warnedRef.current) {
      toast.warning("Lengkapi profil terlebih dahulu", "Peringatan");
      warnedRef.current = true;
    }
  }, [isIncomplete, toast]);

  if (isIncomplete) {
    const redirectTo =
      user?.role === "RT_ADMIN" ? "/admin/profile" : "/profile";
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default RequireCompleteProfile;
