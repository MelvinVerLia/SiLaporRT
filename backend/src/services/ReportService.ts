import ReportRepository from "../repositories/ReportRepository";
import { ReportStatus, ReportCategory, Role } from "@prisma/client";
import { CreateReportData } from "../types/reportTypes";

interface UserContext {
  id: string;
  role: Role;
}

class ReportService {
  static async createReport(data: CreateReportData) {
    // Validate required fields
    if (!data.title || !data.description || !data.category) {
      throw new Error("Title, description, and category are required");
    }

    if (!data.location || !data.location.latitude || !data.location.longitude) {
      throw new Error("Location coordinates are required");
    }

    // Prepare data for creation
    const reportData = {
      title: data.title,
      description: data.description,
      category: data.category,
      isAnonymous: data.isAnonymous || false,
      isPublic: data.isPublic !== undefined ? data.isPublic : true,
      userId: data.isAnonymous ? null : data.userId,
      location: {
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        address: data.location.address,
        rt: data.location.rt,
        rw: data.location.rw,
        kelurahan: data.location.kelurahan,
        kecamatan: data.location.kecamatan,
      },
    };

    try {
      const newReport = await ReportRepository.createReport(reportData);
      return {
        success: true,
        data: newReport,
        message: "Report created successfully",
      };
    } catch (error) {
      throw new Error(`Failed to create report: ${error}`);
    }
  }

  static async getAllReports() {
    try {
      const reports = await ReportRepository.getAllReports();
      return {
        success: true,
        data: reports,
        message: `Retrieved ${reports.length} reports`,
      };
    } catch (error) {
      throw new Error(`Failed to fetch reports: ${error}`);
    }
  }

  static async getReportById(id: string) {
    if (!id) {
      throw new Error("Report ID is required");
    }

    try {
      const report = await ReportRepository.getReportById(id);
      if (!report) {
        throw new Error("Report not found");
      }

      return {
        success: true,
        data: report,
        message: "Report retrieved successfully",
      };
    } catch (error) {
      throw new Error(`Failed to fetch report: ${error}`);
    }
  }

  static async addComment(reportId: string, userId: string, content: string) {
    if (!reportId || !userId || !content?.trim()) {
      throw new Error("Report ID, user ID, and content are required");
    }

    try {
      const comment = await ReportRepository.addComment(
        reportId,
        userId,
        content.trim()
      );
      return {
        success: true,
        data: comment,
        message: "Comment added successfully",
      };
    } catch (error) {
      throw new Error(`Failed to add comment: ${error}`);
    }
  }

  static async toggleUpvote(reportId: string, userId: string) {
    if (!reportId || !userId) {
      throw new Error("Report ID and user ID are required");
    }

    try {
      const result = await ReportRepository.toggleUpvote(reportId, userId);
      return {
        success: true,
        data: result,
        message: result.message,
      };
    } catch (error) {
      throw new Error(`Failed to toggle upvote: ${error}`);
    }
  }

  static async updateStatus(
    reportId: string,
    status: string,
    userContext?: UserContext
  ) {
    if (!reportId || !status) {
      throw new Error("Report ID and status are required");
    }

    // Validate status
    const validStatuses = Object.values(ReportStatus);
    if (!validStatuses.includes(status as ReportStatus)) {
      throw new Error(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    // Check if user has permission (only RT_ADMIN can update status)
    if (userContext && userContext.role !== Role.RT_ADMIN) {
      throw new Error("Only RT Admin can update report status");
    }

    try {
      const updatedReport = await ReportRepository.updateStatus(
        reportId,
        status as ReportStatus
      );
      return {
        success: true,
        data: updatedReport,
        message: `Report status updated to ${status}`,
      };
    } catch (error) {
      throw new Error(`Failed to update status: ${error}`);
    }
  }

  static async addOfficialResponse(
    reportId: string,
    userId: string,
    message: string,
    userContext?: UserContext,
    attachments?: string[]
  ) {
    if (!reportId || !userId || !message?.trim()) {
      throw new Error("Report ID, user ID, and message are required");
    }

    // Check if user has permission (only RT_ADMIN can add official responses)
    if (userContext && userContext.role !== Role.RT_ADMIN) {
      throw new Error("Only RT Admin can add official responses");
    }

    try {
      const response = await ReportRepository.addOfficialResponse(
        reportId,
        userId,
        message.trim(),
        attachments
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

  // Additional service methods

  static async getReportsByCategory(category: string) {
    const validCategories = Object.values(ReportCategory);
    if (!validCategories.includes(category as ReportCategory)) {
      throw new Error(
        `Invalid category. Must be one of: ${validCategories.join(", ")}`
      );
    }

    try {
      const reports = await ReportRepository.getReportsByCategory(category);
      return {
        success: true,
        data: reports,
        message: `Retrieved ${reports.length} reports for category ${category}`,
      };
    } catch (error) {
      throw new Error(`Failed to fetch reports by category: ${error}`);
    }
  }

  static async getReportsByStatus(status: string) {
    const validStatuses = Object.values(ReportStatus);
    if (!validStatuses.includes(status as ReportStatus)) {
      throw new Error(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    try {
      const reports = await ReportRepository.getReportsByStatus(
        status as ReportStatus
      );
      return {
        success: true,
        data: reports,
        message: `Retrieved ${reports.length} reports with status ${status}`,
      };
    } catch (error) {
      throw new Error(`Failed to fetch reports by status: ${error}`);
    }
  }

  static async getUserUpvoteStatus(reportId: string, userId: string) {
    if (!reportId || !userId) {
      throw new Error("Report ID and user ID are required");
    }

    try {
      const hasUpvoted = await ReportRepository.getUserUpvoteStatus(
        reportId,
        userId
      );
      return {
        success: true,
        data: { hasUpvoted },
        message: "Upvote status retrieved successfully",
      };
    } catch (error) {
      throw new Error(`Failed to get upvote status: ${error}`);
    }
  }
}

export default ReportService;
