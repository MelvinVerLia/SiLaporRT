import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Card, CardContent, CardTitle } from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { useAuthContext } from "../../contexts/AuthContext";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthContext();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const user = await login({ email, password, rememberMe });
    if (user.id) {
      navigate(from, { replace: true });
    }
  };

  const handleGoogleLogin = () => {
    if (import.meta.env.VITE_API_BASE_URL_PROD)
      window.location.href =
        import.meta.env.VITE_API_BASE_URL_PROD + "/auth/google";
    else
      window.location.href = import.meta.env.VITE_API_BASE_URL + "/auth/google";
  };

  return (
    <div className="min-h-screen bg-gradient-to-l from-primary-100 to-white dark:from-gray-800 dark:to-gray-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl w-full mx-auto shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl">
        <div className="absolute top-4 left-8">
          <Link
            to="/"
            className="flex items-center space-x-2 text-lg font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            <img
              src="/assets/logo.webp"
              alt="Logo"
              className="h-8 w-8 md:h-10 md:w-10"
            />
            <span className="text-xl md:text-2xl">
              SiLapor<span className="text-primary-700">RT</span>
            </span>
          </Link>
        </div>

        {/* Main content: Form kanan, ilustrasi kiri */}
        <CardContent className="flex flex-col md:flex-row gap-8 p-8 pt-16 md:pt-8">
          {/* Ilustrasi - Kolom kiri */}
          <div className="hidden md:flex md:w-1/2 items-center justify-center rounded-lg p-4 mt-12">
            <img
              src="/assets/login.webp"
              alt="Login Illustration"
              className="w-full h-full max-h-[500px] object-contain"
            />
          </div>

          {/* Form - Kolom kanan */}
          <div className="md:w-1/2 flex flex-col justify-center md:mt-12">
            {/* Title dan Subtitle - Di atas form */}
            <div className="mb-6">
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Selamat Datang
              </CardTitle>

              {/* Link Register - Di bawah title, sebelum form */}
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Belum punya akun?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
                >
                  Daftar sekarang
                </Link>
              </p>
            </div>

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
                  className="absolute right-3 top-10 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 focus:outline-none"
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
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-600 select-none">
                    Ingat saya
                  </span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors duration-200"
                >
                  Lupa password?
                </Link>
              </div>

              {error && !error.field && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-3 rounded-lg flex items-start space-x-2">
                  <span className="text-red-500 dark:text-red-400 mt-0.5">
                    ⚠
                  </span>
                  <span>{error.message}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
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
                className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 hover:cursor-pointer"
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                Bergabung dengan komunitas RT Anda
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center px-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Dengan masuk, Anda menyetujui{" "}
          <Link
            to="/terms"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            Syarat & Ketentuan
          </Link>{" "}
          dan{" "}
          <Link
            to="/privacy"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            Kebijakan Privasi
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
