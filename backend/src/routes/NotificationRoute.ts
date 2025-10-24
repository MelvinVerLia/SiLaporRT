import { Router } from "express";
import { NotificationController } from "../controllers/NotificationController";
import { authenticateJWT } from "../middleware/AuthMiddleware";

const router = Router();

router.post("/send", NotificationController.sendNotification);
router.post("/send/all", NotificationController.sendNotificationAll);

router.post("/subscribe", authenticateJWT, NotificationController.subscribe);

router.get(
  "/notifications",
  authenticateJWT,
  NotificationController.getNotifications
);

router.put("/read-all", authenticateJWT, NotificationController.readAllNotifications);
router.put("/read/:id", authenticateJWT, NotificationController.readNotification);

export default router;
