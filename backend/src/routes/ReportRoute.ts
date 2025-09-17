import { Router } from "express";
import ReportController from "../controllers/ReportController";
import { authenticateJWT } from "../middleware/AuthMiddleware";
// import { validateCreateReport } from '../validators/report.validator';
// import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// === CORE REPORT ROUTES ===
router.get("/", ReportController.getAllReports);
router.get("/get-recent", ReportController.getRecentReports);
router.get("/:reportId", ReportController.getReportById);
// router.get("/:userId", ReportController.getReportById);

router.post("/add", authenticateJWT, ReportController.createReport);

// === COMMUNITY INTERACTION ROUTES ===
router.post("/:reportId/comment", authenticateJWT, ReportController.addComment);
router.put("/:reportId/upvote", authenticateJWT, ReportController.toggleUpvote);
router.get(
  "/:reportId/upvote-status",
  authenticateJWT,
  ReportController.getUserUpvoteStatus
);

// === ADMIN/RT ROUTES ===
router.put("/:reportId/status", ReportController.updateStatus);
router.post("/:reportId/response", ReportController.addOfficialResponse);

// === FILTERING ROUTES ===
router.get("/category/:category", ReportController.getReportsByCategory);
router.get("/status/:status", ReportController.getReportsByStatus);

export default router;
