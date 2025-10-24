import { NotificationRepository } from "../repositories/NotificationRepository";
import webpush from "../utils/webpush";
import { AuthRepository } from "../repositories/AuthRepository";
import { error } from "console";
import { NotificationCategory } from "@prisma/client";

export class NotificationService {
  static async sendNotificationByUserId(
    userId: string,
    title: string,
    body: string,
    clickUrl: string,
    icon: string,
    category: NotificationCategory
  ) {
    const subs = await NotificationRepository.getAllSubscriptionsByUserId(
      userId
    );

    if (!subs.length) throw error({ message: "No subscriptions" });

    const payload = JSON.stringify({
      title,
      body,
      clickUrl,
      icon,
      badge: icon,
      image: icon,
    });

    for (const s of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          } as any,
          payload
        );
      } catch (err: any) {
        console.error("Push failed:", err.message);
      }
    }

    console.log("Notification sent successfully");
    await NotificationRepository.createNotificationToCitizen(
      title,
      body,
      clickUrl,
      userId,
      category
    );

    return { success: true };
  }

  static async sendNotificationAll(
    title: string,
    body: string,
    clickUrl: string,
    imageUrl: string,
    category: NotificationCategory
  ) {
    const citizens = await AuthRepository.getAllUsersByRole("CITIZEN");

    const citizenUserIds = citizens.map((u) => u.id);

    const subs = await NotificationRepository.getSubscriptionsByUserIds(
      citizenUserIds
    );

    const payload = {
      title,
      body,
      clickUrl,
      icon: imageUrl,
      badge: imageUrl,
      image: imageUrl,
    };

    const notificationData = citizens.map((u) => ({
      title,
      body,
      clickUrl,
      userId: u.id,
      category,
    }));

    await NotificationRepository.createMany(notificationData);

    for (const s of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          } as any,
          JSON.stringify(payload)
        );
      } catch (err: any) {
        console.error("Push failed:", err.statusCode, err.body);

        if (err.statusCode === 410 || err.statusCode === 404) {
          await NotificationRepository.deleteSubscriptionByEndpoint(s.endpoint);
          console.log("Deleted expired subscription:", s.endpoint);
        }
      }
    }

    return { success: true };
  }

  static async sendNotificationToAdmin(
    title: string,
    body: string,
    clickUrl: string,
    imageUrl: string,
    category: NotificationCategory
  ) {
    const payload = {
      title,
      body,
      clickUrl,
      icon: imageUrl,
      badge: imageUrl,
      image: imageUrl,
    };
    const subs = await NotificationRepository.getAdminSubscription();
    for (const s of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          } as any,
          JSON.stringify(payload)
        );
      } catch (err: any) {
        console.error("Push failed:", err.statusCode, err.body);

        if (err.statusCode === 410 || err.statusCode === 404) {
          await NotificationRepository.deleteSubscriptionByEndpoint(s.endpoint);
          console.log("Deleted expired subscription:", s.endpoint);
        }
      }
    }
    await NotificationRepository.createNotificationToAdmin(
      title,
      body,
      clickUrl,
      subs[0].userId!,
      category
    );
  }

  static async getNotifications(userId: string) {
    const response = await NotificationRepository.getNotifications(userId);
    return response;
  }

  static readAllNotification(userId: string) {
    return NotificationRepository.readAllNotification(userId);
  }

  static readNotification(id: string) {
    return NotificationRepository.readNotification(id);
  }
}
