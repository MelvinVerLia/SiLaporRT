export const ChatSocket = (socket: any) => {
  socket.on("join_room", (chatId: any) => {
    console.log(`socket ${socket.id} joined chat ${chatId}`);
    socket.join(chatId);
  });

  socket.on("send_message", (data: any) => {
    const { chatId, content, userId } = data;
    if (!chatId || !content) return;

    const message = {
      chatId,
      content,
      userId,
      createdAt: new Date(),
    };

    console.log(message);

    io.to(chatId).emit("receive_message", message);
  });
};
