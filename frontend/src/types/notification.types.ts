export interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  clickUrl?: string;
  category: NotificationCategory;
  isRead: boolean;
}

export enum NotificationCategory {
  REPORT = "REPORT",
  ANNOUNCEMENT = "ANNOUNCEMENT",
}
