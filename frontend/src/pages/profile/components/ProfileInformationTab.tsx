import React, { useState, useEffect } from "react";
import { Edit2, Save, X } from "lucide-react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { ProfilePictureUploadRef } from "../../../components/upload/ProfilePictureUpload";
import { RT, User } from "../../../types/auth.types";
import SearchableDropdown from "../../../components/ui/SearchableDropdown";
import { getRtDropdown, getRtLocation } from "../../../services/authService";
import { useToast } from "../../../hooks/useToast";

interface ProfileInformationTabProps {
  user: User;
  uploadRef: React.RefObject<ProfilePictureUploadRef | null>;
  onSaveProfile: (data: {
    name: string;
    phone: string;
    profile: string;
    address: string;
    rtId: string;
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
    address: "",
    rtId: "",
  });
  const [profileErrors, setProfileErrors] = useState<{
    name?: string;
    phone?: string;
    address?: string;
    rtId?: string;
  }>({});
  const [rtData, setRtData] = useState([]);
  const [rtFormData, setRtFormData] = useState({
    kecamatan: "",
    kelurahan: "",
    rw: "",
    rt: "",
  });
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setProfileForm({
      name: user?.name || "",
      phone: user?.phone || "",
      profile: user?.profile || "",
      address: user?.address || "",
      rtId: user?.rtId || "",
    });
  }, [user]);

  useEffect(() => {
    const fetchRtData = async () => {
      const data = await getRtDropdown(search);
      setRtData(data.data);
    };

    const fetchRtLocation = async () => {
      const data = await getRtLocation(profileForm.rtId);
      setRtFormData({
        kecamatan: data.data.kecamatan,
        kelurahan: data.data.kelurahan,
        rw: data.data.rw,
        rt: data.data.rt,
      });
    };

    try {
      setIsLoading(true);
      fetchRtData();
      if (profileForm.rtId) fetchRtLocation();
    } catch (error) {
      console.log("sum ting wong a", error);
    } finally {
      setIsLoading(false);
    }
  }, [search, profileForm.rtId]);

  const rtOptions = rtData.map((rt: RT) => ({
    label: rt.name,
    value: rt.rtId,
  }));

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateProfile = () => {
    const errors: {
      name?: string;
      phone?: string;
      address?: string;
      rtId?: string;
    } = {};

    if (!profileForm.name.trim()) {
      errors.name = "Nama lengkap wajib diisi";
    }

    if (!profileForm.phone.trim()) {
      errors.phone = "Nomor telepon wajib diisi";
    } else if (!/^[0-9+\-\s]+$/.test(profileForm.phone)) {
      errors.phone = "Format nomor telepon tidak valid";
    }

    if (!profileForm.address.trim()) {
      errors.address = "Alamat wajib diisi";
    }
    if (!profileForm.rtId.trim()) {
      errors.rtId = "RT wajib diisi";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (!user.name || !user.phone || !user.address || !user.rtId)
      setIsEditing(true);
  }, [user]);

  const handleProfileChange = (field: string, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));

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
      address: user.address || "",
      rtId: user.rtId || "",
    });
    setProfileErrors({});
  };

  const handleCancelEdit = () => {
    if (!user.name || !user.phone || !user.address || !user.rtId) {
      toast.warning("Lengkapi profil terlebih dahulu", "Peringatan");
      return;
    }
    setIsEditing(false);
    setProfileForm({
      name: user.name || "",
      phone: user.phone || "",
      profile: user.profile || "",
      address: user.address || "",
      rtId: user.rtId || "",
    });
    setProfileErrors({});
  };

  const handleSave = async () => {
    if (!validateProfile()) {
      return;
    }

    try {
      let profileUrl = profileForm.profile;

      if (uploadRef.current?.hasPreview()) {
        const uploadedUrl = await uploadRef.current.upload();
        if (uploadedUrl) profileUrl = uploadedUrl;
      }

      await onSaveProfile({
        ...profileForm,
        profile: profileUrl,
      });

      setIsEditing(false);
      setProfileErrors({});
      uploadRef.current?.clearPreview();
    } catch (error) {
      console.error("Error in ProfileInformationTab:", error);
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

        <Input
          label="Alamat"
          type="address"
          value={profileForm.address}
          onChange={(e) => handleProfileChange("address", e.target.value)}
          error={profileErrors.address}
          placeholder="Masukkan alamat anda"
          disabled={!isEditing}
          required={isEditing}
        />

        <SearchableDropdown
          label="Nama RT"
          name="rtId"
          error={profileErrors.rtId}
          options={isLoading ? [] : rtOptions}
          required
          value={profileForm.rtId}
          search={search}
          onSearchChange={setSearch}
          onChange={handleChange}
          disabled={!isEditing}
        />

        {profileForm.rtId && (
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
                !profileForm.phone.trim() ||
                !profileForm.address.trim() ||
                !profileForm.rtId
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
