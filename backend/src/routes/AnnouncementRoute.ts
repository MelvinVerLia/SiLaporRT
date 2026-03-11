import { Router } from "express";
import {
  adminDetail,
  adminList,
  create,
  detail,
  list,
  pin,
  softDelete,
  unpin,
  update,
} from "../controllers/AnnouncementController";
import { authenticateJWT } from "../middleware/AuthMiddleware";
import { requireRole } from "../middleware/RoleMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// PUBLIC (but requires authentication to filter by RT)
router.get("/", authenticateJWT, list);
router.get("/:id", detail);

// ADMIN (RT_ADMIN)
router.get(
  "/admin/list",
  authenticateJWT,
  requireRole(Role.RT_ADMIN),
  adminList,
);

router.get(
  "/admin/:id",
  authenticateJWT,
  requireRole(Role.RT_ADMIN),
  adminDetail,
);

router.post("/", authenticateJWT, requireRole(Role.RT_ADMIN), create);

router.patch("/:id", authenticateJWT, requireRole(Role.RT_ADMIN), update);

router.delete("/:id", authenticateJWT, requireRole(Role.RT_ADMIN), softDelete);

router.post("/:id/pin", authenticateJWT, requireRole(Role.RT_ADMIN), pin);

router.post("/:id/unpin", authenticateJWT, requireRole(Role.RT_ADMIN), unpin);

export default router;
