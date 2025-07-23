import { Router } from "express";
import ReportController from "../controllers/ReportController";
// import { validateCreateReport } from '../validators/report.validator';
// import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// === CORE REPORT ROUTES ===
router.get("/", ReportController.getAllReports);
router.get("/:id", ReportController.getReportById);
router.post("/add", ReportController.createReport);

// === COMMUNITY INTERACTION ROUTES ===
router.post("/:id/comment", ReportController.addComment);
router.put("/:id/upvote", ReportController.toggleUpvote);
router.get("/:id/upvote-status", ReportController.getUserUpvoteStatus);

// === ADMIN/RT ROUTES ===
router.put("/:id/status", ReportController.updateStatus);
router.post("/:id/response", ReportController.addOfficialResponse);

// === FILTERING ROUTES ===
router.get("/category/:category", ReportController.getReportsByCategory);
router.get("/status/:status", ReportController.getReportsByStatus);

// === ROUTE STRUCTURE EXPLANATION ===
/*
GET    /reports                     - Get all public reports
GET    /reports/:id                 - Get specific report with full details
POST   /reports/add                 - Create new report
POST   /reports/:id/comment         - Add comment to report
PUT    /reports/:id/upvote          - Toggle upvote for report
GET    /reports/:id/upvote-status   - Check if user has upvoted
PUT    /reports/:id/status          - Update report status (RT_ADMIN only)
POST   /reports/:id/response        - Add official response (RT_ADMIN only)
GET    /reports/category/:category  - Get reports by category
GET    /reports/status/:status      - Get reports by status
*/

export default router;
