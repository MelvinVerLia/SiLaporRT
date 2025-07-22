import { Request, Response } from "express";
import ReportService from "../services/ReportService";

class ReportController {
  static async createReport(req: Request, res: Response) {
    const data = req.body;
    const result = await ReportService.createReport(data);
    res.status(201).json(result);
  }

  static async getAllReports(req: Request, res: Response) {
    const reports = await ReportService.getAllReports();
    res.json(reports);
  }

  static async getReportById(req: Request, res: Response) {
    const { id } = req.params;
    const report = await ReportService.getReportById(id);
    res.json(report);
  }

  static async addComment(req: Request, res: Response) {
    const { id } = req.params;
    const { userId, content } = req.body;
    const comment = await ReportService.addComment(id, userId, content);
    res.json(comment);
  }

  static async toggleUpvote(req: Request, res: Response) {
    const { id } = req.params;
    const { userId } = req.body;
    const upvote = await ReportService.toggleUpvote(id, userId);
    res.json(upvote);
  }

  static async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await ReportService.updateStatus(id, status);
    res.json(updated);
  }

  static async addOfficialResponse(req: Request, res: Response) {
    const { id } = req.params;
    const { userId, message } = req.body;
    const response = await ReportService.addOfficialResponse(
      id,
      userId,
      message
    );
    res.json(response);
  }
}

export default ReportController;
