import axios from "axios";
import { request } from "./api";

// ---- Sign (server) ----
export type SignUploadParams = {
  folder: "announcements" | "reports" | "profile";
  resourceType?: "image" | "video" | "raw" | "auto";
};

export type SignUploadResponse = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
  resourceType?: "image" | "video" | "raw" | "auto";
};

export async function signUpload(params: SignUploadParams) {
  const res = await request("/uploads/sign", {
    method: "POST",
    data: params,
  });
  return res.data as SignUploadResponse;
}

// ---- Direct upload to Cloudinary (client → Cloudinary) ----
export async function uploadToCloudinary(file: File, sign: SignUploadResponse) {
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sign.apiKey);
  form.append("timestamp", String(sign.timestamp));
  form.append("signature", sign.signature);
  form.append("folder", sign.folder);

  const resource = sign.resourceType || "auto";
  const url = `https://api.cloudinary.com/v1_1/${sign.cloudName}/${resource}/upload`;

  const { data } = await axios.post(url, form);
  return data as {
    public_id: string;
    secure_url: string;
    resource_type: string; // "image" | "video" | "raw"
    format?: string;
    bytes?: number;
    width?: number;
    height?: number;
    original_filename?: string;
  };
}

// ---- Optional: save attachment record to your BE ----
export type SaveAttachmentPayload = {
  filename: string;
  url: string;
  fileType: "image" | "video" | "document";
  provider?: "cloudinary";
  publicId?: string;
  resourceType?: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  linkTo?: { type: "announcement" | "report" | "profile"; id?: string };
};

export async function saveAttachment(payload: SaveAttachmentPayload) {
  const res = await request("/uploads/attachments", {
    method: "POST",
    data: payload,
  });
  return res.data; // e.g. Attachment
}

export async function deleteAttachment(id: string) {
  const res = await request(`/uploads/attachments/${id}`, {
    method: "DELETE",
  });
  return res.data;
}
