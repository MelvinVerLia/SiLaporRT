import prisma from "../config/prisma";

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
    userId: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user && user.role === "CITIZEN") {
      return await prisma.notification.create({
        data: { title, body, clickUrl, userId },
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
    userId: string
  ) {
    return prisma.notification.create({
      data: { title, body, clickUrl, userId },
    });
  }

  static async getAdminSubscription() {
    const admin = await prisma.user.findMany({
      where: { role: "RT_ADMIN" },
      select: { id: true },
    });
    const adminIds = admin.map((a) => a.id);
    return prisma.pushSubscription.findMany({
      where: { userId: { in: adminIds }, isActive: true },
    });
  }
}
