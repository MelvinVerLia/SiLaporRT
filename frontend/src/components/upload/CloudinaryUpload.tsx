import React, { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { signUpload, uploadToCloudinary } from "../../services/uploadService";

type Props = {
  folder: "announcements" | "reports" | "profile";
  multiple?: boolean;
  accept?: string; // contoh: "image/*,.pdf"
  maxFiles?: number;
  onUploaded?: (
    files: Array<{
      public_id: string;
      secure_url: string;
      resource_type: string;
      format?: string;
      bytes?: number;
      width?: number;
      height?: number;
      original_filename?: string;
    }>
  ) => void;
  onError?: (message: string) => void;
  className?: string;
};

const CloudinaryUpload: React.FC<Props> = ({
  folder,
  multiple = true,
  accept,
  maxFiles = 5,
  onUploaded,
  onError,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState<
    Array<{
      public_id: string;
      secure_url: string;
      resource_type: string;
      format?: string;
      bytes?: number;
      width?: number;
      height?: number;
      original_filename?: string;
    }>
  >([]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    if (items.length + list.length > maxFiles) {
      onError?.(`Maksimal ${maxFiles} file`);
      return;
    }

    try {
      setUploading(true);
      const sign = await signUpload({ folder, resourceType: "auto" });

      const uploaded: typeof items = [];
      for (const f of list) {
        const res = await uploadToCloudinary(f, sign);
        uploaded.push(res);
      }

      const next = [...items, ...uploaded];
      setItems(next);
      onUploaded?.(uploaded);
    } catch (e: any) {
      onError?.(e?.message || "Gagal upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <div className={className}>
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Lampiran
      </label>

      <div
        className="border-2 border-dashed rounded-xl p-6 bg-white hover:bg-gray-50 transition cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <div className="flex flex-col items-center">
          <UploadCloud className="h-8 w-8 text-blue-600 mb-2" />
          <p className="text-sm text-gray-600 text-center">
            Klik untuk memilih file {multiple ? "(bisa banyak)" : ""}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {accept || "image/*, .pdf"}
          </p>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            multiple={multiple}
            accept={accept}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      </div>

      {uploading && <p className="text-sm text-blue-600 mt-2">Mengunggah...</p>}

      {items.length > 0 && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((it, idx) => (
            <div
              key={it.public_id}
              className="relative border rounded-lg overflow-hidden"
            >
              {it.resource_type === "image" ? (
                <img
                  src={it.secure_url}
                  alt={it.public_id}
                  className="w-full h-28 object-cover"
                />
              ) : (
                <div className="w-full h-28 flex items-center justify-center bg-gray-100 text-xs text-gray-600 p-2">
                  {it.original_filename || it.public_id}.{it.format || ""}
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="absolute top-1 right-1 bg-white/90 rounded-full p-1 shadow hover:bg-white"
                title="Hapus (lokal)"
              >
                <X className="h-4 w-4 text-gray-700" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CloudinaryUpload;
