import React, { useRef, useState } from "react";
import { UploadCloud, X, FileText, FileImage, FileVideo } from "lucide-react";
import { signUpload, uploadToCloudinary } from "../../services/uploadService";
import { CloudinaryFile } from "../../types/announcement.types";
import { useToast } from "../../hooks/useToast";

// Extended type untuk internal processing (sesuai dengan yang ada di AdminAnnouncementForm)
type AttachmentFile = {
  id?: string; // Database ID for existing attachments
  filename: string;
  url: string;
  fileType: "image" | "video" | "document";
  provider?: "cloudinary"; // Made optional to match FormAttachment
  publicId?: string; // Made optional to match FormAttachment
  resourceType?: string; // Made optional to match FormAttachment
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
};

type Props = {
  folder: "announcements" | "reports" | "profile";
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  attachments?: AttachmentFile[]; // Controlled from parent
  onUploaded?: (files: CloudinaryFile[]) => void;
  onRemove?: (identifier: string) => void; // Use id for database attachments, publicId for new uploads
  onError?: (message: string) => void;
  onUploadingChange?: (isUploading: boolean) => void; // New prop to track upload status
  className?: string;
};

const CloudinaryUpload: React.FC<Props> = ({
  folder,
  multiple = true,
  accept,
  maxFiles = 5,
  attachments = [],
  onUploaded,
  onRemove,
  onError,
  onUploadingChange,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  // Notify parent when upload status changes
  const setUploadingWithCallback = (isUploading: boolean) => {
    setUploading(isUploading);
    onUploadingChange?.(isUploading);
  };

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);

    if (attachments.length + list.length > maxFiles) {
      toast.error(`Maksimal ${maxFiles} file`, "Upload Gagal");
      return;
    }

    try {
      setUploadingWithCallback(true);

      const uploaded: CloudinaryFile[] = [];
      for (const f of list) {
        // Determine resource type based on file
        let resourceType: "image" | "video" | "raw" | "auto" = "auto";
        const isPdf =
          f.type === "application/pdf" || /\.pdf$/i.test(f.name || "");
        const isDoc = /\.(doc|docx|xls|xlsx|ppt|pptx|txt)$/i.test(f.name || "");

        if (isPdf || isDoc) {
          resourceType = "raw";
        } else if (f.type.startsWith("image/")) {
          resourceType = "image";
        } else if (f.type.startsWith("video/")) {
          resourceType = "video";
        }

        const sign = await signUpload({ folder, resourceType });
        const res = await uploadToCloudinary(f, sign);
        uploaded.push(res);
      }

      onUploaded?.(uploaded);

      // Show success toast
      const fileCount = uploaded.length;
      const fileText = fileCount === 1 ? "file" : "file";
      toast.success(
        `${fileCount} ${fileText} berhasil diunggah`,
        "Upload Berhasil"
      );
    } catch (e: unknown) {
      const error = e as Error;
      toast.error(error?.message || "Gagal mengunggah file", "Upload Gagal");
      onError?.(error?.message || "Gagal upload");
    } finally {
      setUploadingWithCallback(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const hasFiles = attachments.length > 0;

  return (
    <div className={className}>
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Lampiran {hasFiles && `(${attachments.length}/${maxFiles})`}
      </label>

      {/* Upload Area - berubah tampilan jika sudah ada file */}
      <div
        className={`
          border-2 border-dashed rounded-xl p-6 transition cursor-pointer
          ${
            hasFiles
              ? "border-green-200 bg-green-50 hover:bg-green-100"
              : "border-gray-300 bg-white hover:bg-gray-50"
          }
          ${
            attachments.length >= maxFiles
              ? "opacity-50 cursor-not-allowed"
              : ""
          }
        `}
        onClick={() => {
          if (attachments.length < maxFiles) {
            inputRef.current?.click();
          }
        }}
      >
        <div className="flex flex-col items-center">
          <UploadCloud
            className={`h-8 w-8 mb-2 ${
              hasFiles ? "text-green-600" : "text-primary-600"
            }`}
          />
          <p className="text-sm text-gray-600 text-center">
            {hasFiles
              ? `${
                  attachments.length >= maxFiles
                    ? "Maksimal file tercapai"
                    : "Klik untuk menambah file lagi"
                }`
              : `Klik untuk memilih file ${multiple ? "(bisa banyak)" : ""}`}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {accept || "image/*, video/*, documents"} • Max {maxFiles} files
          </p>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            multiple={multiple}
            accept={accept}
            onChange={(e) => handleFiles(e.target.files)}
            disabled={attachments.length >= maxFiles}
          />
        </div>
      </div>

      {uploading && (
        <div className="mt-2 flex items-center gap-2 text-sm text-primary-600">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent"></div>
          Mengunggah...
        </div>
      )}

      {/* File Preview - Tampilan terpusat untuk semua file */}
      {attachments.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">File Terlampir:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.publicId}
                className="relative group border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
              >
                {/* Preview Content */}
                <div className="aspect-square flex items-center justify-center bg-gray-50">
                  {attachment.fileType === "image" ? (
                    <img
                      src={attachment.url}
                      alt={attachment.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <FileText className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-600 font-medium truncate w-full">
                        {attachment.filename}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        {attachment.format?.toUpperCase()}
                        {attachment.bytes &&
                          ` • ${Math.round(attachment.bytes / 1024)} KB`}
                      </span>
                    </div>
                  )}
                </div>

                {/* File Info Overlay untuk Image */}
                {attachment.fileType === "image" && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 transform translate-y-full group-hover:translate-y-0 transition-transform">
                    <div className="text-xs truncate font-medium">
                      {attachment.filename}
                    </div>
                    <div className="text-xs text-gray-200">
                      {attachment.format?.toUpperCase()}
                      {attachment.bytes &&
                        ` • ${Math.round(attachment.bytes / 1024)} KB`}
                      {attachment.width &&
                        attachment.height &&
                        ` • ${attachment.width}×${attachment.height}`}
                    </div>
                  </div>
                )}

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() =>
                    onRemove?.(attachment.id || attachment.publicId || "")
                  }
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Hapus file"
                >
                  <X className="h-3 w-3" />
                </button>

                {/* Type Badge */}
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-90 text-gray-700 shadow-sm">
                    {attachment.fileType === "image" ? (
                      <FileImage className="h-3 w-3" />
                    ) : attachment.fileType === "video" ? (
                      <FileVideo className="h-3 w-3" />
                    ) : (
                      <FileText className="h-3 w-3" />
                    )}
                    {attachment.fileType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudinaryUpload;
