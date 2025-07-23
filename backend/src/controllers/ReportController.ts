import { Request, Response } from "express";
import ReportService from "../services/ReportService";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    name: string;
  };
}

class ReportController {
  static async createReport(req: AuthenticatedRequest, res: Response) {
    try {
      const data = req.body;
      const result = await ReportService.createReport(data);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create report",
      });
    }
  }

  static async getAllReports(req: Request, res: Response) {
    try {
      const reports = await ReportService.getAllReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch reports",
      });
    }
  }

  static async getReportById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const report = await ReportService.getReportById(id);
      res.json(report);
    } catch (error) {
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      res.status(statusCode).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch report",
      });
    }
  }

  static async addComment(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { userId, content } = req.body;

      // Use authenticated user ID if available, otherwise use provided userId
      const actualUserId = req.user?.id || userId;

      if (!actualUserId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const comment = await ReportService.addComment(id, actualUserId, content);
      res.json(comment);
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to add comment",
      });
    }
  }

  static async toggleUpvote(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      // Use authenticated user ID if available, otherwise use provided userId
      const actualUserId = req.user?.id || userId;

      if (!actualUserId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const upvote = await ReportService.toggleUpvote(id, actualUserId);
      res.json(upvote);
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to toggle upvote",
      });
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const userContext = req.user
        ? {
            id: req.user.id,
            role: req.user.role as any,
          }
        : undefined;

      const updated = await ReportService.updateStatus(id, status, userContext);
      res.json(updated);
    } catch (error) {
      const statusCode =
        error instanceof Error && error.message.includes("permission")
          ? 403
          : 400;
      res.status(statusCode).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update status",
      });
    }
  }

  static async addOfficialResponse(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { userId, message, attachments } = req.body;

      // Use authenticated user ID if available, otherwise use provided userId
      const actualUserId = req.user?.id || userId;

      if (!actualUserId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const userContext = req.user
        ? {
            id: req.user.id,
            role: req.user.role as any,
          }
        : undefined;

      const response = await ReportService.addOfficialResponse(
        id,
        actualUserId,
        message,
        userContext,
        attachments
      );
      res.json(response);
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

  // Additional controller methods

  static async getReportsByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;
      const reports = await ReportService.getReportsByCategory(category);
      res.json(reports);
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
    try {
      const { status } = req.params;
      const reports = await ReportService.getReportsByStatus(status);
      res.json(reports);
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

  static async getUserUpvoteStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.query;

      // Use authenticated user ID if available, otherwise use query userId
      const actualUserId = req.user?.id || (userId as string);

      if (!actualUserId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const result = await ReportService.getUserUpvoteStatus(id, actualUserId);
      res.json(result);
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
}

export default ReportController;
