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
  console.log(res)
  return res.data as Paged<Announcement>;
}

export async function getAnnouncement(id: string) {
  const res = await request(`/announcements/${id}`, { method: "GET" });
  return res.data as Announcement;
}

// Get announcements count with optional time filtering
export async function getAnnouncementsCount(daysBack?: number): Promise<number> {
  try {
    // Fetch all announcements (we'll filter on frontend for now)
    const res = await listAnnouncements({ page: 1, pageSize: 1000 }); // Large page size to get all
    
    if (!daysBack) {
      return res.total || 0;
    }

    // Apply time filtering
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    
    // Filter announcements based on creation date
    const filteredAnnouncements = res.items.filter((announcement: Announcement) => 
      new Date(announcement.createdAt) >= cutoffDate
    );
    
    console.log(`📢 Announcements in last ${daysBack} days:`, filteredAnnouncements.length);
    return filteredAnnouncements.length;
    
  } catch (error) {
    console.error('Error fetching announcements count:', error);
    return 0;
  }
}
