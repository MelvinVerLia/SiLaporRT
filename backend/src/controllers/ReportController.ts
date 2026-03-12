import { Request, Response } from "express";
import {
  createReport as createReportService,
  getAllReports as getAllReportsService,
  getReportById as getReportByIdService,
  addComment as addCommentService,
  toggleUpvote as toggleUpvoteService,
  updateStatus as updateStatusService,
  addOfficialResponse as addOfficialResponseService,
  getReportsByCategory as getReportsByCategoryService,
  getReportsByStatus as getReportsByStatusService,
  getUserUpvoteStatus as getUserUpvoteStatusService,
  getRecentReports as getRecentReportsService,
  getMyReports,
  deleteReport as deleteReportService,
  toggleVisibility,
  getUserReportStatistics as getUserReportStatisticsService,
  getAllReportsStatistics as getAllReportsStatisticsService,
  updateReportStatus as updateReportStatusService,
} from "../services/ReportService";

export async function createReport(req: Request, res: Response) {
  try {
    const user = req.user as { id: string; role: string };
    const data = req.body;
    if (!user) {
      throw new Error("User not found");
    }

    if (user.role === "RT_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin tidak dapat membuat laporan",
      });
    }

    if (!data.title || !data.description || !data.location || !data.category) {
      throw new Error(
        "Title, description, location, and category are required",
      );
    }

    const dataWithUser = { ...data, userId: user.id };

    const result = await createReportService(dataWithUser);
    res.status(201).json({
      success: true,
      message: "Report created successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error in createReport controller:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getAllReports(req: Request, res: Response) {
  try {
    const user = req.user as { id: string; rtId?: string };
    const reports = await getAllReportsService(req.query, user?.rtId, user?.id);
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

export async function getReportById(req: Request, res: Response) {
  try {
    const { reportId } = req.params;

    if (!reportId) {
      return res.status(400).json({
        success: false,
        message: "Report ID is required",
      });
    }

    const report = await getReportByIdService(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Report retrieved successfully",
      data: report,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch report",
    });
  }
}

export async function addComment(req: Request, res: Response) {
  try {
    const { reportId } = req.params;
    const { content } = req.body;
    const user = req.user as { id: string };

    console.log(reportId, user.id, content);
    if (!reportId || !user.id || !content?.trim()) {
      throw new Error("Report ID, user ID, and content are required");
    }

    const comment = await addCommentService(reportId, user.id, content);
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

export async function toggleUpvote(req: Request, res: Response) {
  try {
    const { reportId } = req.params;
    const user = req.user as { id: string };
    console.log("User:", user);

    if (!reportId || !user.id) {
      throw new Error("Report ID and user ID are required");
    }

    const result = await toggleUpvoteService(reportId, user.id);
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

export async function updateStatus(req: Request, res: Response) {
  try {
    const { reportId } = req.params;
    const { status, message } = req.body;
    const user = req.user as { id: string };

    if (!reportId || !status) {
      throw new Error("Report ID and status are required");
    }

    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const result = await updateStatusService(
      reportId,
      status,
      user.id,
      message,
    );

    res.json({
      success: true,
      message: `Report status updated to ${status}`,
      data: result,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || "Failed to update status",
    });
  }
}

export async function addOfficialResponse(req: Request, res: Response) {
  try {
    const { reportId } = req.params;
    const { message, attachments } = req.body;
    const user = req.user as { id: string };

    if (!reportId || !user?.id || !message?.trim()) {
      throw new Error("Report ID, user ID, and message are required");
    }

    const response = await addOfficialResponseService(
      reportId,
      user.id,
      message,
      attachments,
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

export async function getReportsByCategory(req: Request, res: Response) {
  const { category } = req.params;
  const user = req.user as { id: string; rtId?: string };
  const rtId = user?.rtId;

  if (!category)
    return res
      .status(400)
      .json({ success: false, message: "Category is required" });

  try {
    const reports = await getReportsByCategoryService(category, rtId);
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

export async function getReportsByStatus(req: Request, res: Response) {
  const { status } = req.params;
  const user = req.user as { id: string; rtId?: string };
  const rtId = user?.rtId;

  if (!status)
    return res
      .status(400)
      .json({ success: false, message: "Status is required" });

  try {
    const reports = await getReportsByStatusService(status, rtId);
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

export async function getUserUpvoteStatus(req: Request, res: Response) {
  const { reportId } = req.params;
  const user = req.user as { id: string };

  if (!reportId || !user.id)
    return res.status(400).json({
      success: false,
      message: "Report ID and user authentication required",
    });

  try {
    const result = await getUserUpvoteStatusService(reportId, user.id);
    res.json({
      success: true,
      data: { result },
      message: "Upvote status retrieved successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to get upvote status",
    });
  }
}

export async function getRecentReports(req: Request, res: Response) {
  try {
    const user = req.user as { id: string; rtId?: string };
    const reports = await getRecentReportsService(user?.rtId);
    res.json({
      success: true,
      data: reports,
      message: "Recent reports retrieved successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to get recent reports",
    });
  }
}

export async function getUserReports(req: Request, res: Response) {
  try {
    const user = req.user as { id: string };
    const params = { ...req.query, userId: user.id };

    const reports = await getMyReports(params);
    res.json({
      success: true,
      message: `Retrieved ${reports.total} user reports`,
      data: reports,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user reports",
    });
  }
}

export async function deleteReport(req: Request, res: Response) {
  try {
    const user = req.user as { id: string };
    const { reportId } = req.params;

    const result = await deleteReportService(reportId, user.id);
    res.json({
      success: true,
      message: "Report deleted successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete report",
    });
  }
}

export async function toggleReportVisibility(req: Request, res: Response) {
  try {
    const user = req.user as { id: string };
    const { reportId } = req.params;

    const result = await toggleVisibility(reportId, user.id);
    res.json({
      success: true,
      message: "Report visibility updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update report visibility",
    });
  }
}

export async function getUserReportStatistics(req: Request, res: Response) {
  try {
    const user = req.user as { id: string };

    const stats = await getUserReportStatisticsService(user.id);
    res.json({
      success: true,
      message: "User report statistics retrieved successfully",
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user report statistics",
    });
  }
}

export async function getAllReportsStatistics(req: Request, res: Response) {
  try {
    const stats = await getAllReportsStatisticsService();
    res.json({
      success: true,
      message: "All reports statistics retrieved successfully",
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch all reports statistics",
    });
  }
}
export async function updateReportStatus(req: Request, res: Response) {
  try {
    const { reportId } = req.params;
    const { attachments, message } = req.body;
    const user = req.user as { id: string };

    if (!reportId || !user.id) {
      throw new Error("Report ID, status, and user ID are required");
    }

    await updateReportStatusService(reportId, user.id, attachments, message);
    res.json({
      success: true,
      message: "Report status updated successfully",
      // data: result,
    });
  } catch (error: any) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update report status",
    });
  }
}
