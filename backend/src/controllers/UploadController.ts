import { Request, Response } from "express";
import { UploadService } from "../services/UploadService";
import { Role } from "@prisma/client";
import {
  UPLOAD_POLICY,
  validateUpload,
  type UploadContext,
} from "../config/uploadPolicy";

export class UploadController {
  static async sign(req: Request, res: Response) {
    try {
      const { folder, resourceType } = req.body;
      // Guard: semua user login boleh sign; kalau folder "announcements" minta RT_ADMIN
      const me: any = req.user;
      if (folder === "announcements" && me?.role !== Role.RT_ADMIN) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      // Validate folder is a known upload context
      if (!(folder in UPLOAD_POLICY)) {
        return res.status(400).json({
          success: false,
          message: `Unknown upload folder: '${folder}'`,
        });
      }

      // Validate resourceType against upload policy
      const ctx = folder as UploadContext;
      const policy = UPLOAD_POLICY[ctx];
      const rtype = (resourceType || "").toLowerCase();
      if (
        rtype &&
        rtype !== "auto" &&
        !policy.resourceTypes.includes(rtype as any)
      ) {
        return res.status(400).json({
          success: false,
          message: `Resource type '${rtype}' tidak diizinkan untuk ${ctx}. Allowed: ${policy.resourceTypes.join(", ")}`,
        });
      }

      const data = UploadService.signUpload({ folder, resourceType });
      return res.status(200).json({ success: true, data });
    } catch (e: unknown) {
      const err = e as { message?: string };
      return res.status(400).json({
        success: false,
        message: err?.message || "Failed to sign upload",
      });
    }
  }
}
