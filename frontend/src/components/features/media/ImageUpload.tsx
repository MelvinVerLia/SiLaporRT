import React from "react";
import CloudinaryUpload from "../../upload/CloudinaryUpload";
import { CloudinaryFile } from "../../../types/announcement.types";

interface ImageUploadProps {
  files: CloudinaryFile[];
  onFilesChange: (files: CloudinaryFile[]) => void;
  maxFiles?: number;
  error?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  files,
  onFilesChange,
  maxFiles = 5,
  error,
}) => {
  const handleUploaded = (newFiles: CloudinaryFile[]) => {
    onFilesChange([...files, ...newFiles]);
  };

  const handleRemove = (identifier: string) => {
    // For cloudinary files, identifier is publicId
    const filtered = files.filter((file) => file.public_id !== identifier);
    onFilesChange(filtered);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Lampiran Foto (Opsional)
        </h3>
        <p className="text-gray-600 text-sm">
          Tambahkan foto sebagai bukti laporan Anda
        </p>
      </div>

      <CloudinaryUpload
        folder="reports"
        multiple={true}
        accept="image/*"
        maxFiles={maxFiles}
        attachments={files.map((file) => ({
          filename: file.original_filename || "image",
          url: file.secure_url,
          fileType: "image" as const,
          provider: "cloudinary" as const,
          publicId: file.public_id,
          resourceType: file.resource_type,
          format: file.format,
          bytes: file.bytes,
          width: file.width,
          height: file.height,
        }))}
        onUploaded={handleUploaded}
        onRemove={handleRemove}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default ImageUpload;
