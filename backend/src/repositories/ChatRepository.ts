import prisma from "../config/prisma";

export class ChatRepository {
  static async saveMessage(message: string, userId: string, chatId: string) {
    return prisma.message.create({ data: { message, chatId, userId } });
  }

  static async getChatIdFromReportId(reportId: string) {
    return prisma.chat.findFirst({
      where: { reportId },
      select: { id: true },
    });
  }

  static async getMessagesFromChatId(chatId: string) {
    return prisma.message.findMany({
      where: { chatId },
      include: { user: { select: { name: true, role: true, profile: true } } },
    });
  }

  static async startChat(reportId: string) {
    return prisma.chat.create({ data: { reportId } });
  }
}
