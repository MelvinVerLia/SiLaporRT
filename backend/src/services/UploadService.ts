import cloudinary from "../config/cloudinary";

const ALLOWED_FOLDERS = new Set(["announcements", "reports", "profile"]);
const ALLOWED_RESOURCE_TYPES = new Set(["image", "video", "raw", "auto"]);

const ttl = Number(process.env.CLOUDINARY_SIGN_TTL || 600);

export class UploadService {
  static signUpload(params: {
    folder: "announcements" | "reports" | "profile";
    resourceType?: "image" | "video" | "raw" | "auto";
  }) {
    if (!ALLOWED_FOLDERS.has(params.folder)) {
      throw new Error("Invalid folder");
    }
    const resourceType =
      params.resourceType && ALLOWED_RESOURCE_TYPES.has(params.resourceType)
        ? params.resourceType
        : "auto";

    const timestamp = Math.floor(Date.now() / 1000);
    const fullFolder = `${
      process.env.CLOUDINARY_FOLDER_BASE || "silaporrt/dev"
    }/${params.folder}`;

    // Params to sign
    const toSign: Record<string, any> = {
      folder: fullFolder,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      toSign,
      process.env.CLOUDINARY_API_SECRET!,
    );

    return {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
      apiKey: process.env.CLOUDINARY_API_KEY!,
      timestamp,
      signature,
      folder: fullFolder,
      resourceType,
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      expiresIn: ttl,
    };
  }

  // Map Cloudinary resource_type to app fileType: image | video | audio | document
  static normalizeFileType(resourceType?: string, format?: string) {
    if (resourceType === "image") return "image";
    // Cloudinary uses "video" for both video and audio
    if (resourceType === "video") {
      const audioFormats = ["mp3"];
      if (format && audioFormats.includes(format.toLowerCase())) return "audio";
      return "video";
    }
    // pdf/word/excel ke "document"
    if (resourceType === "raw") return "document";
    return "document";
  }
}
