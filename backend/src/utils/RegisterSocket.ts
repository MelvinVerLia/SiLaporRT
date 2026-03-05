import { socketAuth } from "../middleware/SocketMiddleware";
import { ChatRepository } from "../repositories/ChatRepository";
import prisma from "../config/prisma";

export const RegisterSocket = (io: any) => {
  io.use(socketAuth);
  io.on("connection", (socket: any) => {
    console.log("a user connected");

    const userId = socket.user?.userId;
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`user ${userId} joined personal room`);
    }

    socket.on("join_room", (chatId: any) => {
      console.log(`socket ${socket.id} joined chat ${chatId}`);
      socket.join(chatId);
    });

    socket.on("typing", (data: any) => {
      const { chatId, userId } = data;
      socket.to(chatId).emit("user_typing", { userId });
    });

    socket.on("stop_typing", (data: any) => {
      const { chatId, userId } = data;
      socket.to(chatId).emit("user_stopped_typing", { userId });
    });

    socket.on("send_message", async (data: any) => {
      if (!data) return;

      const messagePayload = data.optimisticMessage;

      const userId = socket.user.userId;

      const savedMessage = await ChatRepository.saveMessage(
        messagePayload.message,
        userId,
        messagePayload.chatId,
        messagePayload.attachments,
      );

      const message = {
        ...messagePayload,
        id: savedMessage.id,
        attachments: savedMessage.attachments,
      };

      io.to(savedMessage.chatId).emit(
        "receive_message",
        messagePayload.id,
        message,
      );

      // Send real-time notification to relevant users (report owner + RT admins)
      try {
        const chat = await prisma.chat.findUnique({
          where: { id: messagePayload.chatId },
          include: {
            report: {
              select: {
                id: true,
                userId: true,
                user: { select: { rtId: true } },
              },
            },
          },
        });

        if (chat?.report) {
          const reportId = chat.report.id;
          const reportOwnerId = chat.report.userId;
          const rtId = chat.report.user?.rtId;

          const notification = {
            reportId,
            chatId: messagePayload.chatId,
            lastMessageAt: savedMessage.createdAt,
            senderId: userId,
            senderName: savedMessage.user?.name,
          };

          // Notify the sender too (for list sorting update)
          io.to(`user:${userId}`).emit(
            "new_message_notification",
            { ...notification, isSender: true },
          );

          // Notify the report owner (citizen)
          if (reportOwnerId && reportOwnerId !== userId) {
            io.to(`user:${reportOwnerId}`).emit(
              "new_message_notification",
              { ...notification, isSender: false },
            );
          }

          // Notify all RT admins of the same RT
          if (rtId) {
            const rtAdmins = await prisma.user.findMany({
              where: {
                rtId,
                role: "RT_ADMIN",
                isDeleted: false,
                isActive: true,
              },
              select: { id: true },
            });

            for (const admin of rtAdmins) {
              if (admin.id !== userId) {
                io.to(`user:${admin.id}`).emit(
                  "new_message_notification",
                  { ...notification, isSender: false },
                );
              }
            }
          }
        }
      } catch (err) {
        console.error("Error sending message notification:", err);
      }
    });

    socket.on("message_read", async (data: any) => {
      const { messageId, chatId } = data;

      // Update database
      await ChatRepository.markMessageAsRead(messageId);

      // Broadcast to all users in the chat that message was read
      socket.to(chatId).emit("message_read", { messageId });

      // Check if the reader still has unread messages, then notify them
      const readerId = socket.user?.userId;
      if (readerId) {
        try {
          // Get reader's rtId to check across all their relevant chats
          const reader = await prisma.user.findUnique({
            where: { id: readerId },
            select: { rtId: true },
          });
          const stillHasUnread = await ChatRepository.hasUnread(
            readerId,
            reader?.rtId ?? undefined,
          );
          io.to(`user:${readerId}`).emit("chat_unread_update", {
            hasUnread: stillHasUnread,
          });
        } catch (err) {
          console.error("Error checking unread status:", err);
        }
      }
    });

    socket.on("leave_room", (chatId: any) => {
      console.log(`socket ${socket.id} left chat ${chatId}`);
      socket.leave(chatId);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};
