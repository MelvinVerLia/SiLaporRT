import { Router } from "express";
import {
  getAllCitizens,
  verifyCitizen,
  rejectCitizen,
} from "../controllers/CitizenController";
import { authenticateJWT } from "../middleware/AuthMiddleware";
import { requireRole } from "../middleware/RoleMiddleware";

const router = Router();

router.get("/", authenticateJWT, requireRole("RT_ADMIN"), getAllCitizens);

router.put(
  "/:citizenId/verify",
  authenticateJWT,
  requireRole("RT_ADMIN"),
  verifyCitizen,
);

router.put(
  "/:citizenId/reject",
  authenticateJWT,
  requireRole("RT_ADMIN"),
  rejectCitizen,
);

export default router;
