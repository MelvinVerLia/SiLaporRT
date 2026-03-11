import { Router } from "express";
import {
  sendNotification,
  sendNotificationAll,
  subscribe,
  getNotifications,
  readAllNotifications,
  readNotification,
  toggleSubscribe,
  subscriptionStatus,
} from "../controllers/NotificationController";
import { authenticateJWT } from "../middleware/AuthMiddleware";

const router = Router();

router.post("/send", sendNotification);
router.post("/send/all", sendNotificationAll);

router.post("/subscribe", authenticateJWT, subscribe);

router.get("/notifications", authenticateJWT, getNotifications);

router.put("/read-all", authenticateJWT, readAllNotifications);
router.put("/read/:id", authenticateJWT, readNotification);
router.put("/toggle/subscribe", authenticateJWT, toggleSubscribe);
router.get("/subscribe/status", authenticateJWT, subscriptionStatus);

export default router;
