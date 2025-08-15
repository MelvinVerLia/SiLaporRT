import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, FileText, ArrowRight } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";

interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  rt: string;
  rw: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    rt: "",
    rw: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const rtOptions = [
    { value: "", label: "Pilih RT" },
    { value: "01", label: "RT 01" },
    { value: "02", label: "RT 02" },
    { value: "03", label: "RT 03" },
    { value: "04", label: "RT 04" },
    { value: "05", label: "RT 05" },
  ];

  const rwOptions = [
    { value: "", label: "Pilih RW" },
    { value: "01", label: "RW 01" },
    { value: "02", label: "RW 02" },
    { value: "03", label: "RW 03" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof RegisterFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama lengkap wajib diisi";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Nama minimal 2 karakter";
    }

    if (!formData.email) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.phone) {
      newErrors.phone = "Nomor HP wajib diisi";
    } else if (
      !/^(\+62|62|0)8[1-9][0-9]{6,9}$/.test(formData.phone.replace(/\s|-/g, ""))
    ) {
      newErrors.phone = "Format nomor HP tidak valid";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 6) {            
      newErrors.password = "Password minimal 6 karakter";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password wajib diisi";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password tidak cocok";
    }

    if (!formData.rt) {
      newErrors.rt = "RT wajib dipilih";
    }

    if (!formData.rw) {
      newErrors.rw = "RW wajib dipilih";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Mock registration - in real app, call actual API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate registration success
      navigate("/login", {
        state: {
          message: "Registrasi berhasil! Silakan login dengan akun Anda.",
        },
      });
    } catch (error) {
      setErrors({ email: "Email sudah terdaftar" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <Link
            to="/"
            className="flex items-center space-x-2 text-2xl font-bold text-blue-600"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-600 text-white">
              <FileText className="h-6 w-6" />
            </div>
            <span>SiLaporRT</span>
          </Link>
        </div>

        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Daftar Akun Baru
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Masuk di sini
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <Input
                label="Nama Lengkap"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Masukkan nama lengkap"
                autoComplete="name"
              />

              {/* Email Input */}
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="nama@email.com"
                autoComplete="email"
              />

              {/* Phone Input */}
              <Input
                label="Nomor HP"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="08123456789"
                autoComplete="tel"
                helperText="Format: 08xxxxxxxxxx"
              />

              {/* RT & RW Selection */}
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="RT"
                  name="rt"
                  value={formData.rt}
                  onChange={handleChange}
                  error={errors.rt}
                  options={rtOptions}
                  placeholder="Pilih RT"
                />

                <Select
                  label="RW"
                  name="rw"
                  value={formData.rw}
                  onChange={handleChange}
                  error={errors.rw}
                  options={rwOptions}
                  placeholder="Pilih RW"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Minimal 6 karakter"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Confirm Password Input */}
              <div className="relative">
                <Input
                  label="Konfirmasi Password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  placeholder="Ulangi password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  Saya menyetujui{" "}
                  <Link
                    to="/terms"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Syarat & Ketentuan
                  </Link>{" "}
                  dan{" "}
                  <Link
                    to="/privacy"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Kebijakan Privasi
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? "Memproses..." : "Daftar Akun"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-6">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-green-900 mb-2">
                Informasi Registrasi:
              </h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Akun akan diverifikasi dalam 1x24 jam</li>
                <li>• Pastikan data yang diisi benar dan valid</li>
                <li>• Hubungi RT jika ada kendala</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
