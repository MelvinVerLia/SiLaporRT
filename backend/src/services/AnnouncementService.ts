import { AnnouncementRepository } from "../repositories/AnnouncementRepository";
import { NotificationService } from "./NotificationService";

function parseBool(v: any): boolean | undefined {
  if (v === undefined) return undefined;
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v === "true";
  return undefined;
}

function parseDateNullable(v: any): Date | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || v === "") return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : d;
}

export class AnnouncementService {
  // ==== PUBLIC ====
  static async list(params: {
    page?: any;
    pageSize?: any;
    q?: string;
    type?: string;
    priority?: string;
    pinnedFirst?: any;
  }) {
    const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(params.pageSize ?? "10", 10) || 10)
    );
    const pinnedFirst = parseBool(params.pinnedFirst) ?? true;
    const { total, items } = await AnnouncementRepository.listVisible({
      page,
      pageSize,
      q: params.q,
      type: params.type,
      priority: params.priority,
      pinnedFirst,
    });
    return { page, pageSize, total, items };
  }

  static async getById(id: string) {
    return AnnouncementRepository.getVisibleById(id);
  }

  // ==== ADMIN ====
  static async listAdmin(params: {
    page?: any;
    pageSize?: any;
    q?: string;
    type?: string;
    priority?: string;
    pinnedFirst?: any;
    includeInactive?: any;
    showInactiveOnly?: any;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(params.pageSize ?? "10", 10) || 10)
    );
    const pinnedFirst = parseBool(params.pinnedFirst) ?? true;
    const includeInactive = parseBool(params.includeInactive) ?? false;
    const showInactiveOnly = parseBool(params.showInactiveOnly) ?? false;

    const { total, items } = await AnnouncementRepository.listAdmin({
      page,
      pageSize,
      q: params.q,
      type: params.type,
      priority: params.priority,
      pinnedFirst,
      includeInactive,
      showInactiveOnly,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
    });
    return { page, pageSize, total, items };
  }

  static async getByIdAdmin(id: string) {
    return AnnouncementRepository.getByIdAdmin(id);
  }

  static async create(authorId: string, body: any) {
    const publishAt = parseDateNullable(body.publishAt);
    const expireAt = parseDateNullable(body.expireAt);
    if (publishAt && expireAt && publishAt > expireAt) {
      throw new Error("publishAt must be earlier than expireAt");
    }

    const attachments = Array.isArray(body.attachments)
      ? body.attachments
          .filter((a: any) => a?.url && a?.filename && a?.fileType)
          .map((a: any) => ({
            filename: a.filename,
            url: a.url,
            fileType: a.fileType,
          }))
      : undefined;

    const announcement = await AnnouncementRepository.create({
      authorId,
      data: {
        title: body.title,
        content: body.content,
        type: body.type,
        priority: body.priority,
        isPinned: parseBool(body.isPinned) ?? false,
        publishAt: publishAt ?? null,
        expireAt: expireAt ?? null,
        isActive: parseBool(body.isActive) ?? true,
      },
      attachments,
    });

    const url =
      `${process.env.FRONTEND_URL_PROD}/announcements/${announcement.id}` ||
      `${process.env.FRONTEND_URL}/announcements/${announcement.id}`;
    await NotificationService.sendNotificationAll(
      `📢 Pengumuman Baru: "${announcement.title}"`,
      `Cek pengumuman terbaru berjudul "${announcement.title}" sekarang di aplikasi SiLaporRT.`,
      url,
      "https://res.cloudinary.com/dgnedkivd/image/upload/v1757562088/silaporrt/dev/logo/logo_lnenhb.png",
      "ANNOUNCEMENT"
    );

    return announcement;
  }

  static async update(id: string, body: any) {
    const patch: any = {};
    if (body.title !== undefined) patch.title = body.title;
    if (body.content !== undefined) patch.content = body.content;
    if (body.type !== undefined) patch.type = body.type;
    if (body.priority !== undefined) patch.priority = body.priority;

    const publishAt = parseDateNullable(body.publishAt);
    const expireAt = parseDateNullable(body.expireAt);
    if (publishAt !== undefined) patch.publishAt = publishAt;
    if (expireAt !== undefined) patch.expireAt = expireAt;

    if (patch.publishAt && patch.expireAt && patch.publishAt > patch.expireAt) {
      throw new Error("publishAt must be earlier than expireAt");
    }

    if (body.isPinned !== undefined) patch.isPinned = parseBool(body.isPinned);
    if (body.isActive !== undefined) patch.isActive = parseBool(body.isActive);

    // Handle attachments update
    const attachments = Array.isArray(body.attachments)
      ? body.attachments
          .filter((a: any) => a?.url && a?.filename && a?.fileType)
          .map((a: any) => ({
            filename: a.filename,
            url: a.url,
            fileType: a.fileType,
          }))
      : undefined;

    return AnnouncementRepository.updateWithAttachments(id, patch, attachments);
  }

  static async softDelete(id: string) {
    return AnnouncementRepository.softDelete(id);
  }

  static async setPinned(id: string, isPinned: boolean) {
    return AnnouncementRepository.setPinned(id, isPinned);
  }
}
