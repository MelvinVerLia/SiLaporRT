import express from "express";
import cors from "cors";

import reportRouter from "./routes/ReportRoute";
import authRouter from "./routes/AuthRoute";
import announcementRouter from "./routes/AnnouncementRoute";
import uploadRouter from "./routes/UploadRoute";
import notificationRouter from "./routes/NotificationRoute";
import chatRouter from "./routes/ChatRoute";

import cookieParser from "cookie-parser";
import passport from "./config/GoogleStrategy";
import dotenv from "dotenv";

import { createServer } from "http";
import { Server } from "socket.io";
import { RegisterSocket } from "./utils/RegisterSocket";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const origins = process.env.FRONTEND_URL_PROD || process.env.FRONTEND_URL;
const io = new Server(httpServer, {
  cors: {
    origin: origins,
    credentials: true,
  },
});
app.use(
  cors({
    origin: origins,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/reports", reportRouter);
app.use("/api/auth", authRouter);
app.use("/api/announcements", announcementRouter);
app.use("/api/uploads", uploadRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/chats", chatRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

RegisterSocket(io);

httpServer.listen(process.env.SOCKET_PORT, () => {
  console.log(`Socket Server running on port ${process.env.SOCKET_PORT}`);
});

export default app;
