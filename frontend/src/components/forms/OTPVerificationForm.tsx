import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent, CardTitle } from "../ui/Card";
import Button from "../ui/Button";
import { useToast } from "../../hooks/useToast";
import { useAuthContext } from "../../contexts/AuthContext";

const OTPVerificationForm: React.FC = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(5);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const { register, resendOTP, isLoading, error, clearError } =
    useAuthContext();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const toast = useToast();

  const { token } = useParams();

  // Redirect if no email provided
  useEffect(() => {
    if (!token) {
      navigate("/register", { replace: true });
    }
  }, [token]);

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
    if (!token || !otpCode) return;
    const success = await register(token, otpCode);
    console.log("success", success);
    if (success) {
      navigate("/login", { replace: true });
      toast.success("Akun berhasil dibuat", "Berhasil");
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    console.log("token", token);
    const success = await resendOTP(token!);
    console.log(success);
    if (success) {
      setTimeLeft(5);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
    setIsResending(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // if (!email) return null;

  return (
    <div className="min-h-screen bg-gradient-to-l from-primary-100 to-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-xl">
        {/* Logo */}
        <div className="absolute top-4 left-8">
          <Link
            to="/"
            className="flex items-center space-x-2 text-lg font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            <img src="/assets/logo.webp" alt="Logo" className="h-8 w-8" />
            <span className="text-xl">
              SiLapor<span className="text-primary-700">RT</span>
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
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-primary-600" />
            </div>

            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Verifikasi Email
            </CardTitle>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Kami telah mengirim kode verifikasi ke
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {/* {maskEmail(email)} */}
              </p>
              <p className="text-xs text-gray-500">
                Masukkan 6 digit kode untuk melanjutkan
              </p>
            </div>
          </div>

          <form className="space-y-6">
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
                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 transition-all duration-200"
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
            {/* <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
              loading={isLoading}
              disabled={otp.some((digit) => !digit) || isLoading}
            >
              <Check className="mr-2 h-4 w-4" />
              {isLoading ? "Memverifikasi..." : "Verifikasi"}
            </Button> */}

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
                    className="text-primary-600 hover:text-primary-700"
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
                  className="text-primary-600 hover:text-primary-700 font-medium"
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
