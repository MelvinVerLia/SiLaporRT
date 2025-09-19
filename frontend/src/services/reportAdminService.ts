import { request } from "./api";
import { Report } from "../types/report.types";

// Admin-specific report list with additional filters and admin-only data
export async function adminListReports(params: {
  page?: number;
  pageSize?: number;
  q?: string;
  category?: string;
  status?: string;
  sortBy?: "created" | "upvotes" | "priority";
  sortOrder?: "asc" | "desc";
}) {
  const res = await request("/reports", {
    method: "GET",
    params: {
      ...params,
      // Admin can see all reports including non-public ones
      includePrivate: true,
    },
  });
  return res.data;
}

// Update report status with optional message/reason
export async function updateReportStatus(
  reportId: string,
  status: string,
  message?: string
) {
  const res = await request(`/reports/${reportId}/status`, {
    method: "PUT",
    data: {
      status,
      message,
    },
  });
  return res.data;
}

// Add official response from admin
export async function addOfficialResponse(
  reportId: string,
  message: string,
  attachments?: string[]
) {
  const res = await request(`/reports/${reportId}/response`, {
    method: "POST",
    data: {
      message,
      attachments,
    },
  });
  return res.data;
}

// Get reports by status (admin view)
export async function getReportsByStatus(status: string) {
  const res = await request(`/reports/status/${status}`, {
    method: "GET",
  });
  return res.data;
}

// Get reports by category (admin view)
export async function getReportsByCategory(category: string) {
  const res = await request(`/reports/category/${category}`, {
    method: "GET",
  });
  return res.data;
}

// Get report statistics for admin dashboard
export async function getReportStatistics() {
  // This might need a new backend endpoint
  const res = await request("/reports/stats", {
    method: "GET",
  });
  return res.data;
}

export type { Report };
