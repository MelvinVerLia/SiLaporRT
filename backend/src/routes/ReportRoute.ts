import { Router } from "express";
import ReportController from "../controllers/ReportController";
// import { validateCreateReport } from '../validators/report.validator';
// import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get("/", ReportController.getAllReports);
router.get("/:id", ReportController.getReportById);
router.post("/:id/comment", ReportController.addComment);
router.put("/:id/upvote", ReportController.toggleUpvote);
router.put("/:id/status", ReportController.updateStatus);
router.post("/:id/response", ReportController.addOfficialResponse);
router.post("/add", ReportController.createReport);

export default router;
