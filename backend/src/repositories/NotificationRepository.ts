import prisma from "../config/prisma";
import { NotificationCategory } from "@prisma/client";

export class NotificationRepository {
  static async getNotificationByUserId(userId: string) {
    return await prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async subscribe(userId: string, subscription: any) {
    return prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: { isActive: true, userId },
      create: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userId,
      },
    });
  }

  static async getAllSubscriptions() {
    return await prisma.pushSubscription.findMany({
      where: { isActive: true },
    });
  }

  static async getAllSubscriptionsByUserId(userId: string) {
    return await prisma.pushSubscription.findMany({
      where: { userId, isActive: true },
    });
  }

  static async createNotificationToCitizen(
    title: string,
    body: string,
    clickUrl: string,
    userId: string,
    category: NotificationCategory
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user && user.role === "CITIZEN") {
      return await prisma.notification.create({
        data: { title, body, clickUrl, userId, category },
      });
    }
    return null;
  }

  static async getSubscriptionsByUserIds(userIds: string[]) {
    return prisma.pushSubscription.findMany({
      where: { userId: { in: userIds }, isActive: true },
    });
  }

  static async createMany(data: any[]) {
    return prisma.notification.createMany({ data });
  }

  static async deleteSubscriptionByEndpoint(endpoint: string) {
    return prisma.pushSubscription.delete({ where: { endpoint } });
  }

  static async createNotificationToAdmin(
    title: string,
    body: string,
    clickUrl: string,
    userId: string,
    category: NotificationCategory
  ) {
    return prisma.notification.create({
      data: { title, body, clickUrl, userId, category },
    });
  }

  static async getAdminSubscription() {
    const admin = await prisma.user.findMany({
      where: { role: "RT_ADMIN" },
      select: { id: true },
    });
    const adminIds = admin.map((a) => a.id);
    return await prisma.pushSubscription.findMany({
      where: { userId: { in: adminIds }, isActive: true },
    });
  }

  static async getNotifications(userId: string) {
    const [
      recentNotifications,
      allNotifications,
      unreadNotifications,
      readNotifications,
      totalCount,
      unreadCount,
      readCount,
    ] = await prisma.$transaction([
      prisma.notification.findMany({
        where: { userId, isRead: false },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.findMany({
        where: { userId },
        orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
      }),
      prisma.notification.findMany({
        where: { userId, isRead: false },
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.findMany({
        where: { userId, isRead: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.notification.count({ where: { userId, isRead: true } }),
    ]);

    return {
      notification: {
        recent: recentNotifications,
        all: allNotifications,
        unread: unreadNotifications,
        read: readNotifications,
      },
      count: {
        total: totalCount,
        unread: unreadCount,
        read: readCount,
      },
    };
  }

  static async readNotification(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  static async readAllNotification(userId: string) {
    return prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true },
    });
  }
}
