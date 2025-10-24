import React, { useState, useRef } from "react";
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
import SecurityTab from "./components/SecurityTab";
import ProfileInformationTab from "./components/ProfileInformationTab";
import ProfileHeader from "./components/ProfileHeader";

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
          });

          if (success) {
            toast.success("Foto profil berhasil diubah", "Berhasil");
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
    <div className="space-y-6">
      {/* Profile Header */}
      <ProfileHeader
        user={user}
        uploadRef={uploadRef}
        onProfilePictureChange={handleProfilePictureChange}
        isUploadingPicture={isUploadingPicture}
      />

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
              <ProfileInformationTab
                user={user}
                uploadRef={uploadRef}
                onSaveProfile={handleSaveProfile}
                isSaving={isSavingProfile}
              />
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <SecurityTab
                onChangePassword={handleSavePassword}
                isChangingPassword={isChangingPassword}
                onDeleteAccount={handleDeleteAccount}
                isDeletingAccount={isLoading}
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ProfilePage;
