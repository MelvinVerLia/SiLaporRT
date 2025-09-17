import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { signUpload, uploadToCloudinary } from "../../services/uploadService";
import { CloudinaryFile } from "../../types/announcement.types";
import { User } from "../../types/auth.types";

type Props = {
  folder?: "profile";
  currentUrl?: string;
  onUploaded?: (file: CloudinaryFile) => void;
  onRemove?: () => void;
  onError?: (message: string) => void;
  className?: string;
  editable?: boolean;
  user: User;
  saving?: boolean;
};

export type ProfilePictureUploadRef = {
  upload: () => Promise<string | null>;
};

const ProfilePictureUpload = React.forwardRef<ProfilePictureUploadRef, Props>(
  ({ folder = "profile", currentUrl, className, editable, user }, ref) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      async upload() {
        if (!previewFile) return null;
        const sign = await signUpload({ folder, resourceType: "image" });
        const uploaded = await uploadToCloudinary(previewFile, sign);
        return uploaded.secure_url;
      },
    }));

    useEffect(() => {
      if (!editable) {
        setPreviewFile(null);
        setPreviewUrl(null);
      }

      return () => {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
      };
    }, [previewUrl, editable]);

    return (
      <div className={`flex flex-col items-center ${className || ""}`}>
        <div className="relative">
          <div
            className={`mx-auto w-24 h-24 bg-gradient-to-br relative from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 overflow-hidden ${
              editable ? "cursor-pointer" : "cursor-default"
            }`}
            onClick={() => editable && inputRef.current?.click()}
          >
            {editable && previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : currentUrl ? (
              <img
                src={currentUrl}
                alt={user.name!.charAt(0).toUpperCase()}
                className="h-full w-full object-cover"
              />
            ) : (
              user.name!.charAt(0).toUpperCase()
            )}
          </div>

          {editable && (
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (file) {
                  setPreviewFile(file);
                  setPreviewUrl(URL.createObjectURL(file));
                }
              }}
            />
          )}

          {editable && (
            <div className="absolute bottom-3 right-0.5 bg-black bg-opacity-50 text-white rounded-full p-2 shadow-md hover:cursor-pointer">
              <Camera className="h-6 w-6" />
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default ProfilePictureUpload;
