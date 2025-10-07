import { ReportStatus, ReportCategory, Role } from "../generated/prisma";

interface CreateReportData {
  title: string;
  description: string;
  category: ReportCategory;
  isAnonymous?: boolean;
  isPublic?: boolean;
  userId?: string;
  locationId: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    rt: string;
    rw: string;
    kelurahan?: string;
    kecamatan?: string;
  };
  attachments?: {
    filename: string;
    url: string;
    fileType: string;
    provider?: string;
    publicId?: string;
    resourceType?: string;
    format?: string;
    bytes?: number;
    width?: number;
    height?: number;
  }[];
}

export { CreateReportData };
