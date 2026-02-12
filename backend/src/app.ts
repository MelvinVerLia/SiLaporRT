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

dotenv.config();

const app = express();

const origins = process.env.FRONTEND_URL_PROD || process.env.FRONTEND_URL;
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

export default app;
