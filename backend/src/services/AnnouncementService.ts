import {
  getVisibleById,
  listVisible,
  listAdmin as listAdminRepo,
  getByIdAdmin as getByIdAdminRepo,
  create as createRepo,
  updateWithAttachments,
  softDelete as softDeleteRepo,
  setPinned as setPinnedRepo,
} from "../repositories/AnnouncementRepository";
import { sendNotificationAll } from "./NotificationService";
import { validateUpload } from "../config/uploadPolicy";

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

// ==== PUBLIC ====
export async function list(
  params: {
    page?: any;
    pageSize?: any;
    q?: string;
    type?: string;
    priority?: string;
    pinnedFirst?: any;
  },
  rtId?: string,
) {
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(params.pageSize ?? "10", 10) || 10),
  );
  const pinnedFirst = parseBool(params.pinnedFirst) ?? true;
  const { total, items } = await listVisible({
    page,
    pageSize,
    q: params.q,
    type: params.type,
    priority: params.priority,
    pinnedFirst,
    rtId,
  });
  return { page, pageSize, total, items };
}

export async function getById(id: string) {
  return getVisibleById(id);
}

// ==== ADMIN ====
export async function listAdmin(
  params: {
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
    sortBy?: string;
  },
  rtId?: string,
) {
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(params.pageSize ?? "10", 10) || 10),
  );
  const pinnedFirst = parseBool(params.pinnedFirst) ?? true;
  const includeInactive = parseBool(params.includeInactive) ?? false;
  const showInactiveOnly = parseBool(params.showInactiveOnly) ?? false;

  const { total, items } = await listAdminRepo({
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
    sortBy: params.sortBy,
    rtId,
  });
  return { page, pageSize, total, items };
}

export async function getByIdAdmin(id: string) {
  return getByIdAdminRepo(id);
}

export async function create(authorId: string, body: any) {
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

  // Validate attachments against upload policy
  if (attachments && attachments.length > 0) {
    for (const att of attachments) {
      validateUpload("announcements", {
        resourceType: att.fileType === "document" ? "raw" : att.fileType,
        format: att.filename?.split(".").pop()?.toLowerCase(),
        bytes: (att as any).bytes,
      });
    }
  }

  const announcement = await createRepo({
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

  const baseUrl = process.env.FRONTEND_URL_PROD || process.env.FRONTEND_URL;
  const url = `${baseUrl}/announcements/${announcement.id}`;

  await sendNotificationAll(
    `📢 Pengumuman Baru: "${announcement.title}"`,
    `Cek pengumuman terbaru berjudul "${announcement.title}" sekarang di aplikasi SiLaporRT.`,
    url,
    "https://res.cloudinary.com/dgnedkivd/image/upload/v1757562088/silaporrt/dev/logo/logo_lnenhb.png",
    "ANNOUNCEMENT",
  );

  return announcement;
}

export async function update(id: string, body: any) {
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

  // Validate attachments against upload policy
  if (attachments && attachments.length > 0) {
    for (const att of attachments) {
      validateUpload("announcements", {
        resourceType: att.fileType === "document" ? "raw" : att.fileType,
        format: att.filename?.split(".").pop()?.toLowerCase(),
        bytes: (att as any).bytes,
      });
    }
  }

  return updateWithAttachments(id, patch, attachments);
}

export async function softDelete(id: string) {
  return softDeleteRepo(id);
}

export async function setPinned(id: string, isPinned: boolean) {
  return setPinnedRepo(id, isPinned);
}
