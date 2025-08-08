import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, LogIn, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { useAuth } from "../../hooks/useAuth";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuth();

  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await login({ email, password });
    if (success) {
      navigate(from, { replace: true });
    }
  };

  const handleDemoLogin = async (role: "citizen" | "admin") => {
    clearError();
    const credentials =
      role === "admin"
        ? { email: "admin@example.com", password: "admin123" }
        : { email: "citizen@example.com", password: "password123" };

    const success = await login(credentials);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  const handleGoogleLogin = () => {
    // Implementasi Google OAuth akan ditambahkan nanti
    console.log("Google login clicked");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl w-full mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-xl">
        {/* Main content: Form kanan, ilustrasi kiri */}
        <CardContent className="flex flex-col md:flex-row gap-8 p-8">
          {/* Ilustrasi - Kolom kiri */}
          <div className="hidden md:flex md:w-1/2 items-center justify-center rounded-lg p-4 relative">
            {/* Logo and App Name in top left corner */}
            <Link
              to="/"
              className="absolute top-1 left-2 flex items-center space-x-2 text-lg font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <img src="/assets/logo.png" alt="Logo" className="h-10 w-10" />
              <span className="text-2xl">
                SiLapor<span className="text-blue-950">RT</span>
              </span>
            </Link>

            <img
              src="/assets/login.png"
              alt="Login Illustration"
              className="w-full h-full max-h-[500px] object-contain"
            />
          </div>
          {/* Form - Kolom kanan */}
          <div className="md:w-1/2 flex flex-col justify-center">
            {/* Title dan Subtitle - Di atas form */}
            <div className="mb-6">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                Selamat Datang
              </CardTitle>

              {/* Link Register - Di bawah title, sebelum form */}
              <p className="text-sm text-gray-600">
                Belum punya akun?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
                >
                  Daftar sekarang
                </Link>
              </p>
            </div>

            {/* <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-800 mb-3 font-medium flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Demo Login (Sementara):
              </p>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin("citizen")}
                  disabled={isLoading}
                  className="text-blue-700 border-blue-200 hover:bg-blue-50"
                >
                  👤 Login sebagai Warga
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin("admin")}
                  disabled={isLoading}
                  className="text-blue-700 border-blue-200 hover:bg-blue-50"
                >
                  👨‍💼 Login sebagai Admin RT
                </Button>
              </div>
              <p className="text-xs text-blue-600 mt-2 text-center">
                Atau gunakan form di bawah dengan kredensial yang sama
              </p>
            </div> */}

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                label="Alamat Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error?.field === "email" ? error.message : undefined}
                placeholder="contoh@email.com"
                required
                disabled={isLoading}
                className="transition-all duration-200"
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={
                    error?.field === "password" ? error.message : undefined
                  }
                  placeholder="Masukkan password Anda"
                  required
                  disabled={isLoading}
                  className="transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-10 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none"
                  disabled={isLoading}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-600 select-none">
                    Ingat saya
                  </span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  Lupa password?
                </Link>
              </div>

              {error && !error.field && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg flex items-start space-x-2">
                  <span className="text-red-500 mt-0.5">⚠</span>
                  <span>{error.message}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
                loading={isLoading}
                disabled={!email || !password}
              >
                <LogIn className="mr-2 h-4 w-4" />
                {isLoading ? "Sedang masuk..." : "Masuk"}
              </Button>
            </form>

            {/* Google Login Button */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Masuk dengan Google
              </Button>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Bergabung dengan komunitas RT Anda
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center px-4">
        <p className="text-xs text-gray-500">
          Dengan masuk, Anda menyetujui{" "}
          <Link to="/terms" className="text-blue-600 hover:text-blue-700">
            Syarat & Ketentuan
          </Link>{" "}
          dan{" "}
          <Link to="/privacy" className="text-blue-600 hover:text-blue-700">
            Kebijakan Privasi
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
