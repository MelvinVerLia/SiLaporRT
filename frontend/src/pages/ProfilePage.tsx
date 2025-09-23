import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Shield,
  Edit2,
  Save,
  X,
  CheckCircle,
  EyeOff,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
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
  const { user, updateProfile, deleteAccount, changePassword, logout } =
    useAuthContext();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("profile");
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    profile: "",
  });
  const [currentProfilePicture, setCurrentProfilePicture] = useState(
    user?.profile || ""
  );
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
    setCurrentProfilePicture(user?.profile || "");
  }, [user]);

  const uploadRef = useRef<ProfilePictureUploadRef>(null);
  // Loading states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
      if (uploadRef.current) {
        const uploadedUrl = await uploadRef.current.upload();
        if (uploadedUrl) profileUrl = uploadedUrl;
      }
      await updateProfile({
        ...profileForm,
        profile: profileUrl,
      });
      toast.success("Profil berhasil disimpan", "Berhasil");
      setIsEditingProfile(false);
      clearProfileErrors();
    } catch (error) {
      console.log(error);
      toast.error("Gagal menyimpan profil", "Error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(passwordForm.newPassword);
      toast.success("Password berhasil diubah", "Berhasil");
      setPasswordForm({
        newPassword: "",
        confirmPassword: "",
      });
      clearPasswordErrors();
      await logout();
    } catch (error) {
      console.log(error);
      toast.error("Gagal mengubah password", "Error");
    } finally {
      setIsChangingPassword(false);
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
        <p className="text-gray-600 mt-1">
          Kelola informasi akun dan profil Anda
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Information Card */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="text-center">
              <ProfilePictureUpload
                ref={uploadRef}
                currentUrl={currentProfilePicture}
                editable={isEditingProfile}
                user={user}
              />
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <div className="flex justify-center mt-2">
                <Badge
                  variant={roleBadge.variant}
                  className="flex items-center"
                >
                  <RoleIcon className="mr-1 h-3 w-3" />
                  {roleBadge.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Account Status */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Status Akun</span>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    {user.isActive ? "Aktif" : "Tidak Aktif"}
                  </span>
                </div>
              </div>

              {/* Join Date */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Bergabung Sejak</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatJoinDate(user.createdAt!)}
                </span>
              </div>
            </CardContent>

            {/* 🔥 Danger Zone */}
            <div className="mt-4 border-t border-gray-200 p-4">
              <Dialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Apakah anda yakin ingin menghapus akun ini?"
              >
                <div className="text-center">
                  <p className="text-gray-500 mb-8 text-lg leading-relaxed font-medium">
                    Tindakan ini tidak dapat dibatalkan. Semua data akun akan
                    hilang secara permanen.
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
                className="w-full"
                loading={isLoading}
              >
                Hapus Akun
              </Button>
              <p className="text-xs text-gray-400 mt-2">
                Menghapus akun bersifat permanen dan tidak dapat dipulihkan.
              </p>
            </div>
          </Card>
        </div>

        {/* Profile Information Form */}
        <div className="lg:col-span-2">
          <Tabs
            defaultValue="profile"
            className="h-full"
            onValueChange={(value) => {
              if (isEditingProfile) {
                handleCancelEditProfile();
              }
              setCurrentTab(value);
            }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="profile">Informasi Profil</TabsTrigger>
                    <TabsTrigger value="password">Ubah Password</TabsTrigger>
                  </TabsList>

                  {currentTab === "profile" && (
                    <div className="flex space-x-2">
                      {isEditingProfile ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEditProfile}
                            disabled={isSavingProfile}
                          >
                            <X className="mr-1 h-4 w-4" />
                            Batal
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveProfile}
                            loading={isSavingProfile}
                            disabled={
                              isSavingProfile ||
                              !profileForm.name.trim() ||
                              !profileForm.phone.trim()
                            }
                          >
                            <Save className="mr-1 h-4 w-4" />
                            Simpan
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEditProfile}
                        >
                          <Edit2 className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {/* Tab 1: Informasi Profil */}
                <TabsContent value="profile">
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
                  </div>
                </TabsContent>

                {/* Tab 2: Change Password */}
                <TabsContent value="password">
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

                    <Button
                      size="md"
                      className="mt-2"
                      onClick={handleChangePassword}
                      loading={isChangingPassword}
                      disabled={
                        isChangingPassword ||
                        !passwordForm.newPassword ||
                        !passwordForm.confirmPassword
                      }
                    >
                      Ubah Password 
                    </Button>
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
