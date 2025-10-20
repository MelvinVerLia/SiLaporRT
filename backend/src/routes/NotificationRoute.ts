import { Router } from "express";
import { NotificationController } from "../controllers/NotificationController";

const router = Router();

router.post("/send", NotificationController.sendNotification);
router.post("/send/all", NotificationController.sendNotificationAll)
router.post("/subscribe", NotificationController.subscribe);

export default router;
