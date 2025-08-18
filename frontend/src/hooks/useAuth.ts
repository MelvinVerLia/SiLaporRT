import { useState, useEffect, useCallback } from "react";
import {
  User,
  LoginCredentials,
  RegisterData,
  AuthError,
} from "../types/auth.types";
import { useNavigate } from "react-router-dom";
import {
  login as apiLogin,
  register as apiRegister,
  getProfile,
  logout as apiLogout,
  sendOTP,
  // verifyOTP as verifyOtp,
} from "../services/authService";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const navigate = useNavigate();

  const initializeAuth = async () => {
    setIsLoading(true);
    try {
      const freshUser = await getProfile().catch(() => null);
      setUser(freshUser);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  // LOGIN: server set cookie; FE TIDAK menyimpan apa pun di localStorage
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const { user } = await apiLogin(credentials); 
        setUser(user);
        return true;
      } catch (e: any) {
        setError({ message: e?.message || "Terjadi kesalahan saat login" });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // REGISTER: validasi ringan → ikut hasil server; FE tidak menyimpan token
  // const register = useCallback(async (data: RegisterData): Promise<boolean> => {
  //   setIsLoading(true);
  //   setError(null);
  //   try {
  //     if (data.password !== data.confirmPassword) {
  //       setError({ message: "Password tidak sama", field: "confirmPassword" });
  //       return false;
  //     }
  //     if (data.password.length < 6) {
  //       setError({ message: "Password minimal 6 karakter", field: "password" });
  //       return false;
  //     }

  //     const { confirmPassword, ...body } = data;

  //     const { user } = await apiRegister(body);
  //     setUser(user);
  //     return true;
  //   } catch (e: any) {
  //     setError({ message: e?.message || "Terjadi kesalahan saat registrasi" });
  //     return false;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, []);

  const sendOtp = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      if (data.password !== data.confirmPassword) {
        setError({ message: "Password tidak sama", field: "confirmPassword" });
        return;
      }
      if (data.password.length < 6) {
        setError({ message: "Password minimal 6 karakter", field: "password" });
        return;
      }

      const { confirmPassword, ...body } = data;

      const response = await sendOTP(body);
      return response.token;
    } catch (e: any) {
      setError({ message: e?.message || "Terjadi kesalahan saat registrasi" });
      return;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // LOGOUT: hapus cookie di server; FE bersihkan state & arahkan ke login
  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // abaikan error logout
    }
    setUser(null);
    setError(null);
    navigate("/login");
  }, [navigate]);

  // UPDATE PROFILE: TODO sambungkan ke endpoint BE (mis. PATCH /api/users/me)
  const updateProfile = useCallback(
    async (_updates: Partial<User>): Promise<boolean> => {
      // TODO: implement ke backend. Untuk sekarang kembalikan false agar UI tahu belum didukung.
      setError({ message: "Update profil belum didukung" });
      return false;
    },
    []
  );

  const resendOTP = useCallback(async (_email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: panggil endpoint BE, contoh: await apiResendOTP(email)
      return true;
    } catch (e: any) {
      setError({ message: e?.message || "Gagal mengirim ulang OTP" });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (token: string, otpCode: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        await apiRegister(token, otpCode);
        return true;
      } catch (e: any) {
        setError({ message: e?.message || "Gagal verifikasi OTP" });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    updateProfile, // TODO
    error,
    clearError: () => setError(null),
    sendOtp, // TODO
    resendOTP, // TODO
    // verifyOTP, 
  };
};
