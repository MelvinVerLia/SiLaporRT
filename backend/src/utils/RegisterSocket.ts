import { socketAuth } from "../middleware/SocketMiddleware";
import { ChatRepository } from "../repositories/ChatRepository";

export const RegisterSocket = (io: any) => {
  io.use(socketAuth);
  io.on("connection", (socket: any) => {
    console.log("a user connected");

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
      );

      const message = {
        ...messagePayload,
        id: savedMessage.id,
      };

      io.to(savedMessage.chatId).emit(
        "receive_message",
        messagePayload.id,
        message,
      );
    });

    socket.on("message_read", async (data: any) => {
      const { messageId, chatId } = data;

      // Update database
      await ChatRepository.markMessageAsRead(messageId);

      // Broadcast to all users in the chat that message was read
      socket.to(chatId).emit("message_read", { messageId });
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
