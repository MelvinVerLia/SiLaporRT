import prisma from "../config/prisma";
import { NotificationCategory } from "@prisma/client";

export async function getNotificationByUserId(userId: string) {
  return await prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function subscribe(userId: string, subscription: any) {
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

export async function getAllSubscriptions() {
  return await prisma.pushSubscription.findMany({
    where: { isActive: true },
  });
}

export async function getAllSubscriptionsByUserId(userId: string[]) {
  return await prisma.pushSubscription.findMany({
    where: { userId: { in: userId }, isActive: true },
  });
}

export async function createNotificationsToCitizens(
  data: {
    title: string;
    body: string;
    clickUrl: string;
    userId: string;
    category: NotificationCategory;
  }[],
) {
  if (!data.length) return;

  return prisma.notification.createMany({
    data,
    skipDuplicates: true,
  });
}

export async function getSubscriptionsByUserIds(userIds: string[]) {
  return prisma.pushSubscription.findMany({
    where: { userId: { in: userIds }, isActive: true },
  });
}

export async function createMany(data: any[]) {
  return prisma.notification.createMany({ data });
}

export async function deleteSubscriptionByEndpoint(endpoint: string) {
  return prisma.pushSubscription.delete({ where: { endpoint } });
}

export async function createNotificationToAdmin(
  title: string,
  body: string,
  clickUrl: string,
  userId: string,
  category: NotificationCategory,
) {
  return prisma.notification.create({
    data: { title, body, clickUrl, userId, category },
  });
}

export async function getAdminSubscription() {
  const admin = await prisma.user.findMany({
    where: { role: "RT_ADMIN" },
    select: { id: true },
  });
  const adminIds = admin.map((a) => a.id);
  return await prisma.pushSubscription.findMany({
    where: { userId: { in: adminIds }, isActive: true },
  });
}

export async function getNotifications(userId: string) {
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

export async function readNotification(id: string) {
  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
}

export async function readAllNotification(userId: string) {
  return prisma.notification.updateMany({
    where: { userId },
    data: { isRead: true },
  });
}

export async function deleteAllReadNotification(userId: string) {
  try {
    return await prisma.notification.deleteMany({
      where: { userId, isRead: true },
    });
  } catch (error) {
    throw error;
  }
}

export async function toggleSubscribe(userId: string, status: boolean) {
  return await prisma.pushSubscription.updateMany({
    where: { userId },
    data: { isActive: status },
  });
}

export async function subscriptionStatus(userId: string) {
  const subscription = await prisma.pushSubscription.findFirst({
    where: { userId },
    select: { isActive: true },
  });

  const data = {
    hasSubscription: !!subscription,
    status: subscription?.isActive ?? false,
  };
  return data;
}
