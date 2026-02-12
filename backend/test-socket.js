import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

socket.on("connect", () => {
  console.log("CONNECTED:", socket.id);

  socket.emit("join_room", "hey-mon"); // emit (function name, the room id)

  socket.emit("send_message", {
    chatId: "hey-mon",
    userId: "user-1",
    content: "hello mom",
  });
});

socket.on("receive_message", (msg) => {
  console.log("RECEIVED:", msg);
});
