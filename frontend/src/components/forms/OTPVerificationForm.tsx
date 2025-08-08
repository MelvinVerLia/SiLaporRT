import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Mail, RefreshCw, Check, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import Button from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";

interface LocationState {
  email: string;
  name: string;
  userData?: any;
}

const OTPVerificationForm: React.FC = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP, isLoading, error, clearError } = useAuth();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get data from register form
  const locationState = location.state as LocationState;
  const email = locationState?.email;
  const name = locationState?.name;
  const userData = locationState?.userData;

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Auto-focus and navigation between OTP inputs
  const handleOTPChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;

    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    clearError();

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every((digit) => digit) && newOtp.join("").length === 6) {
      handleVerifyOTP(newOtp.join(""));
    }
  };

  // Handle backspace
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        // Clear current field
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous field and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");

    // Only process if it's 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);

      // Focus last input
      inputRefs.current[5]?.focus();

      // Auto-submit
      handleVerifyOTP(pastedData);
    }
  };

  const handleVerifyOTP = async (otpCode: string) => {
    const success = await verifyOTP(email, otpCode, userData);
    if (success) {
      navigate("/", { replace: true });
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    const success = await resendOTP(email);

    if (success) {
      setTimeLeft(300); // Reset timer to 5 minutes
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]); // Clear OTP inputs
      inputRefs.current[0]?.focus(); // Focus first input
    }
    setIsResending(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length === 6) {
      handleVerifyOTP(otpCode);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split("@");
    const repeatCount = Math.max(localPart.length - 2, 0);
    const maskedLocal =
      localPart.charAt(0) +
      "*".repeat(repeatCount) +
      (localPart.length > 1 ? localPart.slice(-1) : "");
    return `${maskedLocal}@${domain}`;
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-gradient-to-l from-blue-200 to-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-xl">
        {/* Logo */}
        <div className="absolute top-4 left-8">
          <Link
            to="/"
            className="flex items-center space-x-2 text-lg font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <img src="/assets/logo.png" alt="Logo" className="h-8 w-8" />
            <span className="text-xl">
              SiLapor<span className="text-blue-950">RT</span>
            </span>
          </Link>
        </div>

        <CardContent className="p-8 pt-16">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-6 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>

            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Verifikasi Email
            </CardTitle>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Kami telah mengirim kode verifikasi ke
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {maskEmail(email)}
              </p>
              <p className="text-xs text-gray-500">
                Masukkan 6 digit kode untuk melanjutkan
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 text-center">
                Kode Verifikasi
              </label>

              <div
                className="flex justify-center space-x-2"
                onPaste={handlePaste}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all duration-200"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span>{error.message}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
              loading={isLoading}
              disabled={otp.some((digit) => !digit) || isLoading}
            >
              <Check className="mr-2 h-4 w-4" />
              {isLoading ? "Memverifikasi..." : "Verifikasi"}
            </Button>

            {/* Resend Section */}
            <div className="text-center space-y-3">
              {timeLeft > 0 ? (
                <div className="text-sm text-gray-600">
                  <p>Tidak menerima kode?</p>
                  <p className="font-medium">
                    Kirim ulang dalam {formatTime(timeLeft)}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Tidak menerima kode?</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResendOTP}
                    disabled={!canResend || isResending}
                    loading={isResending}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {isResending ? "Mengirim..." : "Kirim Ulang Kode"}
                  </Button>
                </div>
              )}
            </div>

            {/* Help Text */}
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500">
                Periksa folder spam jika tidak menerima email
              </p>
              <p className="text-xs text-gray-500">
                Ingin menggunakan email lain?{" "}
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Daftar ulang
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPVerificationForm;
