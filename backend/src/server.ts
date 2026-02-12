import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";
import { RegisterSocket } from "./utils/RegisterSocket";

dotenv.config();

const PORT = process.env.PORT || 3001;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL_PROD || process.env.FRONTEND_URL,
    credentials: true,
  },
});

RegisterSocket(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
