import { Router } from "express";
import {
  getMessages,
  startChat,
  getChatId,
  hasUnread,
} from "../controllers/ChatController";
import { authenticateJWT } from "../middleware/AuthMiddleware";
import { requireVerified } from "../middleware/VerificationMiddleware";

const router = Router();

router.get(
  "/get/messages/:reportId",
  authenticateJWT,
  requireVerified(),
  getMessages,
);
router.post(
  "/start/chat/:reportId",
  authenticateJWT,
  requireVerified(),
  startChat,
);
router.get(
  "/get/chatId/:reportId",
  authenticateJWT,
  requireVerified(),
  getChatId,
);
router.get("/get/unread", authenticateJWT, requireVerified(), hasUnread);

export default router;
