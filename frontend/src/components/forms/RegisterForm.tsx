import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus, Check } from "lucide-react";
import { Card, CardContent, CardTitle } from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { useAuthContext } from "../../contexts/AuthContext";
import { RT } from "../../types/auth.types";
import SearchableDropdown from "../ui/SearchableDropdown";

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    rtId: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [search, setSearch] = useState("");
  const [rtData, setRtData] = useState([]);
  const [rtFormData, setRtFormData] = useState({
    kecamatan: "",
    kelurahan: "",
    rw: "",
    rt: "",
  });

  const navigate = useNavigate();
  const {
    sendOtp,
    isLoading,
    error,
    clearError,
    getRtDropdown,
    getRtLocation,
  } = useAuthContext();

  useEffect(() => {
    const fetchRtData = async () => {
      const data = await getRtDropdown(search);
      setRtData(data.data);
    };

    const fetchRtLocation = async () => {
      const data = await getRtLocation(formData.rtId);
      setRtFormData({
        kecamatan: data.data.kecamatan,
        kelurahan: data.data.kelurahan,
        rw: data.data.rw,
        rt: data.data.rt,
      });
    };

    fetchRtData();
    if (formData.rtId) fetchRtLocation();
  }, [search, formData.rtId]);

  const rtOptions = rtData.map((rt: RT) => ({
    label: rt.name,
    value: rt.rtId,
  }));

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { name: string; value: string } },
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!agreedToTerms) return;

    const response = await sendOtp(formData);
    if (response) {
      navigate(`/verify-otp/${response}`, { replace: true });
    }
  };

  const handleGoogleRegister = () => {
    if (import.meta.env.VITE_API_BASE_URL_PROD)
      window.location.href =
        import.meta.env.VITE_API_BASE_URL_PROD + "/auth/google";
    else
      window.location.href = import.meta.env.VITE_API_BASE_URL + "/auth/google";
  };

  const passwordsMatch =
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  return (
    <div className="min-h-screen bg-gradient-to-l from-primary-100 to-white dark:from-gray-800 dark:to-gray-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-6xl w-full mx-auto shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl">
        {/* Logo positioned absolutely at the top of the card - visible on all screen sizes */}
        <div className="absolute top-4 left-8">
          <Link
            to="/"
            className="flex items-center space-x-2 text-lg font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            <img
              src="/assets/logo.webp"
              alt="Logo"
              className="h-8 w-8 md:h-10 md:w-10"
            />
            <span className="text-xl md:text-2xl">
              SiLapor
              <span className="text-primary-700 dark:text-primary-400">RT</span>
            </span>
          </Link>
        </div>

        {/* Main content: Form kanan, ilustrasi kiri */}
        <CardContent className="flex flex-col md:flex-row gap-8 p-8 pt-16 md:pt-8">
          {/* Ilustrasi - Kolom kiri */}
          <div className="hidden md:flex md:w-1/2 items-center justify-center rounded-lg p-4 relative">
            <img
              src="/assets/register.webp"
              alt="Register Illustration"
              className="w-full h-full max-h-[500px] object-contain"
            />
          </div>

          {/* Form - Kolom Kanan */}
          <div className="md:w-1/2 flex flex-col justify-center md:mt-12">
            {/* Title dan Subtitle - Di atas form */}
            <div className="mb-6">
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Bergabung dengan Kami
              </CardTitle>

              {/* Link Login - Di bawah title, sebelum form */}
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Sudah punya akun?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
                >
                  Masuk di sini
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                label="Nama Lengkap"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={error?.field === "name" ? error.message : undefined}
                placeholder="Masukkan nama lengkap Anda"
                required
                disabled={isLoading}
                className="transition-all duration-200"
              />

              <Input
                label="Alamat Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={error?.field === "email" ? error.message : undefined}
                placeholder="contoh@email.com"
                required
                disabled={isLoading}
                className="transition-all duration-200"
              />

              <Input
                label="No. Telepon"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={error?.field === "phone" ? error.message : undefined}
                placeholder="08xxxxxxxxxx"
                required
                disabled={isLoading}
                className="transition-all duration-200"
              />

              <Input
                label="Alamat"
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={error?.field === "address" ? error.message : undefined}
                placeholder="Jl Hayam Goreng Tepung"
                required
                disabled={isLoading}
                className="transition-all duration-200"
              />

              <SearchableDropdown
                label="Nama RT"
                name="rtId"
                error={error?.field === "rtId" ? error.message : undefined}
                options={isLoading ? [] : rtOptions}
                required
                value={formData.rtId}
                search={search}
                onSearchChange={setSearch}
                onChange={handleChange}
                disabled={isLoading}
              />

              {formData.rtId && (
                <div className="mt-3 overflow-hidden rounded-xl border border-gray-200/70 bg-white/60 shadow-sm backdrop-blur dark:border-gray-700/70 dark:bg-gray-800/50">
                  <div className="flex items-start justify-between gap-3 border-b border-gray-200/70 px-4 py-3 dark:border-gray-700/70">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Lokasi RT
                      </p>
                    </div>

                    {isLoading ? (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                        Memuat...
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-200">
                        Terisi otomatis
                      </span>
                    )}
                  </div>

                  <div className="px-4 py-4">
                    {isLoading ? (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="h-12 rounded-lg bg-gray-100 dark:bg-gray-700/60" />
                        <div className="h-12 rounded-lg bg-gray-100 dark:bg-gray-700/60" />
                        <div className="h-12 rounded-lg bg-gray-100 dark:bg-gray-700/60" />
                        <div className="h-12 rounded-lg bg-gray-100 dark:bg-gray-700/60" />
                      </div>
                    ) : (
                      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-gray-200/70 bg-white px-3 py-2 dark:border-gray-700/70 dark:bg-gray-800/60">
                          <dt className="text-xs text-gray-600 dark:text-gray-400">
                            Kelurahan
                          </dt>
                          <dd className="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {rtFormData.kelurahan || "—"}
                          </dd>
                        </div>

                        <div className="rounded-lg border border-gray-200/70 bg-white px-3 py-2 dark:border-gray-700/70 dark:bg-gray-800/60">
                          <dt className="text-xs text-gray-600 dark:text-gray-400">
                            Kecamatan
                          </dt>
                          <dd className="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {rtFormData.kecamatan || "—"}
                          </dd>
                        </div>

                        <div className="rounded-lg border border-gray-200/70 bg-white px-3 py-2 dark:border-gray-700/70 dark:bg-gray-800/60">
                          <dt className="text-xs text-gray-600 dark:text-gray-400">
                            RW
                          </dt>
                          <dd className="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {rtFormData.rw || "—"}
                          </dd>
                        </div>

                        <div className="rounded-lg border border-gray-200/70 bg-white px-3 py-2 dark:border-gray-700/70 dark:bg-gray-800/60">
                          <dt className="text-xs text-gray-600 dark:text-gray-400">
                            RT
                          </dt>
                          <dd className="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {rtFormData.rt || "—"}
                          </dd>
                        </div>
                      </dl>
                    )}
                  </div>
                </div>
              )}

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={
                    error?.field === "password" ? error.message : undefined
                  }
                  placeholder="Minimal 6 karakter"
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

              <div className="relative">
                <Input
                  label="Konfirmasi Password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={
                    error?.field === "confirmPassword"
                      ? error.message
                      : undefined
                  }
                  placeholder="Ulangi password"
                  required
                  disabled={isLoading}
                  className="transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-10 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 focus:outline-none"
                  disabled={isLoading}
                  aria-label={
                    showConfirmPassword
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>

                {formData.confirmPassword && (
                  <div className="mt-2 flex items-center space-x-1">
                    {passwordsMatch ? (
                      <>
                        <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                        <span className="text-xs text-green-600 dark:text-green-400">
                          Password cocok!
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-red-600 dark:text-red-400">
                        Password tidak cocok
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 mt-0.5"
                    disabled={isLoading}
                    required
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300 select-none leading-relaxed group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                    Saya menyetujui{" "}
                    <Link
                      to="/terms"
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                    >
                      Syarat & Ketentuan
                    </Link>{" "}
                    dan{" "}
                    <Link
                      to="/privacy"
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                    >
                      Kebijakan Privasi
                    </Link>{" "}
                    SiLaporRT
                  </span>
                </label>
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
                disabled={
                  !formData.name ||
                  !formData.email ||
                  !formData.phone ||
                  !formData.password ||
                  !formData.confirmPassword ||
                  !agreedToTerms ||
                  !passwordsMatch ||
                  !formData.rtId
                }
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {isLoading ? "Sedang mendaftar..." : "Daftar Sekarang"}
              </Button>
            </form>

            {/* Google Register Button */}
            <div className="mt-3 pt-3 border-t border-gray-200dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                onClick={handleGoogleRegister}
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
                Daftar dengan Google
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                Cepat dan mudah dalam 1 menit
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center px-4">
        <p className="text-xs text-gray-500 dark:text-gray-300">
          Dengan mendaftar, Anda menyetujui{" "}
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

export default RegisterForm;
