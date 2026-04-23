import prisma from "../config/prisma";

type MessageAttachmentInput = {
  filename: string;
  url: string;
  fileType: string;
  provider?: string;
  publicId?: string;
  resourceType?: string;
  format?: string;
  bytes?: number;
};

export async function saveMessage(
  message: string,
  userId: string,
  chatId: string,
  attachments?: MessageAttachmentInput[],
) {
  return prisma.message.create({
    data: {
      message,
      chatId,
      userId,
      ...(attachments &&
        attachments.length > 0 && {
          attachments: {
            create: attachments.map((attachment) => ({
              filename: attachment.filename,
              url: attachment.url,
              fileType: attachment.fileType,
              provider: attachment.provider,
              publicId: attachment.publicId,
              resourceType: attachment.resourceType,
              format: attachment.format,
              bytes: attachment.bytes,
            })),
          },
        }),
    },
    include: {
      user: { select: { name: true, role: true, profile: true } },
      attachments: true,
    },
  });
}

export async function getChatIdFromReportId(reportId: string) {
  return prisma.chat.findFirst({
    where: { reportId },
    select: { id: true },
  });
}

export async function getMessagesFromChatId(chatId: string) {
  return prisma.message.findMany({
    where: { chatId },
    include: {
      user: { select: { name: true, role: true, profile: true } },
      attachments: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function markMessageAsRead(messageId: string) {
  return prisma.message.update({
    where: { id: messageId },
    data: { isRead: true },
  });
}

export async function startChat(reportId: string) {
  return prisma.chat.create({ data: { reportId } });
}

export async function hasUnread(
  excludeUserId: string,
  rtId?: string,
): Promise<boolean> {
  const unread = await prisma.message.findFirst({
    where: {
      isRead: false,
      userId: { not: excludeUserId },
      chat: {
        report: {
          user: {
            rtId: rtId,
          },
        },
      },
    },
    select: { id: true },
  });

  return !!unread;
}
