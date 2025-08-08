import { useState, useEffect, useCallback } from "react";
import {
  User,
  Role,
  LoginCredentials,
  RegisterData,
  AuthError,
} from "../types/auth.types";
import {
  MOCK_USERS,
  generateMockToken,
  saveAuthData,
  getAuthData,
  clearAuthData,
} from "../utils/auth.utils";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const authData = getAuthData();
      if (authData) {
        setUser(authData.user);
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Enhanced login with validation
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      try {
        // Find user in mock database
        const foundUser = MOCK_USERS.find((u) => u.email === credentials.email);

        if (!foundUser) {
          setError({ message: "Email tidak ditemukan", field: "email" });
          setIsLoading(false);
          return false;
        }

        if (foundUser.password !== credentials.password) {
          setError({ message: "Password salah", field: "password" });
          setIsLoading(false);
          return false;
        }

        if (!foundUser.isActive) {
          setError({ message: "Akun Anda tidak aktif" });
          setIsLoading(false);
          return false;
        }

        // Create user object (exclude password)
        const { password, ...userWithoutPassword } = foundUser;
        const user = userWithoutPassword as User;

        // Generate token and save
        const token = generateMockToken(user.id);
        const authData = { user, token };

        saveAuthData(authData);
        setUser(user);
        setIsLoading(false);

        return true;
      } catch (err) {
        setError({ message: "Terjadi kesalahan saat login" });
        setIsLoading(false);
        return false;
      }
    },
    []
  );

  // Enhanced register
  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // Validate data
      if (data.password !== data.confirmPassword) {
        setError({ message: "Password tidak sama", field: "confirmPassword" });
        setIsLoading(false);
        return false;
      }

      if (data.password.length < 6) {
        setError({ message: "Password minimal 6 karakter", field: "password" });
        setIsLoading(false);
        return false;
      }

      // Check if email already exists
      const existingUser = MOCK_USERS.find((u) => u.email === data.email);
      if (existingUser) {
        setError({ message: "Email sudah terdaftar", field: "email" });
        setIsLoading(false);
        return false;
      }

      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: Role.CITIZEN, // Default role
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add to mock database (in real app, this would be API call)
      MOCK_USERS.push({ ...newUser, password: data.password } as any);

      // Generate token and save
      const token = generateMockToken(newUser.id);
      const authData = { user: newUser, token };

      saveAuthData(authData);
      setUser(newUser);
      setIsLoading(false);

      return true;
    } catch (err) {
      setError({ message: "Terjadi kesalahan saat registrasi" });
      setIsLoading(false);
      return false;
    }
  }, []);

  // Enhanced logout
  const logout = useCallback(() => {
    clearAuthData();
    setUser(null);
    setError(null);
    navigate("/login");
  }, [navigate]);

  // Update user profile
  const updateProfile = useCallback(
    async (updates: Partial<User>): Promise<boolean> => {
      if (!user) return false;

      setIsLoading(true);
      setError(null);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        const updatedUser = {
          ...user,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        // Update in mock database
        const userIndex = MOCK_USERS.findIndex((u) => u.id === user.id);
        if (userIndex !== -1) {
          MOCK_USERS[userIndex] = {
            ...MOCK_USERS[userIndex],
            ...updates,
          } as any;
        }

        // Update localStorage
        const authData = getAuthData();
        if (authData) {
          saveAuthData({ ...authData, user: updatedUser });
        }

        setUser(updatedUser);
        setIsLoading(false);
        return true;
      } catch (err) {
        setError({ message: "Gagal memperbarui profil" });
        setIsLoading(false);
        return false;
      }
    },
    [user]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const sendOTP = useCallback(async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    // Simulasi delay kirim OTP via email
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulasi selalu berhasil kirim OTP
    setIsLoading(false);
    return true;
  }, []);

  const resendOTP = useCallback(async (email: string): Promise<boolean> => {
    // Bisa reuse sendOTP, tapi buat metode terpisah agar UI bisa track loading resend
    setIsLoading(true);
    setError(null);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    return true;
  }, []);

  const verifyOTP = useCallback(
    async (
      email: string,
      otpCode: string,
      userData: RegisterData
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      // Simulasi delay verifikasi
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulasi OTP yang valid adalah "123456"
      if (otpCode !== "123456") {
        setError({ message: "Kode OTP salah" });
        setIsLoading(false);
        return false;
      }

      // OTP valid → lanjut proses registrasi user (re-use fungsi register tapi tanpa confirmPassword dan tanpa kirim OTP lagi)
      // Kita buat versi internal register tanpa validasi confirmPassword dan password length (karena sudah validasi di awal)
      try {
        // Create new user object
        const newUser: User = {
          id: `user_${Date.now()}`,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: Role.CITIZEN,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Add to mock DB
        MOCK_USERS.push({ ...newUser, password: userData.password } as any);

        // Save auth data & set user
        const token = generateMockToken(newUser.id);
        const authData = { user: newUser, token };
        saveAuthData(authData);
        setUser(newUser);

        setIsLoading(false);
        return true;
      } catch {
        setError({
          message: "Gagal melakukan registrasi setelah verifikasi OTP",
        });
        setIsLoading(false);
        return false;
      }
    },
    []
  );

  return {
    // ✅ Same interface as before (backward compatible)
    user,
    isLoading,
    isAuthenticated: !!user,
    login, // Enhanced but same signature for simple login
    logout,

    // ✨ New enhanced features
    register,
    updateProfile,
    error,
    clearError,

    sendOTP,
    resendOTP,
    verifyOTP,
  };
};
