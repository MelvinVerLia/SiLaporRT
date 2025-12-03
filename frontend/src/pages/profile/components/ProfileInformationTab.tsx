import React, { useState, useEffect } from "react";
import { Edit2, Save, X } from "lucide-react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { ProfilePictureUploadRef } from "../../../components/upload/ProfilePictureUpload";
import { User } from "../../../types/auth.types";

interface ProfileInformationTabProps {
  user: User;
  uploadRef: React.RefObject<ProfilePictureUploadRef | null>;
  onSaveProfile: (data: {
    name: string;
    phone: string;
    profile: string;
  }) => Promise<void>;
  isSaving: boolean;
}

const ProfileInformationTab: React.FC<ProfileInformationTabProps> = ({
  user,
  uploadRef,
  onSaveProfile,
  isSaving,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    profile: "",
  });
  const [profileErrors, setProfileErrors] = useState<{
    name?: string;
    phone?: string;
  }>({});

  // Initialize form with user data
  useEffect(() => {
    setProfileForm({
      name: user?.name || "",
      phone: user?.phone || "",
      profile: user?.profile || "",
    });
  }, [user]);

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

  const handleStartEdit = () => {
    setIsEditing(true);
    setProfileForm({
      name: user.name || "",
      phone: user.phone || "",
      profile: user.profile || "",
    });
    setProfileErrors({});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfileForm({
      name: user.name || "",
      phone: user.phone || "",
      profile: user.profile || "",
    });
    setProfileErrors({});
  };

  const handleSave = async () => {
    if (!validateProfile()) {
      return;
    }

    try {
      let profileUrl = profileForm.profile;

      // Check if there's a new profile picture to upload
      if (uploadRef.current?.hasPreview()) {
        const uploadedUrl = await uploadRef.current.upload();
        if (uploadedUrl) profileUrl = uploadedUrl;
      }

      await onSaveProfile({
        ...profileForm,
        profile: profileUrl,
      });

      // Reset state after successful save
      setIsEditing(false);
      setProfileErrors({});
      uploadRef.current?.clearPreview();
    } catch (error) {
      console.error("Error in ProfileInformationTab:", error);
      // Error handling dilakukan di parent (ProfilePage)
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Informasi Profil
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Kelola informasi pribadi dan kontak Anda
          </p>
        </div>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={handleStartEdit}>
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
          onChange={(e) => handleProfileChange("name", e.target.value)}
          error={profileErrors.name}
          placeholder="Masukkan nama lengkap"
          disabled={!isEditing}
          required={isEditing}
        />

        <Input
          label="Email"
          type="email"
          value={user.email || ""}
          placeholder="Masukkan email"
          disabled
        />

        <Input
          label="Nomor Telepon"
          type="tel"
          value={profileForm.phone}
          onChange={(e) => handleProfileChange("phone", e.target.value)}
          error={profileErrors.phone}
          placeholder="Masukkan nomor telepon"
          disabled={!isEditing}
          required={isEditing}
        />

        {/* Action Buttons - Only show when editing */}
        {isEditing && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={handleCancelEdit}
              disabled={isSaving}
            >
              <X className="mr-1 h-4 w-4" />
              Batal
            </Button>
            <Button
              size="md"
              onClick={handleSave}
              loading={isSaving}
              disabled={
                isSaving ||
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
  );
};

export default ProfileInformationTab;
