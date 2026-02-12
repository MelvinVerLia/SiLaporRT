// Upload policy per context
export const UPLOAD_POLICY = {
  profile: {
    maxBytes: 5 * 1024 * 1024, // 5 MB
    resourceTypes: ["image"] as const,
    formats: ["jpg", "jpeg", "png"],
  },
  reports: {
    maxBytes: 50 * 1024 * 1024, // 50 MB
    resourceTypes: ["image", "video", "raw"] as const, // "video" = Cloudinary resource type for mp3
    formats: [
      "jpg",
      "jpeg",
      "png",
      "mp3",
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
    ],
  },
  announcements: {
    maxBytes: 10 * 1024 * 1024, // 10 MB
    resourceTypes: ["image", "video", "raw"] as const, // "video" = Cloudinary resource type for mp3
    formats: [
      "jpg",
      "jpeg",
      "png",
      "mp3",
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
    ],
  },
} as const;

export type UploadContext = keyof typeof UPLOAD_POLICY;

export function validateUpload(
  context: UploadContext,
  params: { resourceType?: string; format?: string; bytes?: number },
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
        policy.maxBytes / 1024 / 1024,
      )}MB untuk ${context}`,
    );
  }
}
