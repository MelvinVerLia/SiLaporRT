import {
  getAllSubscriptionsByUserId,
  getSubscriptionsByUserIds,
  createNotificationsToCitizens,
  getAdminSubscription,
  toggleSubscribe as toggleSub,
  createMany,
  subscriptionStatus as subStatus,
  getNotifications as getNotif,
  deleteSubscriptionByEndpoint,
  createNotificationToAdmin,
} from "../repositories/NotificationRepository";
import webpush from "../utils/webpush";
import { getAllUsersByRole } from "../repositories/AuthRepository";
import { NotificationCategory } from "@prisma/client";

export async function sendNotificationByUserId(
  userIds: string[],
  title: string,
  body: string,
  clickUrl: string,
  icon: string,
  category: NotificationCategory,
) {
  const subs = await getAllSubscriptionsByUserId(userIds);
  const payload = JSON.stringify({
    title,
    body,
    clickUrl,
    icon,
    badge: icon,
    image: icon,
  });

  if (subs.length) {
    for (const s of subs) {
      try {
        await Promise.allSettled(
          subs.map((s) =>
            webpush.sendNotification(
              {
                endpoint: s.endpoint,
                keys: {
                  p256dh: s.p256dh,
                  auth: s.auth,
                },
              } as any,
              payload,
            ),
          ),
        );
      } catch (err: any) {
        console.error("Push failed:", err.message);
      }
    }

    console.log("Notification sent successfully");
  }

  await createNotificationsToCitizens(
    userIds.map((u) => ({
      title,
      body,
      clickUrl,
      userId: u,
      category,
    })),
  );

  return { success: true };
}

export async function sendNotificationAll(
  title: string,
  body: string,
  clickUrl: string,
  imageUrl: string,
  category: NotificationCategory,
) {
  const citizens = await getAllUsersByRole("CITIZEN");

  const citizenUserIds = citizens.map((u) => u.id);

  const subs = await getSubscriptionsByUserIds(citizenUserIds);

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

  await createMany(notificationData);

  for (const s of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: s.endpoint,
          keys: { p256dh: s.p256dh, auth: s.auth },
        } as any,
        JSON.stringify(payload),
      );
    } catch (err: any) {
      console.error("Push failed:", err.statusCode, err.body);

      if (err.statusCode === 410 || err.statusCode === 404) {
        await deleteSubscriptionByEndpoint(s.endpoint);
        console.log("Deleted expired subscription:", s.endpoint);
      }
    }
  }

  return { success: true };
}

export async function sendNotificationToAdmin(
  title: string,
  body: string,
  clickUrl: string,
  imageUrl: string,
  category: NotificationCategory,
) {
  const payload = {
    title,
    body,
    clickUrl,
    icon: imageUrl,
    badge: imageUrl,
    image: imageUrl,
  };
  const subs = await getAdminSubscription();
  for (const s of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: s.endpoint,
          keys: { p256dh: s.p256dh, auth: s.auth },
        } as any,
        JSON.stringify(payload),
      );
    } catch (err: any) {
      console.error("Push failed:", err.statusCode, err.body);

      if (err.statusCode === 410 || err.statusCode === 404) {
        await deleteSubscriptionByEndpoint(s.endpoint);
        console.log("Deleted expired subscription:", s.endpoint);
      }
    }
  }
  await createNotificationToAdmin(
    title,
    body,
    clickUrl,
    subs[0].userId!,
    category,
  );
}

export async function getNotifications(userId: string) {
  const response = await getNotif(userId);
  return response;
}

export async function readAllNotification(userId: string) {
  return readAllNotification(userId);
}

export async function readNotification(id: string) {
  return readNotification(id);
}

export async function deleteAllReadNotification(userId: string) {
  return deleteAllReadNotification(userId);
}

export async function toggleSubscribe(userId: string, status: boolean) {
  const response = await toggleSub(userId, status);
  return response;
}

export async function subscriptionStatus(userId: string) {
  const response = await subStatus(userId);
  return response;
}
