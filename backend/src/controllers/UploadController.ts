import { Request, Response } from "express";
import { UploadService } from "../services/UploadService";
import { Role } from "@prisma/client";

export class UploadController {
  // FE minta tanda tangan upload
  static async sign(req: Request, res: Response) {
    try {
      const { folder, resourceType } = req.body;
      // Guard: semua user login boleh sign; kalau folder "announcements" minta RT_ADMIN
      const me: any = req.user;
      if (folder === "announcements" && me?.role !== Role.RT_ADMIN) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
      const data = UploadService.signUpload({ folder, resourceType });
      return res.status(200).json({ success: true, data });
    } catch (e: any) {
      return res.status(400).json({
        success: false,
        message: e?.message || "Failed to sign upload",
      });
    }
  }
}
