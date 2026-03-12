import {
  createReport as createReportRepo,
  getAllReports as getAllReportsRepo,
  getMyReports as getMyReportsRepo,
  getReportById as getReportByIdRepo,
  addComment as addCommentRepo,
  toggleUpvote as toggleUpvoteRepo,
  updateStatus as updateStatusRepo,
  addOfficialResponse as addOfficialResponseRepo,
  getReportsByCategory as getReportsByCategoryRepo,
  getReportsByStatus as getReportsByStatusRepo,
  getUserUpvoteStatus as getUserUpvoteStatusRepo,
  getRecentReports as getRecentReportsRepo,
  deleteReport as deleteReportRepo,
  toggleVisibility as toggleVisibilityRepo,
  getUserReportStatistics as getUserReportStatisticsRepo,
  getAllReportsStatistics as getAllReportsStatisticsRepo,
  updateReportStatus as updateReportStatusRepo,
} from "../repositories/ReportRepository";
import {
  ReportStatus,
  ReportCategory,
  Role,
  Attachment,
  ResponseStatus,
} from "@prisma/client";
import { CreateReportData } from "../types/reportTypes";
import { sendNotificationByUserId } from "./NotificationService";
import { getRtAdminByUserId } from "../repositories/AuthRepository";
import { validateUpload } from "../config/uploadPolicy";

interface UserContext {
  id: string;
  role: Role;
}

export async function createReport(data: CreateReportData) {
  try {
    // Validate attachments against upload policy
    if (data.attachments && data.attachments.length > 0) {
      for (const att of data.attachments) {
        validateUpload("reports", {
          resourceType: att.resourceType,
          format: att.format,
          bytes: att.bytes,
        });
      }
    }

    if (!data.category) {
      throw new Error("Category is required.");
    }

    const report = await createReportRepo(data);

    const baseUrl = process.env.FRONTEND_URL_PROD ?? process.env.FRONTEND_URL;
    const url = `${baseUrl}/admin/reports/${report.id}`;

    const RT = await getRtAdminByUserId(report.userId!);

    if (!RT) {
      throw new Error("RT Admin not found for this user");
    }

    const rtAdminIds = RT.map((admin) => admin.id);

    await sendNotificationByUserId(
      rtAdminIds,
      `Laporan "${report.title}" Telah Dibuat!`,
      `laporan baru telah diajukan. Silakan diproses lebih lanjut.`,
      url,
      "https://res.cloudinary.com/dgnedkivd/image/upload/v1757562088/silaporrt/dev/logo/logo_lnenhb.png",
      "REPORT",
    );
    return report;
  } catch (error) {
    throw new Error(`Failed to create report: ${error}`);
  }
}

export async function getAllReports(
  params: {
    page?: any;
    pageSize?: any;
    q?: string;
    category?: string;
    priority?: string;
    status?: string;
    includePrivate?: string | boolean;
    isPublic?: string | boolean;
    dateFrom?: string;
    dateTo?: string;
    userId?: string;
    sortBy?: string;
    upvoteDateFrom?: string;
    upvoteDateTo?: string;
  },
  rtId?: string,
  requestingUserId?: string,
) {
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(params.pageSize ?? "10", 10) || 10),
  );
  try {
    const { total, items } = await getAllReportsRepo({
      page,
      pageSize,
      q: params.q,
      category: params.category,
      priority: params.priority,
      status: params.status,
      userId: params.userId,
      includePrivate:
        params.includePrivate === true || params.includePrivate === "true",
      isPublic: params.isPublic,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      sortBy: params.sortBy,
      upvoteDateFrom: params.upvoteDateFrom,
      upvoteDateTo: params.upvoteDateTo,
      rtId,
      requestingUserId,
    });
    return { page, pageSize, total, items };
  } catch (error) {
    throw new Error(`Failed to fetch reports: ${error}`);
  }
}

export async function getMyReports(
  params: {
    page?: any;
    pageSize?: any;
    q?: string;
    category?: string;
    priority?: string;
    status?: string;
    includePrivate?: string | boolean;
    isPublic?: string | boolean;
    dateFrom?: string;
    dateTo?: string;
    userId?: string;
    sortBy?: string;
    upvoteDateFrom?: string;
    upvoteDateTo?: string;
  },
  rtId?: string,
) {
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(params.pageSize ?? "10", 10) || 10),
  );
  try {
    const { total, items } = await getMyReportsRepo({
      page,
      pageSize,
      q: params.q,
      category: params.category,
      priority: params.priority,
      status: params.status,
      userId: params.userId,
      includePrivate:
        params.includePrivate === true || params.includePrivate === "true",
      isPublic: params.isPublic,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      sortBy: params.sortBy,
      upvoteDateFrom: params.upvoteDateFrom,
      upvoteDateTo: params.upvoteDateTo,
      rtId,
    });
    return { page, pageSize, total, items };
  } catch (error) {
    throw new Error(`Failed to fetch reports: ${error}`);
  }
}

export async function getReportById(id: string) {
  try {
    const report = await getReportByIdRepo(id);

    return report;
  } catch (error) {
    throw new Error(`Failed to fetch report: ${error}`);
  }
}

export async function addComment(
  reportId: string,
  userId: string,
  content: string,
) {
  try {
    const comment = await addCommentRepo(reportId, userId, content.trim());
    return comment;
  } catch (error) {
    throw new Error(`Failed to add comment: ${error}`);
  }
}

