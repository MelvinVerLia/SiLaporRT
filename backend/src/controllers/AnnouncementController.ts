import { Request, Response } from "express";
import { AnnouncementService } from "../services/AnnouncementService";

export class AnnouncementController {
  // === PUBLIC ===
  static async list(req: Request, res: Response) {
    try {
      const data = await AnnouncementService.list(req.query as any);
      return res.status(200).json({ success: true, message: "OK", data });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch announcements",
      });
    }
  }

  static async detail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await AnnouncementService.getById(id);
      if (!item)
        return res
          .status(404)
          .json({ success: false, message: "Announcement not found" });
      return res.status(200).json({ success: true, message: "OK", data: item });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch announcement",
      });
    }
  }

  // === ADMIN ===
  static async adminList(req: Request, res: Response) {
    try {
      const data = await AnnouncementService.listAdmin(req.query as any);
      return res.status(200).json({ success: true, message: "OK", data });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch (admin) announcements",
      });
    }
  }

  static async adminDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await AnnouncementService.getByIdAdmin(id);
      if (!item)
        return res
          .status(404)
          .json({ success: false, message: "Announcement not found" });
      return res.status(200).json({ success: true, message: "OK", data: item });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch (admin) announcement",
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const user = req.user as { id: string };
      const created = await AnnouncementService.create(user.id, req.body);
      return res
        .status(201)
        .json({ success: true, message: "Created", data: created });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create announcement",
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await AnnouncementService.update(id, req.body);
      return res
        .status(200)
        .json({ success: true, message: "Updated", data: updated });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update announcement",
      });
    }
  }

  static async softDelete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await AnnouncementService.softDelete(id);
      return res.status(200).json({ success: true, message: "Deactivated" });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete announcement",
      });
    }
  }

  static async pin(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await AnnouncementService.setPinned(id, true);
      return res.status(200).json({ success: true, message: "Pinned" });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to pin",
      });
    }
  }

  static async unpin(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await AnnouncementService.setPinned(id, false);
      return res.status(200).json({ success: true, message: "Unpinned" });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to unpin",
      });
    }
  }
}
