import { Request, Response } from "express";
import { UploadService } from "../services/UploadService";
import { Role } from "@prisma/client";
// import cloudinary from "../config/cloudinary";
// import { AttachmentRepository } from "../repositories/AttachmentRepository";
// import { validateUpload } from "../config/uploadPolicy";

export class UploadController {
  // FE minta tanda tangan upload
  static async sign(req: Request, res: Response) {
    console.log('chupapimunayyao');
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

  // FE kirim metadata setelah sukses upload ke Cloudinary → kita simpan ke DB & link
  // static async saveAttachment(req: Request, res: Response) {
  //   console.log("meow");
  //   try {
  //     const me: any = req.user;
  //     const {
  //       filename,
  //       url, // secure_url
  //       publicId, // public_id
  //       resourceType, // image | video | raw
  //       format,
  //       bytes,
  //       width,
  //       height,
  //       linkTo, // { type: "announcement"|"report"|"profile", id? }
  //     } = req.body;

  //     if (!url || !publicId || !filename) {
  //       return res
  //         .status(400)
  //         .json({ success: false, message: "Data upload tidak lengkap" });
  //     }

  //     // Normalisasi & guard role
  //     const rawType = (linkTo?.type || "").toString().toLowerCase(); // e.g. "announcements"/"announcement"
  //     const linkType =
  //       rawType === "announcements"
  //         ? "announcement"
  //         : rawType === "reports"
  //         ? "report"
  //         : rawType === "profile"
  //         ? "profile"
  //         : rawType;

  //     if (
  //       !linkType ||
  //       !["announcement", "report", "profile"].includes(linkType)
  //     ) {
  //       return res
  //         .status(400)
  //         .json({ success: false, message: "linkTo.type invalid" });
  //     }

  //     if (linkType === "announcement" && me?.role !== Role.RT_ADMIN) {
  //       return res.status(403).json({ success: false, message: "Forbidden" });
  //     }

  //     // VALIDASI POLICY by context
  //     validateUpload(linkType as any, { resourceType, format, bytes });

  //     const fileType = UploadService.normalizeFileType(resourceType, format);

  //     const saved = await AttachmentRepository.create({
  //       filename,
  //       url,
  //       fileType,
  //       provider: "cloudinary",
  //       publicId,
  //       resourceType,
  //       format,
  //       bytes,
  //       width,
  //       height,
  //       linkTo: { type: linkType, id: linkTo?.id },
  //       userId: linkType === "profile" ? me?.id : undefined,
  //     });

  //     return res
  //       .status(201)
  //       .json({ success: true, message: "Attachment saved", data: saved });
  //   } catch (e: any) {
  //     return res.status(400).json({
  //       success: false,
  //       message: e?.message || "Failed to save attachment",
  //     });
  //   }
  // }

  // // Hapus dari DB (+ Cloudinary destroy)
  // static async removeAttachment(req: Request, res: Response) {
  //   try {
  //     const me: any = req.user;
  //     const { id } = req.params;

  //     const att = await AttachmentRepository.findById(id);
  //     if (!att)
  //       return res
  //         .status(404)
  //         .json({ success: false, message: "Attachment not found" });

  //     // Policy sederhana:
  //     // - RT_ADMIN boleh hapus apa pun
  //     // - User biasa boleh hapus miliknya sendiri (profile) → perlu cek ownership (lewat user.profile atau kepemilikan report)
  //     if (me?.role !== Role.RT_ADMIN) {
  //       return res.status(403).json({ success: false, message: "Forbidden" });
  //     }

  //     // Hapus Cloudinary bila ada publicId
  //     if (att.publicId) {
  //       const resourceType = att.resourceType || "image";
  //       await cloudinary.uploader.destroy(att.publicId, {
  //         resource_type: resourceType as any,
  //       });
  //     }

  //     await AttachmentRepository.deleteById(id);
  //     return res
  //       .status(200)
  //       .json({ success: true, message: "Attachment deleted" });
  //   } catch (e: any) {
  //     return res.status(400).json({
  //       success: false,
  //       message: e?.message || "Failed to delete attachment",
  //     });
  //   }
  // }
}
