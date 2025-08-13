import express from "express";
import cors from "cors";
import reportRouter from "./routes/ReportRoute";
import authRouter from "./routes/AuthRoute";
import cookieParser from "cookie-parser";
import passport from "./config/GoogleStrategy";
const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/reports", reportRouter);
app.use("/api/auth", authRouter);

export default app;
