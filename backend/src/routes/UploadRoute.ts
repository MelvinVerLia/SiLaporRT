import { Router } from "express";
import { authenticateJWT } from "../middleware/AuthMiddleware";
import { sign } from "../controllers/UploadController";

const router = Router();

router.post("/sign", authenticateJWT, sign);

export default router;
