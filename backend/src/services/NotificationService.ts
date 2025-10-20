import { error } from "console";
import { NotificationRepository } from "../repositories/NotificationRepository";
import webpush from "../utils/webpush";
import { AuthRepository } from "../repositories/AuthRepository";

export class NotificationService {
  static async sendNotificationByUserId(
    userId: string,
    title: string,
    body: string,
    clickUrl: string,
    icon: string
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

    await NotificationRepository.createNotificationToCitizen(
      title,
      body,
      clickUrl,
      userId
    );

    return { success: true };
  }

  static async sendNotificationAll(
    title: string,
    body: string,
    clickUrl: string,
    imageUrl: string
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
    imageUrl: string
  ) {
    const payload = {
      title,
      body,
      clickUrl,
      icon: imageUrl,
      badge: imageUrl,
      image: imageUrl,
    };
    console.log("payload", payload)
    const subs = await NotificationRepository.getAdminSubscription();
    console.log("subs", subs)   
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
      subs[0].userId!
    )

  }
}
