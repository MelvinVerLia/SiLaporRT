import { Request, Response } from "express";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { NotificationService } from "../services/NotificationService";

export class NotificationController {
  static async sendNotification(req: Request, res: Response) {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    try {
      await NotificationService.sendNotificationByUserId(
        userId,
        "Pencet kalo berani bub nibba",
        "ya ga berina ya nibba",
        "https://youtu.be/GJDNkVDGM_s?si=oTHrZEP_rnAz41m2",
        "https://res.cloudinary.com/dgnedkivd/image/upload/v1757562088/silaporrt/dev/logo/logo_lnenhb.png",
        "ANNOUNCEMENT"
      );
      return res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to send notification" });
    }
  }

  static async sendNotificationAll(req: Request, res: Response) {
    try {
      await NotificationService.sendNotificationAll(
        "hey",
        "hey",
        "hey",
        "https://res.cloudinary.com/dgnedkivd/image/upload/v1757562088/silaporrt/dev/logo/logo_lnenhb.png",
        "ANNOUNCEMENT"
      );
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
      await NotificationRepository.subscribe(userId, subscription);
      console.log("Subscribed successfully");
    } catch (error) {
      console.log("error", error);
    }

    res.json({ message: "Subscribed successfully" });
  }

  static async getNotifications(req: Request, res: Response) {
    const user = req.user as { id: string };
    if (!user) return res.status(400).json({ error: "User not found" });

    const userId = user.id;
    try {
      const response = await NotificationService.getNotifications(userId);

      return res.json(response);
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ error: "Failed to get notifications" });
    }
  }

  static async readAllNotifications(req: Request, res: Response) {
    const user = req.user as { id: string };
    if (!user) return res.status(400).json({ error: "User not found" });

    const userId = user.id;
    try {
      await NotificationService.readAllNotification(userId);
      return res.json("success");
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ error: "Failed to get notifications" });
    }
  }

  static async readNotification(req: Request, res: Response) {
    const id = req.params.id;
    try {
      await NotificationService.readNotification(id);
      return res.json("success");
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ error: "Failed to get notifications" });
    }
  }

  static async toggleSubscribe(req: Request, res: Response) {
    const user = req.user as { id: string };
    const status = req.body.enabled;
    if (!user) return res.status(400).json({ error: "User not found" });

    const userId = user.id;
    try {
      await NotificationService.toggleSubscribe(userId, status);
      return res.json("success");
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ error: "Failed to get notifications" });
    }
  }

  static async subscriptionStatus(req: Request, res: Response) {
    const user = req.user as { id: string };
    if (!user) return res.status(400).json({ error: "User not found" });

    const userId = user.id;
    try {
      const response = await NotificationService.subscriptionStatus(userId);
      return res.json(response);
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ error: "Failed to get notifications" });
    }
  }
}
