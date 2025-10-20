import prisma from "../config/prisma";
import { Request, Response } from "express";
import webpush from "../utils/webpush";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { NotificationService } from "../services/NotificationService";

export class NotificationController {
  static async sendNotification(req: Request, res: Response) {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    try {
      await NotificationService.sendNotificationByUserId(userId, "", "", "", "");
      return res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to send notification" });
    }
  }

  static async sendNotificationAll(req: Request, res: Response) {
    try {
      await NotificationService.sendNotificationAll("hey", "hey", "hey", "https://res.cloudinary.com/dgnedkivd/image/upload/v1757562088/silaporrt/dev/logo/logo_lnenhb.png");
      return res.json({ ok: true });
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  }

  static async subscribe(req: Request, res: Response) {
    const subscription = req.body.subscription;
    const userId = req.body.userId;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: "Invalid subscription data" });
    }

    try {
      console.log("userId, subscribtion", userId, subscription);
      await NotificationRepository.subscribe(userId, subscription);
      console.log("Subscribed successfully");
    } catch (error) {
      console.log("error", error);
    }

    res.json({ message: "Subscribed successfully" });
  }
}
