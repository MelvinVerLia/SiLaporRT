import { Router } from "express";
import { AnnouncementController } from "../controllers/AnnouncementController";
import { authenticateJWT } from "../middleware/AuthMiddleware";
import { requireRole } from "../middleware/RoleMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// PUBLIC
router.get("/", AnnouncementController.list);
router.get("/:id", AnnouncementController.detail);

// ADMIN (RT_ADMIN)
router.get(
  "/admin/list",
  authenticateJWT,
  requireRole(Role.RT_ADMIN),
  AnnouncementController.adminList
);

router.get(
  "/admin/:id",
  authenticateJWT,
  requireRole(Role.RT_ADMIN),
  AnnouncementController.adminDetail
);

router.post(
  "/",
  authenticateJWT,
  requireRole(Role.RT_ADMIN),
  AnnouncementController.create
);

router.patch(
  "/:id",
  authenticateJWT,
  requireRole(Role.RT_ADMIN),
  AnnouncementController.update
);

router.delete(
  "/:id",
  authenticateJWT,
  requireRole(Role.RT_ADMIN),
  AnnouncementController.softDelete
);

router.post(
  "/:id/pin",
  authenticateJWT,
  requireRole(Role.RT_ADMIN),
  AnnouncementController.pin
);

router.post(
  "/:id/unpin",
  authenticateJWT,
  requireRole(Role.RT_ADMIN),
  AnnouncementController.unpin
);

export default router;
