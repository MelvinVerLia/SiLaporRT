import { useState, useEffect } from "react";
import { User, Role } from "../types/auth.types";

// Mock hook - nanti akan diganti dengan real implementation
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data untuk development
    setTimeout(() => {
      // Uncomment salah satu untuk testing

      // Mock Citizen User
      // setUser({
      //   id: "1",
      //   name: "John Doe",
      //   email: "john@example.com",
      //   phone: "08123456789",
      //   role: Role.CITIZEN,
      //   isActive: true,
      //   createdAt: "2024-01-01",
      //   updatedAt: "2024-01-01",
      // });

      // Mock RT Admin User
      // setUser({
      //   id: "2",
      //   name: "Pak RT",
      //   email: "rt@example.com",
      //   phone: "08123456788",
      //   role: Role.RT_ADMIN,
      //   isActive: true,
      //   createdAt: "2024-01-01",
      //   updatedAt: "2024-01-01",
      // });

      // Mock No User (Guest)
      setUser(null);

      setIsLoading(false);
    }, 1000);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login
    setIsLoading(true);
    // Implementation akan ditambahkan nanti
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
};
