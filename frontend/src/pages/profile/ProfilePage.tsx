import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { useToast } from "../../hooks/useToast";
import { ProfilePictureUploadRef } from "../../components/upload/ProfilePictureUpload";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/Tabs";
import { Clock, XCircle, CheckCircle, UserCog } from "lucide-react";
import SecurityTab from "./components/SecurityTab";
import ProfileInformationTab from "./components/ProfileInformationTab";
import ProfileHeader from "./components/ProfileHeader";
import NotificationPopup from "../../components/ui/NotificationPopup";
import { VerificationStatus } from "../../types/auth.types";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const navigate = useNavigate();

  const uploadRef = useRef<ProfilePictureUploadRef>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [notificationRequest, setNotificationRequest] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) return;

    if (Notification.permission !== "default") return;

    const hasAsked = sessionStorage.getItem("notification_prompt_shown");

    if (hasAsked) return;

    setNotificationRequest(true);
    sessionStorage.setItem("notification_prompt_shown", "true");
  }, []);

  // Safety fallback (harusnya tidak kejadian karena ProtectedRoute sudah filter)
  if (!user) return null;

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
    }
  };

  const handleSaveProfile = async (data: {
    name: string;
    phone: string;
    profile: string;
    address: string;
    rtId: string;
  }) => {
    setIsSavingProfile(true);
    try {
      const success = await updateProfile(data);

      if (success) {
        toast.success("Profil berhasil disimpan", "Berhasil");
      } else {
        toast.error("Gagal menyimpan profil", "Error");
        throw new Error("Failed to save profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Terjadi kesalahan saat menyimpan profil", "Error");
      throw error; // Re-throw untuk error handling di ProfileInformationTab
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleProfilePictureChange = async (file: File) => {
    // Client-side validation for profile picture
    const MAX_PROFILE_BYTES = 5 * 1024 * 1024; // 5 MB
    const ALLOWED_FORMATS = ["jpg", "jpeg", "png"];

    if (file.size > MAX_PROFILE_BYTES) {
      toast.error(
        `Ukuran file terlalu besar (${(file.size / 1024 / 1024).toFixed(1)}MB). Maksimal 5MB.`,
        "Upload Gagal",
      );
      uploadRef.current?.clearPreview();
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_FORMATS.includes(ext)) {
      toast.error(
        `Format file '${ext}' tidak didukung. Gunakan: ${ALLOWED_FORMATS.join(", ")}`,
        "Upload Gagal",
      );
      uploadRef.current?.clearPreview();
      return;
    }

    setIsUploadingPicture(true);
    try {
      // Upload using ref method from ProfilePictureUpload
      if (uploadRef.current) {
        const uploadedUrl = await uploadRef.current.uploadFile(file);

        if (uploadedUrl) {
          const success = await updateProfile({
            name: user.name || "",
            phone: user.phone || "",
            profile: uploadedUrl,
            address: user.address || "",
            rtId: user.rtId || "",
          });

          if (success) {
            toast.success("Foto profil berhasil diubah", "Berhasil");
          } else {
            toast.error("Gagal menyimpan foto profil", "Error");
            uploadRef.current?.clearPreview();
          }
        } else {
          toast.error("Gagal mengupload foto", "Error");
          uploadRef.current?.clearPreview();
        }
      }
    } catch (error: unknown) {
      console.error("Error uploading profile picture:", error);
      const err = error as {
        message?: string;
        response?: { data?: { message?: string } };
      };
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        "Terjadi kesalahan saat mengubah foto profil";
      toast.error(msg, "Upload Gagal");
      uploadRef.current?.clearPreview();
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleSavePassword = async (newPassword: string) => {
    const success = await changePassword(newPassword);
    if (success) {
      toast.success("Password berhasil diubah", "Berhasil");
      logout();
      navigate("/login");
    } else {
      toast.error("Gagal mengubah password", "Error");
      throw new Error("Failed to change password");
    }
  };

  return (
    <>
      {notificationRequest && user?.id && (
        <NotificationPopup
          userId={user.id}
          onClose={() => setNotificationRequest(false)}
        />
      )}
      <div className="space-y-6 bg-transparent dark:bg-transparent">
        <ProfileHeader
          user={user}
          uploadRef={uploadRef}
          onProfilePictureChange={handleProfilePictureChange}
          isUploadingPicture={isUploadingPicture}
        />

        {/* Verification Status Banner */}
        {user.role === "CITIZEN" &&
          user.verificationStatus === VerificationStatus.UNVERIFIED && (
            <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
              <UserCog className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-300">
                  Lengkapi Profil Anda
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-0.5">
                  Silakan lengkapi data profil Anda (nomor telepon, alamat, dan
                  RT) untuk mengajukan verifikasi akun.
                </p>
              </div>
            </div>
          )}

        {user.role === "CITIZEN" &&
          user.verificationStatus === VerificationStatus.PENDING && (
            <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-500/30 dark:bg-yellow-500/10">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-300">
                  Menunggu Verifikasi
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-0.5">
                  Akun Anda sedang menunggu verifikasi oleh admin RT. Anda akan
                  mendapatkan akses penuh ke fitur internal setelah
                  diverifikasi.
                </p>
              </div>
            </div>
          )}

        {user.role === "CITIZEN" &&
          user.verificationStatus === VerificationStatus.REJECTED && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-300">
                  Verifikasi Ditolak
                </p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-0.5">
                  Verifikasi akun Anda ditolak oleh admin RT. Silakan hubungi
                  admin RT untuk informasi lebih lanjut.
                </p>
              </div>
            </div>
          )}

        {user.role === "CITIZEN" &&
          user.verificationStatus === VerificationStatus.VERIFIED && (
            <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-500/30 dark:bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-300">
                  Akun Terverifikasi
                </p>
                <p className="text-sm text-green-700 dark:text-green-400 mt-0.5">
                  Akun Anda telah diverifikasi. Anda memiliki akses penuh ke
                  seluruh fitur.
                </p>
              </div>
            </div>
          )}

        <Card>
          <Tabs defaultValue="profile">
            <CardHeader className="pb-0">
              <TabsList>
                <TabsTrigger value="profile">Informasi Profil</TabsTrigger>
                <TabsTrigger value="security">Keamanan</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="pt-6">
              <TabsContent value="profile">
                <ProfileInformationTab
                  user={user}
                  uploadRef={uploadRef}
                  onSaveProfile={handleSaveProfile}
                  isSaving={isSavingProfile}
                />
              </TabsContent>

              <TabsContent value="security">
                <SecurityTab
                  onChangePassword={handleSavePassword}
                  isChangingPassword={isChangingPassword}
                  onDeleteAccount={handleDeleteAccount}
                  isDeletingAccount={isLoading}
                  user={user}
                  onClose={() => setNotificationRequest(false)}
                />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </>
  );
};

export default ProfilePage;
