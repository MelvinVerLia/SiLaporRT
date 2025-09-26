import { Router } from "express";
import ReportController from "../controllers/ReportController";
import { authenticateJWT } from "../middleware/AuthMiddleware";
// import { validateCreateReport } from '../validators/report.validator';
// import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// === CORE REPORT ROUTES ===
router.get("/", ReportController.getAllReports);
router.get("/get-recent", ReportController.getRecentReports);
router.get("/my-reports", authenticateJWT, ReportController.getUserReports);
router.get("/:reportId", ReportController.getReportById);
// router.get("/:userId", ReportController.getReportById);

router.post("/add", authenticateJWT, ReportController.createReport);

// === USER REPORT MANAGEMENT ===
router.delete("/:reportId", authenticateJWT, ReportController.deleteReport);
router.put(
  "/:reportId/visibility",
  authenticateJWT,
  ReportController.toggleReportVisibility
);

// === COMMUNITY INTERACTION ROUTES ===
router.post("/:reportId/comment", authenticateJWT, ReportController.addComment);
router.put("/:reportId/upvote", authenticateJWT, ReportController.toggleUpvote);
router.get(
  "/:reportId/upvote-status",
  authenticateJWT,
  ReportController.getUserUpvoteStatus
);

// === ADMIN/RT ROUTES ===
router.put("/:reportId/status", authenticateJWT, ReportController.updateStatus);
router.post(
  "/:reportId/response",
  authenticateJWT,
  ReportController.addOfficialResponse
);

// === FILTERING ROUTES ===
router.get("/category/:category", ReportController.getReportsByCategory);
router.get("/status/:status", ReportController.getReportsByStatus);

export default router;
