import { Request, Response } from "express";
import {
  getById,
  getByIdAdmin,
  listAdmin,
  list as listRepo,
  create as createRepo,
  update as updateRepo,
  softDelete as softDeleteRepo,
  setPinned,
} from "../services/AnnouncementService";

export async function list(req: Request, res: Response) {
  try {
    const user = req.user as { id: string; rtId?: string };
    const data = await listRepo(req.query as any, user?.rtId);
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

export async function detail(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const item = await getById(id);
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Announcement not found" });
    return res.status(200).json({ success: true, message: "OK", data: item });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch announcement",
    });
  }
}

// === ADMIN ===
export async function adminList(req: Request, res: Response) {
  try {
    const user = req.user as { id: string; rtId?: string };
    const data = await listAdmin(req.query as any, user?.rtId);
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

export async function adminDetail(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const item = await getByIdAdmin(id);
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

export async function create(req: Request, res: Response) {
  try {
    const user = req.user as { id: string };
    const created = await createRepo(user.id, req.body);
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

export async function update(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updated = await updateRepo(id, req.body);
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

export async function softDelete(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await softDeleteRepo(id);
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

export async function pin(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await setPinned(id, true);
    return res.status(200).json({ success: true, message: "Pinned" });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to pin",
    });
  }
}

export async function unpin(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await setPinned(id, false);
    return res.status(200).json({ success: true, message: "Unpinned" });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to unpin",
    });
  }
}
