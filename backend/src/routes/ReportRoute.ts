import { Router } from "express";
import {
  getAllReports,
  getRecentReports,
  getUserReports,
  getUserReportStatistics,
  getAllReportsStatistics,
  getReportById,
  createReport,
  deleteReport,
  toggleReportVisibility,
  addComment,
  toggleUpvote,
  getUserUpvoteStatus,
  updateStatus,
  addOfficialResponse,
  updateReportStatus,
  getReportsByCategory,
  getReportsByStatus,
} from "../controllers/ReportController";
import { authenticateJWT } from "../middleware/AuthMiddleware";
import { requireVerified } from "../middleware/VerificationMiddleware";

const router = Router();

// === CORE REPORT ROUTES ===
router.get("/", authenticateJWT, getAllReports);
router.get("/get-recent", authenticateJWT, getRecentReports);
router.get("/my-reports", authenticateJWT, getUserReports);
router.get("/my-reports/stats", authenticateJWT, getUserReportStatistics);
router.get("/all-reports/stats", getAllReportsStatistics);
router.get("/:reportId", getReportById);

router.post("/add", authenticateJWT, requireVerified(), createReport);

// === USER REPORT MANAGEMENT ===
router.delete("/:reportId", authenticateJWT, requireVerified(), deleteReport);
router.put(
  "/:reportId/visibility",
  authenticateJWT,
  requireVerified(),
  toggleReportVisibility,
);

// === COMMUNITY INTERACTION ROUTES ===
router.post(
  "/:reportId/comment",
  authenticateJWT,
  requireVerified(),
  addComment,
);
router.put(
  "/:reportId/upvote",
  authenticateJWT,
  requireVerified(),
  toggleUpvote,
);
router.get("/:reportId/upvote-status", authenticateJWT, getUserUpvoteStatus);

// === ADMIN/RT ROUTES ===
router.put("/:reportId/status", authenticateJWT, updateStatus);
router.post("/:reportId/response", authenticateJWT, addOfficialResponse);
router.put("/:reportId/update-status", authenticateJWT, updateReportStatus);

// === FILTERING ROUTES ===
router.get("/category/:category", authenticateJWT, getReportsByCategory);
router.get("/status/:status", authenticateJWT, getReportsByStatus);

export default router;
