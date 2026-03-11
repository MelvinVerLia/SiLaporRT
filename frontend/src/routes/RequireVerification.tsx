import { Navigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import { useEffect, useRef } from "react";

function RequireVerification({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  const toast = useToast();
  const warnedRef = useRef(false);

  const isUnverified =
    user &&
    user.role === "CITIZEN" &&
    user.verificationStatus !== "VERIFIED" &&
    user.isDeleted !== true;

  useEffect(() => {
    if (isUnverified && !warnedRef.current) {
      toast.warning("Akun Anda belum diverifikasi oleh admin RT", "Peringatan");
      warnedRef.current = true;
    }
  }, [isUnverified, toast]);

  if (isUnverified) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}

export default RequireVerification;
