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

    socket.on("send_message", async (data: any) => {
      if (!data) return;

      const messagePayload = data.optimisticMessage;

      const userId = socket.user.userId;

      const savedMessage = await ChatRepository.saveMessage(
        messagePayload.message,
        userId,
        messagePayload.chatId,
      );

      console.log({ messagePayload });

      io.to(savedMessage.chatId).emit(
        "receive_message",
        savedMessage.id,
        messagePayload
      );
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};
