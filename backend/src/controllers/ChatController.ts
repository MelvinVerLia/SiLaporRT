import { Request, Response } from "express";
import { ChatService } from "../services/ChatService";

export class ChatController {
  static async getMessages(req: Request, res: Response) {
    const { reportId } = req.params;
    try {
      const result = await ChatService.getMesssages(reportId);
      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No messages found",
        });
      }

      res.status(201).json({
        success: true,
        message: "Message Fetched Successfully",
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

  static async startChat(req: Request, res: Response) {
    const { reportId } = req.params;
    try {
      const result = await ChatService.startChat(reportId);
      res.status(201).json({
        success: true,
        message: "Chat started successfully",
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

  static async getChatId(req: Request, res: Response) {
    const { reportId } = req.params;
    try {
      const result = await ChatService.getChatIdFromReportId(reportId);
      res.status(201).json({
        success: true,
        message: "Chat Fetched Successfully",
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
}
