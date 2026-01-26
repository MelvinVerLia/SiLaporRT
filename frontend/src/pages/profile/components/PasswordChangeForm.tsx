import React, { useState } from "react";
import { Edit2, Save, X, Eye, EyeOff } from "lucide-react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

interface PasswordChangeFormProps {
  onChangePassword: (newPassword: string) => Promise<void>;
  isChanging: boolean;
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  onChangePassword,
  isChanging,
}) => {
  const [isChangingMode, setIsChangingMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validatePassword = () => {
    const errors: { newPassword?: string; confirmPassword?: string } = {};

    if (!passwordForm.newPassword) {
      errors.newPassword = "Password baru wajib diisi";
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = "Password minimal 6 karakter";
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Konfirmasi password wajib diisi";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Password tidak sama";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    // Clear specific field error when user starts typing
    if (passwordErrors[field as keyof typeof passwordErrors]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleStartChangePassword = () => {
    setIsChangingMode(true);
    setPasswordForm({
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({});
  };

  const handleCancelChangePassword = () => {
    setIsChangingMode(false);
    setPasswordForm({
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSavePassword = async () => {
    if (!validatePassword()) {
      return;
    }

    try {
      await onChangePassword(passwordForm.newPassword);
      // Reset form after successful change
      setPasswordForm({
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
      setIsChangingMode(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      console.error("Error changing password:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Ubah Password
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Perbarui password Anda untuk menjaga keamanan akun
          </p>
        </div>
        {!isChangingMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartChangePassword}
          >
            <Edit2 className="mr-1 h-4 w-4" />
            Ubah Password
          </Button>
        )}
      </div>

      {/* Password Form - Only show when changing password */}
      {isChangingMode && (
        <div className="space-y-4">
          <div className="relative">
            <Input
              label="Password Baru"
              type={showPassword ? "text" : "password"}
              value={passwordForm.newPassword}
              onChange={(e) =>
                handlePasswordChange("newPassword", e.target.value)
              }
              error={passwordErrors.newPassword}
              placeholder="Masukkan password baru"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 rounded"
              disabled={isChanging}
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
              label="Konfirmasi Password Baru"
              type={showConfirmPassword ? "text" : "password"}
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                handlePasswordChange("confirmPassword", e.target.value)
              }
              error={passwordErrors.confirmPassword}
              placeholder="Ulangi password baru"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-10 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 rounded"
              disabled={isChanging}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={handleCancelChangePassword}
              disabled={isChanging}
            >
              <X className="mr-1 h-4 w-4" />
              Batal
            </Button>
            <Button
              size="md"
              onClick={handleSavePassword}
              loading={isChanging}
              disabled={
                isChanging ||
                !passwordForm.newPassword ||
                !passwordForm.confirmPassword
              }
            >
              <Save className="mr-1 h-4 w-4" />
              Simpan Password
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordChangeForm;
