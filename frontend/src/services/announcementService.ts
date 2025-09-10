import { request } from "./api";
import { Announcement, Paged } from "../types/announcement.types";

export async function listAnnouncements(params: {
  page?: number;
  pageSize?: number;
  pinnedFirst?: boolean;
}) {
  const res = await request("/announcements", {
    method: "GET",
    params, // axios-friendly
  });
  return res.data as Paged<Announcement>;
}

export async function getAnnouncement(id: string) {
  const res = await request(`/announcements/${id}`, { method: "GET" });
  return res.data as Announcement;
}
