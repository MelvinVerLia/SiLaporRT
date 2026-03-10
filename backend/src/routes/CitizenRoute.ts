import { Router } from "express";
import CitizenController from "../controllers/CitizenController";
import { authenticateJWT } from "../middleware/AuthMiddleware";
import { requireRole } from "../middleware/RoleMiddleware";

const router = Router();

router.get(
  "/",
  authenticateJWT,
  requireRole("RT_ADMIN"),
  CitizenController.getAllCitizens,
);

router.put(
  "/:citizenId/verify",
  authenticateJWT,
  requireRole("RT_ADMIN"),
  CitizenController.verifyCitizen,
);

router.put(
  "/:citizenId/reject",
  authenticateJWT,
  requireRole("RT_ADMIN"),
  CitizenController.rejectCitizen,
);

export default router;