export async function toggleUpvote(reportId: string, userId: string) {
  try {
    const result = await toggleUpvoteRepo(reportId, userId);
    return result;
  } catch (error) {
    throw new Error(`Failed to toggle upvote: ${error}`);
  }
}

export async function updateStatus(
  reportId: string,
  status: ReportStatus,
  userId?: string,
  message?: string,
) {
  try {
    const updatedReport = await updateStatusRepo(reportId, status);

    if (message && userId) {
      await addOfficialResponseRepo(
        reportId,
        userId,
        message.trim(),
        undefined,
        status as ResponseStatus,
      );
    }

    const baseUrl = process.env.FRONTEND_URL_PROD || process.env.FRONTEND_URL;
    const url = `${baseUrl}/reports/${updatedReport.id}`;

    const statusLabels: Record<string, string> = {
      PENDING: "Menunggu",
      IN_PROGRESS: "Diproses",
      RESOLVED: "Selesai",
      REJECTED: "Ditolak",
      CLOSED: "Ditutup",
    };
    const statusLabel =
      statusLabels[updatedReport.status] || updatedReport.status;

    await sendNotificationByUserId(
      [updatedReport.userId!],
      `Laporan "${updatedReport.title}" Telah Diperbarui!`,
      message || `Status laporan kamu kini berubah menjadi ${statusLabel}`,
      url,
      "https://res.cloudinary.com/dgnedkivd/image/upload/v1757562088/silaporrt/dev/logo/logo_lnenhb.png",
      "REPORT",
    );
    return updatedReport;
  } catch (error) {
    throw new Error(`Failed to update status: ${error}`);
  }
}

export async function addOfficialResponse(
  reportId: string,
  userId: string,
  message: string,
  attachments?: string[],
) {
  try {
    const response = await addOfficialResponseRepo(
      reportId,
      userId,
      message.trim(),
      attachments,
    );

    const baseUrl = process.env.FRONTEND_URL_PROD || process.env.FRONTEND_URL;

    const url = `${baseUrl}/reports/${reportId}`;

    await sendNotificationByUserId(
      [response?.report.userId!],
      `Laporan "${response?.report.title}" Telah Diperbarui!`,
      `Laporan anda telah diresponse oleh ${response?.responder.name}, silahkan cek laporan anda`,
      url,
      "https://res.cloudinary.com/dgnedkivd/image/upload/v1757562088/silaporrt/dev/logo/logo_lnenhb.png",
      "REPORT",
    );

    return {
      success: true,
      data: response,
      message: "Official response added successfully",
    };
  } catch (error) {
    throw new Error(`Failed to add official response: ${error}`);
  }
}

export async function getReportsByCategory(category: string, rtId?: string) {
  try {
    const reports = await getReportsByCategoryRepo(category, rtId);
    return { reports, count: reports.length };
  } catch (error) {
    throw new Error(`Failed to fetch reports by category: ${error}`);
  }
}

export async function getReportsByStatus(status: string, rtId?: string) {
  try {
    const reports = await getReportsByStatusRepo(status as ReportStatus, rtId);
    return {
      reports,
      count: reports.length,
    };
  } catch (error) {
    throw new Error(`Failed to fetch reports by status: ${error}`);
  }
}

export async function getUserUpvoteStatus(reportId: string, userId: string) {
  try {
    const hasUpvoted = await getUserUpvoteStatusRepo(reportId, userId);
    return { hasUpvoted };
  } catch (error) {
    throw new Error(`Failed to get upvote status: ${error}`);
  }
}

export async function getRecentReports(rtId?: string) {
  const { items } = await getRecentReportsRepo(rtId);
  return { items };
}

export async function deleteReport(reportId: string, userId: string) {
  try {
    const result = await deleteReportRepo(reportId, userId);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete report: ${error}`);
  }
}

export async function toggleVisibility(reportId: string, userId: string) {
  try {
    const result = await toggleVisibilityRepo(reportId, userId);
    return result;
  } catch (error) {
    throw new Error(`Failed to toggle visibility: ${error}`);
  }
}

export async function getUserReportStatistics(userId: string) {
  try {
    const stats = await getUserReportStatisticsRepo(userId);
    return stats;
  } catch (error) {
    throw new Error(`Failed to fetch user report statistics: ${error}`);
  }
}

export async function getAllReportsStatistics() {
  try {
    const stats = await getAllReportsStatisticsRepo();
    return stats;
  } catch (error) {
    throw new Error(`Failed to fetch all reports statistics: ${error}`);
  }
}

export async function updateReportStatus(
  reportId: string,
  responderId: string,
  attachments?: Attachment[],
  message?: string,
) {
  try {
    const updatedReport = await updateReportStatusRepo(
      reportId,
      responderId,
      attachments,
      message,
    );

    const baseUrl = process.env.FRONTEND_URL_PROD ?? process.env.FRONTEND_URL;
    const url = `${baseUrl}/reports/${updatedReport.id}`;

    if (updatedReport) {
      sendNotificationByUserId(
        [updatedReport.userId!],
        `Laporan "${updatedReport.title}" Telah Diperbarui!`,
        `Status laporan kamu kini berubah menjadi ${updatedReport.status}`,
        url,
        "https://res.cloudinary.com/dgnedkivd/image/upload/v1757562088/silaporrt/dev/logo/logo_lnenhb.png",
        "REPORT",
      );
    }
    return updatedReport;
  } catch (error) {
    throw new Error(`Failed to update report status: ${error}`);
  }
}
