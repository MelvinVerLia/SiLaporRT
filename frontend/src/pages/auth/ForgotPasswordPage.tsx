import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { AuthFinder } from "../../api/AuthFinder";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API call untuk forgot password
    try {
      // Simulate email validation
      if (!email.includes("@")) {
        setError("Alamat email tidak valid");
        return;
      }

      const response = await AuthFinder.post("/forgot-password", { email });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate success
      setIsEmailSent(true);
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    setError("");
    if (!email.includes("@")) {
        setError("Alamat email tidak valid");
        return;
      }

      const response = await AuthFinder.post("/forgot-password", { email });
    // Simulate resend email
    setIsLoading(false);  
  };

  // Success state - Email telah dikirim
  if (isEmailSent) {
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
                <div className="w-32 h-32 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-16 h-16 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Email Terkirim!
                </h3>
                <p className="text-gray-600">
                  Silakan periksa kotak masuk email Anda untuk melanjutkan reset
                  password.
                </p>
              </div>
            </div>

            {/* Content - Kolom kanan */}
            <div className="md:w-1/2 flex flex-col justify-center md:mt-12">
              <div className="text-center md:text-left">
                <div className="md:hidden w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-10 h-10 text-green-600" />
                </div>

                <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                  Periksa Email Anda
                </CardTitle>

                <div className="space-y-4 text-gray-600">
                  <p>Kami telah mengirimkan link reset password ke:</p>
                  <p className="font-semibold text-blue-600 bg-blue-50 p-3 rounded-lg">
                    {email}
                  </p>
                  <p className="text-sm">
                    Silakan klik link dalam email untuk melanjutkan proses reset
                    password. Link akan kedaluwarsa dalam 15 menit.
                  </p>
                </div>

                <div className="mt-8 space-y-4">
                  <Button
                    onClick={handleResendEmail}
                    variant="outline"
                    className="w-full"
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {isLoading ? "Mengirim ulang..." : "Kirim ulang email"}
                  </Button>

                  <div className="flex items-center justify-center space-x-4 text-sm">
                    <Link
                      to="/login"
                      className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      <ArrowLeft className="mr-1 h-4 w-4" />
                      Kembali ke Login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center px-4">
          <p className="text-xs text-gray-500">
            Tidak menerima email? Periksa folder spam atau{" "}
            <button
              onClick={handleResendEmail}
              className="text-blue-600 hover:text-blue-700 underline"
              disabled={isLoading}
            >
              kirim ulang
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Form state - Input email
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
                <Mail className="w-16 h-16 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Lupa Password?
              </h3>
              <p className="text-gray-600">
                Jangan khawatir, kami akan mengirimkan instruksi reset password
                ke email Anda.
              </p>
            </div>
          </div>

          {/* Form - Kolom kanan */}
          <div className="md:w-1/2 flex flex-col justify-center md:mt-12">
            <div className="mb-6">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                Reset Password
              </CardTitle>
              <p className="text-sm text-gray-600">
                Masukkan alamat email Anda dan kami akan mengirimkan link untuk
                reset password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Alamat Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
                placeholder="contoh@email.com"
                required
                disabled={isLoading}
                className="transition-all duration-200"
                helperText="Masukkan email yang terdaftar di akun Anda"
              />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
                loading={isLoading}
                disabled={!email || isLoading}
              >
                <Mail className="mr-2 h-4 w-4" />
                {isLoading ? "Mengirim..." : "Kirim Link Reset"}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center">
                <Link
                  to="/login"
                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
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
          Ingat password Anda?{" "}
          <Link to="/login" className="text-blue-600 hover:text-blue-700">
            Masuk sekarang
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
