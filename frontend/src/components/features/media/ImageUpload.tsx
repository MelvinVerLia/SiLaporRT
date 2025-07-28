import React, { useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Button from "../../ui/Button";

interface ImageUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  error?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  files,
  onFilesChange,
  maxFiles = 5,
  error,
}) => {
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      const validFiles = selectedFiles.filter((file) => {
        const isImage = file.type.startsWith("image/");
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
        return isImage && isValidSize;
      });

      const newFiles = [...files, ...validFiles].slice(0, maxFiles);
      onFilesChange(newFiles);

      // Reset input
      e.target.value = "";
    },
    [files, onFilesChange, maxFiles]
  );

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
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

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={files.length >= maxFiles}
        />

        <label
          htmlFor="file-upload"
          className={`cursor-pointer ${
            files.length >= maxFiles ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            {files.length >= maxFiles
              ? `Maksimal ${maxFiles} file`
              : "Klik untuk pilih foto atau drag & drop"}
          </p>
          <p className="text-xs text-gray-500">PNG, JPG hingga 5MB</p>
        </label>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">
            File Terpilih ({files.length}/{maxFiles})
          </h4>

          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <ImageIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default ImageUpload;
