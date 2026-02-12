import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { signUpload, uploadToCloudinary } from "../../services/uploadService";
import { CloudinaryFile } from "../../types/announcement.types";
import { User } from "../../types/auth.types";
import LoadingSpinner from "../ui/LoadingSpinner";

type Props = {
  folder?: "profile";
  currentUrl?: string;
  onUploaded?: (file: CloudinaryFile) => void;
  onRemove?: () => void;
  onError?: (message: string) => void;
  onFileSelected?: (file: File) => void;
  className?: string;
  editable?: boolean;
  user: User;
  saving?: boolean;
  isUploading?: boolean;
};

export type ProfilePictureUploadRef = {
  upload: () => Promise<string | null>;
  uploadFile: (file: File) => Promise<string | null>;
  hasPreview: () => boolean;
  clearPreview: () => void;
};

const ProfilePictureUpload = React.forwardRef<ProfilePictureUploadRef, Props>(
  (
    {
      folder = "profile",
      currentUrl,
      className,
      editable,
      user,
      onFileSelected,
      isUploading = false,
    },
    ref,
  ) => {
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
      async uploadFile(file: File) {
        const sign = await signUpload({ folder, resourceType: "image" });
        const uploaded = await uploadToCloudinary(file, sign);
        return uploaded.secure_url;
      },
      hasPreview() {
        return !!previewFile;
      },
      clearPreview() {
        setPreviewFile(null);
        setPreviewUrl(null);
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
            className={`mx-auto w-32 h-32 bg-gradient-to-br relative from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 overflow-hidden ${
              editable && !isUploading ? "cursor-pointer" : "cursor-default"
            } ${isUploading ? "opacity-75" : ""}`}
            onClick={() =>
              editable && !isUploading && inputRef.current?.click()
            }
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

            {/* Loading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-full">
                <LoadingSpinner size="lg" className="text-white" />
              </div>
            )}
          </div>

          {editable && (
            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              className="hidden"
              disabled={isUploading}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (file) {
                  setPreviewFile(file);
                  setPreviewUrl(URL.createObjectURL(file));
                  onFileSelected?.(file);
                }
              }}
            />
          )}

          {editable && !isUploading && (
            <div
              className="absolute bottom-3 right-0.5 bg-black bg-opacity-50 text-white rounded-full p-2 shadow-md hover:bg-opacity-70 cursor-pointer transition-all duration-200"
              onClick={() => inputRef.current?.click()}
            >
              <Plus className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default ProfilePictureUpload;
