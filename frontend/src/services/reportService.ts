import { request } from "./api";
import { CreateReportFormData, Report } from "../types/report.types";
import { CloudinaryFile } from "../types/announcement.types";

export interface CreateReportPayload {
  title: string;
  description: string;
  category: string;
  isAnonymous: boolean;
  isPublic: boolean;
  userId?: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    rt: string;
    rw: string;
    kelurahan?: string;
    kecamatan?: string;
  };
  attachments?: {
    filename: string;
    url: string;
    fileType: string;
    provider?: string;
    publicId?: string;
    resourceType?: string;
    format?: string;
    bytes?: number;
    width?: number;
    height?: number;
  }[];
}

export async function createReport(
  formData: CreateReportFormData
): Promise<Report> {
  if (!formData.location) {
    throw new Error("Lokasi wajib ditentukan");
  }

  try {
    // Prepare the payload
    const payload: CreateReportPayload = {
      title: formData.title,
      description: formData.description,
      category: formData.category as string,
      isAnonymous: formData.isAnonymous,
      isPublic: formData.isPublic,
      location: {
        latitude: formData.location.latitude,
        longitude: formData.location.longitude,
        address: formData.location.address,
        rt: formData.location.rt,
        rw: formData.location.rw,
        kelurahan: formData.location.kelurahan,
        kecamatan: formData.location.kecamatan,
      },
      // Convert CloudinaryFile to attachment format
      attachments: formData.attachments.map((file) => ({
        filename: file.original_filename || "image",
        url: file.secure_url,
        fileType: "image",
        provider: "cloudinary",
        publicId: file.public_id,
        resourceType: file.resource_type,
        format: file.format,
        bytes: file.bytes,
        width: file.width,
        height: file.height,
      })),
    };

    console.log("Payload to send:", payload); // Debug log

    // Send as JSON since files are already uploaded to cloudinary
    console.log("Sending JSON payload with cloudinary attachments"); // Debug log

    const res = await request("/reports/add", {
      method: "POST",
      data: payload,
    });
    return res.data;
  } catch (error) {
    console.error("Error creating report:", error);
    throw error instanceof Error ? error : new Error("Gagal membuat laporan");
  }
}

export async function getReportList(params: {
  page?: number;
  pageSize: number;
  q: string;
  category: string;
  status: string;
}) {
  const res = await request("/reports", { method: "GET", params });
  console.log(res.data);
  return res.data;
}

export async function getReportDetails(id: string) {
  const res = await request(`/reports/${id}`, { method: "GET" });
  return res.data;
}

export async function getRecentReports() {
  const res = await request("/reports/get-recent", { method: "GET" });
  console.log(res.data);
  return res.data;
}

export async function toggleUpvote(id: string) {
  console.log("help");
  const res = await request(`/reports/${id}/upvote`, { method: "PUT" });
  return res.data;
}

// export async function getRecentReports(search: string, category: string, status:string) {
//   const res = await request("/reports/get-recent", { method: "GET" });
//   return res.data;
// }
