import { Router } from "express";
import { ChatController } from "../controllers/ChatController";
import { authenticateJWT } from "../middleware/AuthMiddleware";
import { requireVerified } from "../middleware/VerificationMiddleware";

const router = Router();

router.get("/get/messages/:reportId", authenticateJWT, requireVerified(), ChatController.getMessages);
router.post("/start/chat/:reportId", authenticateJWT, requireVerified(), ChatController.startChat);
router.get("/get/chatId/:reportId", authenticateJWT, requireVerified(), ChatController.getChatId);
router.get("/get/unread", authenticateJWT, requireVerified(), ChatController.hasUnread);

export default router;