import { CloudinaryFile } from "./announcement.types";

export enum ReportCategory {
  INFRASTRUCTURE = "INFRASTRUCTURE",
  CLEANLINESS = "CLEANLINESS",
  LIGHTING = "LIGHTING",
  SECURITY = "SECURITY",
  UTILITIES = "UTILITIES",
  ENVIRONMENT = "ENVIRONMENT",
  SUGGESTION = "SUGGESTION",
  OTHER = "OTHER",
}

export enum ReportStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  REJECTED = "REJECTED",
  CLOSED = "CLOSED",
}

export enum Role {
  CITIZEN = "CITIZEN",
  RT_ADMIN = "RT_ADMIN",
}

export interface Location {
  id?: string;
  latitude: number;
  longitude: number;
  address: string;
  rt: string;
  rw: string;
  kelurahan?: string;
  kecamatan?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  fileType: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: Role;
  rtId?: string;
  isDeleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  status: ReportStatus;
  isAnonymous: boolean;
  isPublic: boolean;
  upvoteCount: number;
  commentCount: number;
  responseCount: number;
  location: Location;
  locationId: string;
  user?: User;
  userId?: string;
  attachments: Attachment[];
  responses: Response[];
  reportComments: ReportComment[];
  reportUpvotes: ReportUpvote[];
  createdAt: string;
  updatedAt: string;
}

export interface ReportComment {
  id: string;
  content: string;
  reportId: string;
  user: User;
  userId: string;
  createdAt: string;
}

export interface Response {
  id: string;
  message: string;
  attachments: Attachment[];
  reportId: string;
  responder: User;
  responderId: string;
  createdAt: string;
}

export interface ReportUpvote {
  id: string;
  reportId: string;
  userId: string;
  createdAt: string;
}

export interface CreateReportFormData {
  title: string;
  description: string;
  isAnonymous: boolean;
  isPublic: boolean;
  location: Location | null;
  attachments: CloudinaryFile[];
}
