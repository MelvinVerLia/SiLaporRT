import React, { useState, useEffect } from "react";
import { User, Shield, Edit2, Save, X, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import { useAuth } from "../hooks/useAuth";

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  // Edit mode states
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
  }, [user]);

  // Loading states
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setProfileForm({
      name: user.name,
      email: user.email || "",
      phone: user.phone || "",
    });
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
    setProfileForm({
      name: user.name,
      email: user.email || "",
      phone: user.phone || "",
    });
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);

    // Simulate API call
    setTimeout(() => {
      // In real app, call API to update profile
      console.log("Profile updated:", profileForm);
      setIsEditingProfile(false);
      setIsSavingProfile(false);
      // Show success message or update user context
    }, 1500);
  };

  const getRoleBadge = (role: string) => {
    return role === "RT_ADMIN"
      ? { variant: "info" as const, label: "Admin RT", icon: Shield }
      : { variant: "default" as const, label: "Warga", icon: User };
  };

  const roleBadge = getRoleBadge(user.role);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* User Information Card */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                {user.name.charAt(0).toUpperCase()}
              </div>
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
                  {formatJoinDate(user.createdAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Information Form */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Informasi Profil</CardTitle>
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
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="Nama Lengkap"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  placeholder="Masukkan nama lengkap"
                  disabled={!isEditingProfile}
                />

                <Input
                  label="Email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  placeholder="Masukkan email"
                  disabled={!isEditingProfile}
                />

                <Input
                  label="Nomor Telepon"
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, phone: e.target.value })
                  }
                  placeholder="Masukkan nomor telepon"
                  disabled={!isEditingProfile}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
