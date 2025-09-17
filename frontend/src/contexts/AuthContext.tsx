import { createContext, useContext } from "react";
import { useAuth } from "../hooks/useAuth"; // your existing hook

const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth(); // 🔥 one instance for the whole app
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
};
