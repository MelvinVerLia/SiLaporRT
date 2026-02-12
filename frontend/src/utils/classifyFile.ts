import { CloudinaryFile } from "../types/announcement.types";

/**
 * Classify a Cloudinary upload result into app-level file type.
 * Cloudinary treats audio (mp3) as resource_type "video".
 */
export function classifyFile(
  f: Pick<CloudinaryFile, "format" | "resource_type">,
): "image" | "video" | "audio" | "document" {
  const fmt = (f.format || "").toLowerCase();
  const docFormats = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"];
  const audioFormats = ["mp3"];

  if (docFormats.includes(fmt)) return "document";
  if (audioFormats.includes(fmt)) return "audio";
  if (f.resource_type === "raw") return "document";
  if (f.resource_type === "image") return "image";
  if (f.resource_type === "video" && audioFormats.includes(fmt)) return "audio";
  if (f.resource_type === "video") return "video";
  return "document";
}
