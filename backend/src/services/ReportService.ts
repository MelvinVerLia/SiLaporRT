import ReportRepository from "../repositories/ReportRepository";
import { ReportStatus, ReportCategory, Role } from "@prisma/client";
import { CreateReportData } from "../types/reportTypes";

interface UserContext {
  id: string;
  role: Role;
}

class ReportService {
  static async createReport(data: CreateReportData) {
    try {
      const report = await ReportRepository.createReport(data);
      return report;
    } catch (error) {
      throw new Error(`Failed to create report: ${error}`);
    }
  }

  static async getAllReports() {
    try {
      const reports = await ReportRepository.getAllReports();
      return reports;
    } catch (error) {
      throw new Error(`Failed to fetch reports: ${error}`);
    }
  }

  static async getReportById(id: string) {
    try {
      const report = await ReportRepository.getReportById(id);

      return report;
    } catch (error) {
      throw new Error(`Failed to fetch report: ${error}`);
    }
  }

  static async addComment(reportId: string, userId: string, content: string) {
    try {
      const comment = await ReportRepository.addComment(
        reportId,
        userId,
        content.trim()
      );
      return comment;
    } catch (error) {
      throw new Error(`Failed to add comment: ${error}`);
    }
  }

  static async toggleUpvote(reportId: string, userId: string) {
    try {
      const result = await ReportRepository.toggleUpvote(reportId, userId);
      return result;
    } catch (error) {
      throw new Error(`Failed to toggle upvote: ${error}`);
    }
  }

  static async updateStatus(
    reportId: string,
    status: string,
  ) {
    try {
      const updatedReport = await ReportRepository.updateStatus(
        reportId,
        status as ReportStatus
      );
      return updatedReport;
    } catch (error) {
      throw new Error(`Failed to update status: ${error}`);
    }
  }

  static async addOfficialResponse(
    reportId: string,
    userId: string,
    message: string,
    attachments?: string[]
  ) {
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

  static async getReportsByCategory(category: string) {
    try {
      const reports = await ReportRepository.getReportsByCategory(category);
      return { reports, count: reports.length };
    } catch (error) {
      throw new Error(`Failed to fetch reports by category: ${error}`);
    }
  }

  static async getReportsByStatus(status: string) {
    try {
      const reports = await ReportRepository.getReportsByStatus(
        status as ReportStatus
      );
      return {
        reports,
        count: reports.length,
      };
    } catch (error) {
      throw new Error(`Failed to fetch reports by status: ${error}`);
    }
  }

  static async getUserUpvoteStatus(reportId: string, userId: string) {
    try {
      const hasUpvoted = await ReportRepository.getUserUpvoteStatus(
        reportId,
        userId
      );
      return { hasUpvoted };
    } catch (error) {
      throw new Error(`Failed to get upvote status: ${error}`);
    }
  }
}

export default ReportService;
