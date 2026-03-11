import { Request, Response } from "express";
import { signUpload } from "../services/UploadService";
import { Role } from "@prisma/client";
import {
  UPLOAD_POLICY,
  type UploadContext,
} from "../config/uploadPolicy";

export async function sign(req: Request, res: Response) {
  try {
    const { folder, resourceType } = req.body;
    const me: any = req.user;
    if (folder === "announcements" && me?.role !== Role.RT_ADMIN) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    if (!(folder in UPLOAD_POLICY)) {
      return res.status(400).json({
        success: false,
        message: `Unknown upload folder: '${folder}'`,
      });
    }

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

    const data = signUpload({ folder, resourceType });
    return res.status(200).json({ success: true, data });
  } catch (e: unknown) {
    const err = e as { message?: string };
    return res.status(400).json({
      success: false,
      message: err?.message || "Failed to sign upload",
    });
  }
}
