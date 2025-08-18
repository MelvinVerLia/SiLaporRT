// Simple, explicit allowlist per konteks:
export const UPLOAD_POLICY = {
  profile: {
    // hanya gambar, kecil
    maxBytes: 5 * 1024 * 1024, // 5 MB
    resourceTypes: ["image"] as const,
    formats: ["jpg", "jpeg", "png", "webp", "gif"],
  },
  report: {
    // fleksibel: image/video/pdf/raw
    maxBytes: 50 * 1024 * 1024, // 50 MB
    resourceTypes: ["image", "video", "raw"] as const,
    formats: [
      // image
      "jpg",
      "jpeg",
      "png",
      "webp",
      "gif",
      // video (umum)
      "mp4",
      "mov",
      "webm",
      // dokumen
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "txt",
    ],
  },
  announcement: {
    // umumnya image/pdf
    maxBytes: 10 * 1024 * 1024, // 10 MB
    resourceTypes: ["image", "raw"] as const,
    formats: ["jpg", "jpeg", "png", "webp", "gif", "pdf"],
  },
} as const;

export type UploadContext = keyof typeof UPLOAD_POLICY;

export function validateUpload(
  context: UploadContext,
  params: { resourceType?: string; format?: string; bytes?: number }
) {
  const policy = UPLOAD_POLICY[context];
  const rtype = (params.resourceType || "").toLowerCase();
  const fmt = (params.format || "").toLowerCase();
  const size = params.bytes ?? 0;

  if (!policy.resourceTypes.includes(rtype as any)) {
    throw new Error(`File type '${rtype}' tidak diizinkan untuk ${context}`);
  }
  if (fmt && !policy.formats.includes(fmt as any)) {
    throw new Error(`Format '${fmt}' tidak diizinkan untuk ${context}`);
  }
  if (size > policy.maxBytes) {
    throw new Error(
      `Ukuran file melebihi batas ${Math.floor(
        policy.maxBytes / 1024 / 1024
      )}MB untuk ${context}`
    );
  }
}
