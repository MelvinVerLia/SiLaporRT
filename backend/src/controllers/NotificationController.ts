import { Request, Response } from "express";
import { readAllNotification, subscribe as sub } from "../repositories/NotificationRepository";
import {
  sendNotificationByUserId,
  sendNotificationAll as sendNotificationAllRepo,
  getNotifications as getNotif,
  readNotification as readNotif,
  toggleSubscribe as toggleSub,
  subscriptionStatus as subStatus,
} from "../services/NotificationService";

export async function sendNotification(req: Request, res: Response) {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required" });
  try {
    await sendNotificationByUserId(
      userId,
      "Pencet kalo berani bub nibba",
      "ya ga berina ya nibba",
      "https://youtu.be/GJDNkVDGM_s?si=oTHrZEP_rnAz41m2",
      "https://res.cloudinary.com/dgnedkivd/image/upload/v1757562088/silaporrt/dev/logo/logo_lnenhb.png",
      "ANNOUNCEMENT",
    );
    return res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to send notification" });
  }
}

export async function sendNotificationAll(req: Request, res: Response) {
  try {
    await sendNotificationAllRepo(
      "hey",
      "hey",
      "hey",
      "https://res.cloudinary.com/dgnedkivd/image/upload/v1757562088/silaporrt/dev/logo/logo_lnenhb.png",
      "ANNOUNCEMENT",
    );
    return res.json({ ok: true });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
}

export async function subscribe(req: Request, res: Response) {
  const subscription = req.body.subscription;
  const userId = req.body.userId;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: "Invalid subscription data" });
  }

  try {
    await sub(userId, subscription);
    console.log("Subscribed successfully");
  } catch (error) {
    console.log("error", error);
  }

  res.json({ message: "Subscribed successfully" });
}

export async function getNotifications(req: Request, res: Response) {
  const user = req.user as { id: string };
  if (!user) return res.status(400).json({ error: "User not found" });

  const userId = user.id;
  try {
    const response = await getNotif(userId);

    return res.json(response);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Failed to get notifications" });
  }
}

export async function readAllNotifications(req: Request, res: Response) {
  const user = req.user as { id: string };
  if (!user) return res.status(400).json({ error: "User not found" });

  const userId = user.id;
  try {
    await readAllNotification(userId);
    return res.json("success");
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Failed to get notifications" });
  }
}

export async function readNotification(req: Request, res: Response) {
  const id = req.params.id;
  try {
    await readNotif(id);
    return res.json("success");
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Failed to get notifications" });
  }
}

export async function toggleSubscribe(req: Request, res: Response) {
  const user = req.user as { id: string };
  const status = req.body.enabled;
  if (!user) return res.status(400).json({ error: "User not found" });

  const userId = user.id;
  try {
    await toggleSub(userId, status);
    return res.json("success");
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Failed to get notifications" });
  }
}

export async function subscriptionStatus(req: Request, res: Response) {
  const user = req.user as { id: string };
  if (!user) return res.status(400).json({ error: "User not found" });

  const userId = user.id;
  try {
    const response = await subStatus(userId);
    return res.json(response);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Failed to get notifications" });
  }
}
