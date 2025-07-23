import { ReportStatus, ReportCategory, Role } from "@prisma/client";

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
}

export { CreateReportData };
