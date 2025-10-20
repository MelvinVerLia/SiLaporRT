import { useState, useEffect, useCallback } from "react";
import {
  User,
  LoginCredentials,
  RegisterData,
  AuthError,
} from "../types/auth.types";
import {
  login as apiLogin,
  register as apiRegister,
  getProfile,
  logout as apiLogout,
  sendOTP,
  resendOTP as resend,
  deleteAccount as apiDelete,
  updateProfile as apiUpdateProfile,
  changePassword as apiChangePassword,
  validateForgotPasswordToken,
  changeForgotPassword,
  forgotPassword as sendForgotPassword,
} from "../services/authService";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

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
    async (credentials: LoginCredentials): Promise<User> => {
      setIsLoading(true);
      setError(null);
      try {
        const { user } = await apiLogin(credentials);
        setUser( user );
        return user;
      } catch (e: unknown) {
        console.log(e);
        setError({ message: "Terjadi kesalahan saat login" });
        return Promise.reject(e);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

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

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...body } = data;

      const response = await sendOTP(body);
      return response.token;
    } catch (e: unknown) {
      console.log(e);
      setError({ message: "Terjadi kesalahan saat registrasi" });
      return;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // LOGOUT: hapus cookie di server; FE bersihkan state & arahkan ke login
  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await apiLogout();
      // Tambahkan delay kecil untuk memberikan feedback visual yang baik
      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch {
      // abaikan error logout
      // Tetap berikan delay meskipun ada error
      await new Promise((resolve) => setTimeout(resolve, 600));
    } finally {
      setUser(null);
      setError(null);
      setIsLoggingOut(false);
    }
  }, []);

  const resendOTP = useCallback(async (token: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: panggil endpoint BE, contoh: await apiResendOTP(email)
      await resend(token);
      return true;
    } catch (e: unknown) {
      console.log(e);
      setError({ message: "Gagal mengirim ulang OTP" });
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
      } catch (e: unknown) {
        console.log(e);
        setError({ message: "Gagal verifikasi OTP" });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateProfile = useCallback(
    async (data: User) => {
      setIsLoading(true);
      setError(null);
      try {
        const newUser = await apiUpdateProfile(data);
        console.log("old user", user);
        console.log("udpated user", newUser.data);
        setUser(newUser.data);
        return true;
      } catch (e: unknown) {
        console.log(e);
        setError({ message: "Gagal memperbarui profil" });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const deleteAccount = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await apiDelete();
      setUser(null);
      setError(null);
      return true;
    } catch (e: unknown) {
      console.log(e);
      setError({ message: "Gagal menghapus akun" });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (password: string) => {
    setIsChangingPassword(true);
    setError(null);
    try {
      await apiChangePassword(password);
      return true;
    } catch (error) {
      console.log(error);
      setError({ message: "Gagal mengubah password" });
      return false;
    } finally {
      setIsChangingPassword(false);
    }
  }, []);

  const verifyForgotPasswordToken = useCallback(
    async (token: string, email: string) => {
      setError(null);
      try {
        await validateForgotPasswordToken(token, email);
        return true;
      } catch (error) {
        console.log(error);
        setError({ message: "Token tidak valid" });
        return false;
      }
    },
    []
  );

  const forgotPasswordChange = useCallback(
    async (email: string, password: string) => {
      setError(null);
      try {
        await changeForgotPassword(email, password);
      } catch (error) {
        console.log(error);
        setError({ message: "Gagal mengubah password" });
      }
    },
    []
  );

  const forgotPassword = useCallback(async (email: string) => {
    setError(null);
    try {
      await sendForgotPassword(email);
      return true;
    } catch (error) {
      console.log(error);
      setError({ message: "Gagal mengirim email" });
      return false;
    }
  }, []);

  return {
    user,
    isLoading,
    isLoggingOut,
    isChangingPassword,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    updateProfile,
    error,
    clearError: () => setError(null),
    sendOtp,
    resendOTP,
    deleteAccount,
    changePassword,
    verifyForgotPasswordToken,
    forgotPasswordChange,
    forgotPassword,
  };
};
