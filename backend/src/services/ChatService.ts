import {
  getChatIdFromReportId as getChatIdFromReportIdRepo,
  getMessagesFromChatId,
  hasUnread as hasUnreadRepo,
  startChat as startChatRepo,
} from "../repositories/ChatRepository";
export async function getMessages(reportId: string) {
  const chatId = await getChatIdFromReportId(reportId);
  if (!chatId) return [];

  const messages = await getMessagesFromChatId(chatId.id);
  return messages;
}

export async function startChat(reportId: string) {
  return startChatRepo(reportId);
}

export async function getChatIdFromReportId(reportId: string) {
  return getChatIdFromReportIdRepo(reportId);
}

export async function hasUnread(userId: string, rtId?: string) {
  return hasUnreadRepo(userId, rtId);
}
