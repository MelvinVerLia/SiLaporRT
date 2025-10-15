import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Shield,
  Edit2,
  Save,
  X,
  EyeOff,
  Eye,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import { useToast } from "../hooks/useToast";
import ProfilePictureUpload, {
  ProfilePictureUploadRef,
} from "../components/upload/ProfilePictureUpload";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import Dialog from "../components/ui/Dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/Tabs";

const ProfilePage: React.FC = () => {
  const {
    user,
    updateProfile,
    deleteAccount,
    changePassword,
    logout,
    isChangingPassword,
  } = useAuthContext();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPasswordMode, setIsChangingPasswordMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    profile: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileErrors, setProfileErrors] = useState<{
    name?: string;
    phone?: string;
  }>({});
  const [passwordErrors, setPasswordErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const navigate = useNavigate();

  useEffect(() => {
    setProfileForm({
      name: user?.name || "",
      phone: user?.phone || "",
      profile: user?.profile || "",
    });
  }, [user]);

  const uploadRef = useRef<ProfilePictureUploadRef>(null);
  // Loading states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [coverColor, setCoverColor] = useState<string>("#3b82f6"); // Default blue-500

  // Extract dominant color from profile picture
  useEffect(() => {
    if (!user?.profile) {
      setCoverColor("#3b82f6"); // Default blue
      return;
    }

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = user.profile;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let r = 0,
          g = 0,
          b = 0;

        // Sample pixels and calculate average
        const sampleSize = 10; // Sample every 10th pixel for performance
        let count = 0;

        for (let i = 0; i < data.length; i += 4 * sampleSize) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        // Make color slightly darker and more saturated for better appearance
        const darkenFactor = 0.7;
        r = Math.floor(r * darkenFactor);
        g = Math.floor(g * darkenFactor);
        b = Math.floor(b * darkenFactor);

        setCoverColor(`rgb(${r}, ${g}, ${b})`);
      } catch (error) {
        console.error("Error extracting color:", error);
        setCoverColor("#3b82f6"); // Fallback to default
      }
    };

    img.onerror = () => {
      setCoverColor("#3b82f6"); // Fallback to default
    };
  }, [user?.profile]);

  // Safety fallback (harusnya tidak kejadian karena ProtectedRoute sudah filter)
  if (!user) return null;

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const clearProfileErrors = () => {
    setProfileErrors({});
  };

  const clearPasswordErrors = () => {
    setPasswordErrors({});
  };

  const validateProfile = () => {
    const errors: { name?: string; phone?: string } = {};

    if (!profileForm.name.trim()) {
      errors.name = "Nama lengkap wajib diisi";
    }

    if (!profileForm.phone.trim()) {
      errors.phone = "Nomor telepon wajib diisi";
    } else if (!/^[0-9+\-\s]+$/.test(profileForm.phone)) {
      errors.phone = "Format nomor telepon tidak valid";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

  const handleProfileChange = (field: string, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
    // Clear specific field error when user starts typing
    if (profileErrors[field as keyof typeof profileErrors]) {
      setProfileErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
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
    setIsChangingPasswordMode(true);
    setPasswordForm({
      newPassword: "",
      confirmPassword: "",
    });
    clearPasswordErrors();
  };

  const handleCancelChangePassword = () => {
    setIsChangingPasswordMode(false);
    setPasswordForm({
      newPassword: "",
      confirmPassword: "",
    });
    clearPasswordErrors();
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setProfileForm({
      name: user.name || "",
      phone: user.phone || "",
      profile: user.profile || "",
    });
    clearProfileErrors();
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
    setProfileForm({
      name: user.name || "",
      phone: user.phone || "",
      profile: user.profile || "",
    });
    clearProfileErrors();
  };

  const handleDeleteAccount = () => {
    setIsLoading(true);
    try {
      deleteAccount();
      navigate("/");
      toast.success("Akun berhasil dihapus", "Berhasil");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) {
      return;
    }

    setIsSavingProfile(true);
    try {
      let profileUrl = profileForm.profile;
      if (uploadRef.current?.hasPreview()) {
        const uploadedUrl = await uploadRef.current.upload();
        if (uploadedUrl) profileUrl = uploadedUrl;
      }

      const success = await updateProfile({
        ...profileForm,
        profile: profileUrl,
      });

      if (success) {
        toast.success("Profil berhasil disimpan", "Berhasil");
        setIsEditingProfile(false);
        clearProfileErrors();
        uploadRef.current?.clearPreview();
      } else {
        toast.error("Gagal menyimpan profil", "Error");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Terjadi kesalahan saat menyimpan profil", "Error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleProfilePictureChange = async (file: File) => {
    setIsUploadingPicture(true);
    try {
      // Auto-save profile picture immediately with the file
      if (uploadRef.current) {
        const uploadedUrl = await uploadRef.current.uploadFile(file);
        if (uploadedUrl) {
          const success = await updateProfile({
            name: user.name || "",
            phone: user.phone || "",
            profile: uploadedUrl,
          });

          if (success) {
            toast.success("Foto profil berhasil diubah", "Berhasil");
            uploadRef.current.clearPreview();
          } else {
            toast.error("Gagal menyimpan foto profil", "Error");
          }
        } else {
          toast.error("Gagal mengupload foto", "Error");
        }
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Terjadi kesalahan saat mengubah foto profil", "Error");
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleSavePassword = async () => {
    if (!validatePassword()) {
      return;
    }

    try {
      const success = await changePassword(passwordForm.newPassword);
      if (success) {
        toast.success("Password berhasil diubah", "Berhasil");
        setPasswordForm({
          newPassword: "",
          confirmPassword: "",
        });
        clearPasswordErrors();
        setIsChangingPasswordMode(false);
        // Gunakan pattern yang sama seperti header logout
        logout(); // Tanpa await
        navigate("/login"); // Navigate langsung
      }
    } catch (error) {
      console.log(error);
      toast.error("Gagal mengubah password", "Error");
    }
  };

  const getRoleBadge = (role: string) => {
    return role === "RT_ADMIN"
      ? { variant: "info" as const, label: "Admin RT", icon: Shield }
      : { variant: "default" as const, label: "Warga", icon: User };
  };

  const roleBadge = getRoleBadge(user.role!);
  const RoleIcon = roleBadge.icon;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      {/* <div>
        <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
        <p className="text-gray-600 mt-1">
          Kelola informasi akun dan profil Anda
        </p>
      </div> */}

      {/* Simplified Profile Card with Background */}
      <Card className="overflow-hidden">
        {/* Background Cover */}
        <div
          className="h-32 relative transition-colors duration-500"
          style={{ backgroundColor: coverColor }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/20"></div>
        </div>

        {/* Profile Content */}
        <CardContent className="px-6 pb-8 -mt-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-end sm:gap-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0 relative">
              <div className="ring-4 ring-white rounded-full">
                <ProfilePictureUpload
                  ref={uploadRef}
                  currentUrl={user.profile || ""}
                  editable={true}
                  user={user}
                  onFileSelected={handleProfilePictureChange}
                  isUploading={isUploadingPicture}
                />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.name}
                </h2>
                <Badge
                  variant={roleBadge.variant}
                  className="flex items-center w-fit mx-auto sm:mx-0"
                >
                  <RoleIcon className="mr-1 h-3 w-3" />
                  {roleBadge.label}
                </Badge>
              </div>

              <div className="flex items-center gap-2 justify-center sm:justify-start text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Bergabung {formatJoinDate(user.createdAt!)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Card>
        <Tabs defaultValue="profile">
          <CardHeader className="pb-0">
            <TabsList>
              <TabsTrigger value="profile">Informasi Profil</TabsTrigger>
              <TabsTrigger value="security">Keamanan</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Profile Tab */}
            <TabsContent value="profile">
              <div className="space-y-6">
                {/* Header Section */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Informasi Profil
                    </h3>
                    <p className="text-sm text-gray-600">
                      Kelola informasi pribadi dan kontak Anda
                    </p>
                  </div>
                  {!isEditingProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditProfile}
                    >
                      <Edit2 className="mr-1 h-4 w-4" />
                      Edit Profil
                    </Button>
                  )}
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <Input
                    label="Nama Lengkap"
                    value={profileForm.name}
                    onChange={(e) =>
                      handleProfileChange("name", e.target.value)
                    }
                    error={profileErrors.name}
                    placeholder="Masukkan nama lengkap"
                    disabled={!isEditingProfile}
                    required={isEditingProfile}
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={user.email}
                    placeholder="Masukkan email"
                    disabled
                  />

                  <Input
                    label="Nomor Telepon"
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) =>
                      handleProfileChange("phone", e.target.value)
                    }
                    error={profileErrors.phone}
                    placeholder="Masukkan nomor telepon"
                    disabled={!isEditingProfile}
                    required={isEditingProfile}
                  />

                  {/* Action Buttons - Only show when editing */}
                  {isEditingProfile && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="md"
                        onClick={handleCancelEditProfile}
                        disabled={isSavingProfile}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Batal
                      </Button>
                      <Button
                        size="md"
                        onClick={handleSaveProfile}
                        loading={isSavingProfile}
                        disabled={
                          isSavingProfile ||
                          !profileForm.name.trim() ||
                          !profileForm.phone.trim()
                        }
                      >
                        <Save className="mr-1 h-4 w-4" />
                        Simpan Perubahan
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <div className="space-y-6">
                {/* Password Change Section */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Ubah Password
                    </h3>
                    <p className="text-sm text-gray-600">
                      Perbarui password Anda untuk menjaga keamanan akun
                    </p>
                  </div>
                  {!isChangingPasswordMode && (
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
                {isChangingPasswordMode && (
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

                    <div className="relative">
                      <Input
                        label="Konfirmasi Password Baru"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          handlePasswordChange(
                            "confirmPassword",
                            e.target.value
                          )
                        }
                        error={passwordErrors.confirmPassword}
                        placeholder="Ulangi password baru"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
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

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="md"
                        onClick={handleCancelChangePassword}
                        disabled={isChangingPassword}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Batal
                      </Button>
                      <Button
                        size="md"
                        onClick={handleSavePassword}
                        loading={isChangingPassword}
                        disabled={
                          isChangingPassword ||
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

                {/* Danger Zone Section */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-900 mb-1">
                          Zona Berbahaya
                        </h4>
                        <p className="text-sm text-red-800 mb-4">
                          Tindakan ini bersifat permanen dan tidak dapat
                          dibatalkan. Semua data akun Anda akan hilang secara
                          permanen.
                        </p>

                        <Dialog
                          isOpen={isOpen}
                          onClose={() => setIsOpen(false)}
                          title="Apakah anda yakin ingin menghapus akun ini?"
                        >
                          <div className="text-center">
                            <p className="text-gray-500 mb-8 text-lg leading-relaxed font-medium">
                              Tindakan ini tidak dapat dibatalkan. Semua data
                              akun akan hilang secara permanen.
                            </p>

                            <div className="flex justify-center gap-10">
                              <Button
                                variant="primary"
                                size="md"
                                className="flex-1"
                                onClick={() => setIsOpen(false)}
                              >
                                Tidak, Batal
                              </Button>
                              <Button
                                variant="danger"
                                size="md"
                                className="flex-1"
                                onClick={handleDeleteAccount}
                              >
                                Ya, Hapus Akun
                              </Button>
                            </div>
                          </div>
                        </Dialog>

                        <Button
                          variant="danger"
                          onClick={() => setIsOpen(true)}
                          className="w-full sm:w-auto"
                          loading={isLoading}
                        >
                          Hapus Akun Permanen
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ProfilePage;
