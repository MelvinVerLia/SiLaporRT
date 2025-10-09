import express from "express";
import cors from "cors";
import reportRouter from "./routes/ReportRoute";
import authRouter from "./routes/AuthRoute";
import announcementRouter from "./routes/AnnouncementRoute";
import uploadRouter from "./routes/UploadRoute";
import cookieParser from "cookie-parser";
import passport from "./config/GoogleStrategy";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    // origin: process.env.FRONTEND_URL_PROD,
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

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app;
