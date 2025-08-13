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
        const { user } = await apiLogin(credentials); // { user, token } — token tidak dipakai di FE
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
  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      if (data.password !== data.confirmPassword) {
        setError({ message: "Password tidak sama", field: "confirmPassword" });
        return false;
      }
      if (data.password.length < 6) {
        setError({ message: "Password minimal 6 karakter", field: "password" });
        return false;
      }

      const { confirmPassword, ...body } = data as any;
      const { user } = await apiRegister(body); // { user, token } — token tidak dipakai di FE
      setUser(user);
      return true;
    } catch (e: any) {
      setError({ message: e?.message || "Terjadi kesalahan saat registrasi" });
      return false;
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

  // OTP FLOW: TODO sambungkan ke BE (forgot/validate/change-password atau OTP khusus)
  const sendOTP = useCallback(async (_email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: panggil endpoint BE, contoh: await apiSendOTP(email)
      return true;
    } catch (e: any) {
      setError({ message: e?.message || "Gagal mengirim OTP" });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const verifyOTP = useCallback(
    async (
      _email: string,
      _otpCode: string,
      _userData: RegisterData
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: panggil endpoint BE verifikasi OTP
        // sementara: belum didukung
        setError({ message: "Verifikasi OTP belum didukung" });
        return false;
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
    sendOTP, // TODO
    resendOTP, // TODO
    verifyOTP, // TODO
  };
};
