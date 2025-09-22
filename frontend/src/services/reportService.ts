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

  // Helper function to classify file type (same as in CreateReportPage)
  function classifyFile(f: {
    format?: string;
    resource_type?: string;
  }): "image" | "video" | "document" {
    const fmt = (f.format || "").toLowerCase();
    const docFormats = [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "txt",
    ];

    if (docFormats.includes(fmt)) return "document";
    if (f.resource_type === "raw") return "document";
    if (f.resource_type === "image") return "image";
    if (f.resource_type === "video") return "video";
    return "document"; // fallback teraman
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
      // Convert CloudinaryFile to attachment format with proper classification
      attachments: formData.attachments.map((file) => {
        const extendedFile = file as CloudinaryFile & { fileType?: string };
        return {
          filename: file.original_filename || "file",
          url: file.secure_url,
          fileType: extendedFile.fileType || classifyFile(file), // Use classified type
          provider: "cloudinary",
          publicId: file.public_id,
          resourceType: file.resource_type,
          format: file.format,
          bytes: file.bytes,
          width: file.width,
          height: file.height,
        };
      }),
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

export async function addComment(reportId: string, content: string) {
  const res = await request(`/reports/${reportId}/comment`, {
    method: "POST",
    data: { content },
  });
  return res.data;
}

export async function getUserUpvoteStatus(reportId: string) {
  const res = await request(`/reports/${reportId}/upvote-status`, {
    method: "GET",
  });
  return res.data;
}

// export async function getRecentReports(search: string, category: string, status:string) {
//   const res = await request("/reports/get-recent", { method: "GET" });
//   return res.data;
// }
