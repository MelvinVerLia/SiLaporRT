import { Request, Response } from "express";
import ReportService from "../services/ReportService";
import { Role } from "@prisma/client";

// interface AuthenticatedRequest extends Request {
//   user?: {
//     id: string;
//     role: string;
//     name: string;
//   };
// }

class ReportController {
  static async createReport(req: Request, res: Response) {
    try {
      const user = req.user as { id: string };
      const data = req.body;

      console.log("Creating report - User ID:", user?.id); // Debug log
      console.log(
        "Creating report - Request body:",
        JSON.stringify(data, null, 2)
      ); // Debug log

      if (!data.title || !data.description || !data.category) {
        throw new Error("Title, description, and category are required");
      }

      if (!data.location.latitude || !data.location.longitude) {
        throw new Error("Location coordinates are required");
      }

      // Add user ID to the data
      const dataWithUser = { ...data, userId: user.id };

      console.log(
        "Final data with user ID:",
        JSON.stringify(dataWithUser, null, 2)
      ); // Debug log

      const result = await ReportService.createReport(dataWithUser);
      res.status(201).json({
        success: true,
        message: "Report created successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Error in createReport controller:", error); // Debug log
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getAllReports(req: Request, res: Response) {
    try {
      const reports = await ReportService.getAllReports(req.query);
      res.json({
        success: true,
        message: `Retrieved ${reports.total} reports`,
        data: reports,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch reports",
      });
    }
  }

  static async getReportById(req: Request, res: Response) {
    try {
      const { reportId } = req.params;

      if (!reportId) {
        throw new Error("Report ID is required");
      }
      const report = await ReportService.getReportById(reportId);
      res.json({
        success: true,
        message: "Report retrieved successfully",
        data: report,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch report",
      });
    }
  }

  static async addComment(req: Request, res: Response) {
    try {
      const { reportId } = req.params;
      const { content } = req.body;
      const user = req.user as { id: string };

      console.log(reportId, user.id, content);
      if (!reportId || !user.id || !content?.trim()) {
        throw new Error("Report ID, user ID, and content are required");
      }

      const comment = await ReportService.addComment(
        reportId,
        user.id,
        content
      );
      res.json({
        success: true,
        message: "Comment added successfully",
        data: comment,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to add comment",
      });
    }
  }

  static async toggleUpvote(req: Request, res: Response) {
    try {
      const { reportId } = req.params;
      const user = req.user as { id: string };
      console.log("User:", user);

      if (!reportId || !user.id) {
        throw new Error("Report ID and user ID are required");
      }

      const result = await ReportService.toggleUpvote(reportId, user.id);
      res.json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to toggle upvote",
      });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { reportId } = req.params;
      const { status, userId } = req.body;

      if (!reportId || !status) {
        throw new Error("Report ID and status are required");
      }

      // if(req.user?.role !== Role.ADMIN && req.user?.id !== adminId) {
      //   throw new Error("You don't have permission to update this report");
      // }

      const result = await ReportService.updateStatus(reportId, status);

      res.json({
        success: true,
        message: `Report status updated to ${status} for user ${userId}`,
        data: result,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || "Failed to update status",
      });
    }
  }

  static async addOfficialResponse(req: Request, res: Response) {
    try {
      const { reportId } = req.params;
      const { adminId, message, attachments } = req.body;

      if (!reportId || !adminId || !message?.trim()) {
        throw new Error("Report ID, user ID, and message are required");
      }

      const response = await ReportService.addOfficialResponse(
        reportId,
        adminId,
        message,
        attachments
      );
      res.json({
        success: true,
        data: response,
        message: "Official response added successfully",
      });
    } catch (error) {
      const statusCode =
        error instanceof Error && error.message.includes("permission")
          ? 403
          : 400;
      res.status(statusCode).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to add official response",
      });
    }
  }

  static async getReportsByCategory(req: Request, res: Response) {
    const { category } = req.params;

    if (!category)
      return res
        .status(400)
        .json({ success: false, message: "Category is required" });

    try {
      const reports = await ReportService.getReportsByCategory(category);
      res.json({
        success: true,
        data: reports,
        message: `Retrieved ${reports.count} reports for category ${category}`,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch reports by category",
      });
    }
  }

  static async getReportsByStatus(req: Request, res: Response) {
    const { status } = req.params;

    if (!status)
      return res
        .status(400)
        .json({ success: false, message: "Status is required" });

    try {
      const reports = await ReportService.getReportsByStatus(status);
      res.json({
        success: true,
        data: reports,
        message: `Retrieved ${reports.count} reports with status ${status}`,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch reports by status",
      });
    }
  }

  static async getUserUpvoteStatus(req: Request, res: Response) {
    const { reportId } = req.params;
    const user = req.user as { id: string };

    if (!reportId || !user.id)
      return res
        .status(400)
        .json({
          success: false,
          message: "Report ID and user authentication required",
        });

    try {
      const result = await ReportService.getUserUpvoteStatus(reportId, user.id);
      res.json({
        success: true,
        data: { result },
        message: "Upvote status retrieved successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to get upvote status",
      });
    }
  }

  static async getRecentReports(req: Request, res: Response) {
    try {
      const reports = await ReportService.getRecentReports();
      res.json({
        success: true,
        data: reports,
        message: "Recent reports retrieved successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to get recent reports",
      });
    }
  }
}

export default ReportController;
