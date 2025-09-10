import { request } from "./api";
import {
  Announcement,
  AnnouncementType,
  Priority,
  Paged,
} from "../types/announcement.types";

export type UpsertAnnouncementPayload = {
  title: string;
  content: string;
  type: AnnouncementType;
  priority: Priority;
  isPinned?: boolean;
  isActive?: boolean;
  publishAt?: string | null;
  expireAt?: string | null;
  attachments?: Array<{
    filename: string;
    url: string;
    fileType: "image" | "video" | "document";
    provider?: "cloudinary";
    publicId?: string;
    resourceType?: string;
    format?: string;
    bytes?: number;
    width?: number;
    height?: number;
  }>;
};

export async function adminListAnnouncements(params: {
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
  showInactiveOnly?: boolean;
  q?: string;
  type?: AnnouncementType;
  priority?: Priority;
  pinnedFirst?: boolean;
}) {
  const res = await request("/announcements/admin/list", {
    method: "GET",
    params,
  });
  return res.data as Paged<Announcement>;
}

export async function adminGetAnnouncement(id: string) {
  const res = await request(`/announcements/admin/${id}`, { method: "GET" });
  return res.data as Announcement;
}

export async function createAnnouncement(payload: UpsertAnnouncementPayload) {
  const res = await request("/announcements", {
    method: "POST",
    data: payload,
  });
  return res.data as Announcement;
}

export async function updateAnnouncement(
  id: string,
  payload: UpsertAnnouncementPayload
) {
  const res = await request(`/announcements/${id}`, {
    method: "PATCH",
    data: payload,
  });
  return res.data as Announcement;
}

export async function deleteAnnouncement(id: string) {
  const res = await request(`/announcements/${id}`, { method: "DELETE" });
  return res.data;
}

export async function setPinned(id: string, isPinned: boolean) {
  const path = isPinned ? "pin" : "unpin";
  const res = await request(`/announcements/${id}/${path}`, { method: "POST" });
  return res.data as Announcement;
}

export async function setActive(id: string, isActive: boolean) {
  const res = await request(`/announcements/${id}`, {
    method: "PATCH",
    data: { isActive },
  });
  return res.data as Announcement;
}
