import React, { useState, useEffect } from "react";
import { User as UserIcon, Shield, Calendar } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import ProfilePictureUpload, {
  ProfilePictureUploadRef,
} from "../../../components/upload/ProfilePictureUpload";
import { User } from "../../../types/auth.types";

interface ProfileHeaderProps {
  user: User;
  uploadRef: React.RefObject<ProfilePictureUploadRef | null>;
  onProfilePictureChange: (file: File) => Promise<void>;
  isUploadingPicture: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  uploadRef,
  onProfilePictureChange,
  isUploadingPicture,
}) => {
  const [coverColor, setCoverColor] = useState<string>("#3b82f6");

  // Extract dominant color from profile picture
  useEffect(() => {
    if (!user?.profile) {
      setCoverColor("#1e3a5f"); // Default dark blue for dark mode
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

        // Darken the color for better contrast
        const darkenFactor = 0.7;
        r = Math.floor(r * darkenFactor);
        g = Math.floor(g * darkenFactor);
        b = Math.floor(b * darkenFactor);

        setCoverColor(`rgb(${r}, ${g}, ${b})`);
      } catch (error) {
        console.error("Error extracting color:", error);
        setCoverColor("#1e3a5f");
      }
    };

    img.onerror = () => {
      setCoverColor("#1e3a5f"); // Fallback to default dark blue
    };
  }, [user?.profile]);

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleBadge = (role: string) => {
    return role === "RT_ADMIN"
      ? { variant: "info" as const, label: "Admin RT", icon: Shield }
      : { variant: "default" as const, label: "Warga", icon: UserIcon };
  };

  const roleBadge = getRoleBadge(user.role!);
  const RoleIcon = roleBadge.icon;

  return (
    <Card className="overflow-hidden">
      {/* Background Cover */}
      <div
        className="h-32 relative transition-colors duration-500"
        style={{ backgroundColor: coverColor }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/20 dark:from-black/10 dark:to-black/30"></div>
      </div>

      {/* Profile Content */}
      <CardContent className="px-6 pb-8 -mt-16">
        <div className="flex flex-col sm:flex-row items-center sm:items-end sm:gap-6">
          {/* Profile Picture */}
          <div className="flex-shrink-0 relative">
            <div className="ring-4 ring-white dark:ring-gray-800 rounded-full">
              <ProfilePictureUpload
                ref={uploadRef}
                currentUrl={user.profile || ""}
                editable={true}
                user={user}
                onFileSelected={onProfilePictureChange}
                isUploading={isUploadingPicture}
              />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate max-w-[200px] md:max-w-[400px] lg:max-w-[600px] mx-auto sm:mx-0">
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

            <div className="flex items-center gap-2 justify-center sm:justify-start text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>Bergabung {formatJoinDate(user.createdAt!)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
