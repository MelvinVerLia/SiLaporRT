import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff, Lock, Check, X } from "lucide-react";
import { Card, CardContent, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuthContext } from "../../contexts/AuthContext";

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { token, email } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string>("");
  const [isResetSuccessful, setIsResetSuccessful] = useState(false);
  const { verifyForgotPasswordToken, forgotPasswordChange } = useAuthContext();

  // Password validation criteria
  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
  });

  const validateToken = async () => {
    if (!token || !email) return setIsTokenValid(false);

    try {
      const response = await verifyForgotPasswordToken(token, email);
      if (!response) return setIsTokenValid(false);
      console.log(response);
      setIsTokenValid(true);
    } catch (err) {
      console.log(err);
      setIsTokenValid(false);
    }
  };

  useEffect(() => {
    validateToken();
  }, []);

  // Validate password criteria
  useEffect(() => {
    setPasswordCriteria({
      minLength: password.length >= 6,
    });
  }, [password]);

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid) {
      setError("Password tidak memenuhi kriteria yang dibutuhkan");
      return;
    }

    if (!passwordsMatch) {
      setError("Password dan konfirmasi password tidak sama");
      return;
    }

    setIsLoading(true);

    try {
      await forgotPasswordChange(email!, password);
      setIsResetSuccessful(true);

      setTimeout(() => {
        navigate("/login", {
          state: {
            message:
              "Password berhasil diubah. Silakan login dengan password baru.",
          },
        });
      }, 2000);
    } catch (err) {
      console.log(err);
      setError("Terjadi kesalahan saat mengubah password. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while validating token
  if (isTokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-blue-200 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memvalidasi link reset password...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (isTokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-blue-200 to-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-8 h-8 text-red-600" />
            </div>

            <CardTitle className="text-2xl font-bold text-gray-900 mb-4">
              Link Tidak Valid
            </CardTitle>

            <p className="text-gray-600 mb-8">
              Link reset password tidak valid atau sudah kedaluwarsa. Silakan
              buat permintaan reset password baru.
            </p>

            <div className="space-y-4">
              <Link to="/forgot-password">
                <Button className="w-full">Reset Password Ulang</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Kembali ke Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (isResetSuccessful) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-blue-200 to-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>

            <CardTitle className="text-2xl font-bold text-gray-900 mb-4">
              Password Berhasil Diubah!
            </CardTitle>

            <p className="text-gray-600 mb-8">
              Password Anda telah berhasil diubah. Anda akan diarahkan ke
              halaman login dalam beberapa detik.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main reset password form
  return (
    <div className="min-h-screen bg-gradient-to-l from-blue-200 to-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl w-full mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-xl">
        {/* Logo */}
        <div className="absolute top-4 left-8">
          <Link
            to="/"
            className="flex items-center space-x-2 text-lg font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <img
              src="/assets/logo.png"
              alt="Logo"
              className="h-8 w-8 md:h-10 md:w-10"
            />
            <span className="text-xl md:text-2xl">
              SiLapor<span className="text-blue-950">RT</span>
            </span>
          </Link>
        </div>

        <CardContent className="flex flex-col md:flex-row gap-8 p-8 pt-16 md:pt-8">
          {/* Ilustrasi - Kolom kiri */}
          <div className="hidden md:flex md:w-1/2 items-center justify-center rounded-lg p-4 mt-12">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <Lock className="w-16 h-16 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Buat Password Baru
              </h3>
              <p className="text-gray-600">
                Masukkan password baru yang aman untuk akun Anda.
              </p>
            </div>
          </div>

          {/* Form - Kolom kanan */}
          <div className="md:w-1/2 flex flex-col justify-center md:mt-12">
            <div className="mb-6">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                Buat Password Baru
              </CardTitle>
              <p className="text-sm text-gray-600">
                Reset password untuk: {""}
                <span className="font-semibold text-blue-600">{email}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Password Input */}
              <div className="relative">
                <Input
                  label="Password Baru"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                  required
                  disabled={isLoading}
                  className="transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-10 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password Criteria */}
              {password && (
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Kriteria Password:
                  </p>
                  {Object.entries({
                    minLength: "Minimal 6 karakter",
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center text-sm">
                      {passwordCriteria[
                        key as keyof typeof passwordCriteria
                      ] ? (
                        <Check className="h-4 w-4 text-green-600 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400 mr-2" />
                      )}
                      <span
                        className={
                          passwordCriteria[key as keyof typeof passwordCriteria]
                            ? "text-green-700"
                            : "text-gray-600"
                        }
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Confirm Password Input */}
              <div className="relative">
                <Input
                  label="Konfirmasi Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Masukkan ulang password baru"
                  required
                  disabled={isLoading}
                  className="transition-all duration-200"
                  error={
                    confirmPassword && !passwordsMatch
                      ? "Password tidak sama"
                      : undefined
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-10 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg flex items-start space-x-2">
                  <span className="text-red-500 mt-0.5">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
                loading={isLoading}
                disabled={!isPasswordValid || !passwordsMatch || isLoading}
              >
                <Lock className="mr-2 h-4 w-4" />
                {isLoading ? "Mengubah password..." : "Ubah Password"}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center">
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  Kembali ke Login
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center px-4">
        <p className="text-xs text-gray-500">
          Link reset akan kedaluwarsa dalam 15 menit setelah dikirim
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
