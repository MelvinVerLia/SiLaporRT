import { Router } from "express";
import { authenticateJWT } from "../middleware/AuthMiddleware";
import { UploadController } from "../controllers/UploadController";

const router = Router();

// semua butuh login (cookie)
router.post("/sign", authenticateJWT, UploadController.sign);
router.post("/attachments", authenticateJWT, UploadController.saveAttachment);
router.delete(
  "/attachments/:id",
  authenticateJWT,
  UploadController.removeAttachment
);

export default router;
