import { Request, Response } from "express";
import {
  getMessages as getMesssagesRepo,
  startChat as startChatRepo,
  getChatIdFromReportId as getChatIdFromReportIdRepo,
  hasUnread as hasUnreadRepo,
} from "../services/ChatService";

export async function getMessages(req: Request, res: Response) {
  const { reportId } = req.params;
  try {
    const result = await getMesssagesRepo(reportId);
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

export async function startChat(req: Request, res: Response) {
  const { reportId } = req.params;
  try {
    const result = await startChatRepo(reportId);
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

export async function getChatId(req: Request, res: Response) {
  const { reportId } = req.params;
  try {
    const result = await getChatIdFromReportIdRepo(reportId);
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

export async function hasUnread(req: Request, res: Response) {
  const user = req.user as { id: string; rtId?: string };

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User not found",
    });
  }
  try {
    const result = await hasUnreadRepo(user.id, user.rtId);
    console.log({ result });
    if (result === false) {
      return res.status(201).json({
        success: true,
        message: "No unread messages",
        data: result,
      });
    }
    res.status(201).json({
      success: true,
      message: "There is an unread message",
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
