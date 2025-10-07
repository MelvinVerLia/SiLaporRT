import prisma from "../config/prisma";
import { ReportStatus } from "../generated/prisma";
import { CreateReportData } from "../types/reportTypes";

const visibleWhere = (includePrivate: boolean = false) => {
  if (includePrivate) {
    // Admin can see all reports (both public and private)
    return {};
  }
  return {
    isPublic: true,
  };
};

class ReportRepository {
  static async createReport(data: CreateReportData) {
    try {
      const location = await prisma.location.create({
        data: {
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          address: data.location.address,
          rt: data.location.rt,
          rw: data.location.rw,
          kelurahan: data.location.kelurahan,
          kecamatan: data.location.kecamatan,
        },
      });

      const report = await prisma.report.create({
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          isAnonymous: data.isAnonymous ?? false,
          isPublic: data.isPublic ?? true,
          userId: data.userId,
          locationId: location.id,
          // Create attachments if provided
          attachments: data.attachments
            ? {
                create: data.attachments.map((att) => ({
                  filename: att.filename,
                  url: att.url,
                  fileType: att.fileType,
                  provider: att.provider,
                  publicId: att.publicId,
                  resourceType: att.resourceType,
                  format: att.format,
                  bytes: att.bytes,
                  width: att.width,
                  height: att.height,
                })),
              }
            : undefined,
        },
        include: {
          location: true,
          user: true,
          attachments: true,
          responses: true,
          reportComments: {
            include: {
              user: true,
            },
          },
          reportUpvotes: true,
        },
      });

      return report;
    } catch (error) {
      console.error("Error creating report:", error);
      throw error;
    }
  }

  static async getAllReports({
    page,
    pageSize,
    q,
    category,
    priority,
    status,
    userId,
    includePrivate = false,
    isPublic,
    dateFrom,
    dateTo,
  }: any) {
    try {
      // If userId is provided, user should see all their own reports (public and private)
      // Otherwise, apply visibility filter
      const where: any = userId ? {} : { ...visibleWhere(includePrivate) };

      // Handle specific isPublic filter (for admin filtering)
      if (isPublic === "true" || isPublic === true) {
        where.isPublic = true;
      } else if (isPublic === "false" || isPublic === false) {
        where.isPublic = false;
      }

      if (q && q.trim()) {
        where.OR = [
          ...(where.OR || []),
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ];
      }
      if (category) where.category = category;
      if (priority) where.priority = priority;
      if (status) where.status = status;

      // Add date range filter
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) {
          where.createdAt.gte = new Date(dateFrom);
        }
        if (dateTo) {
          // Set to end of day for dateTo
          const endDate = new Date(dateTo);
          endDate.setHours(23, 59, 59, 999);
          where.createdAt.lte = endDate;
        }
      }
      if (userId) where.userId = userId;

      const skip = (page - 1) * pageSize;

      const [total, items] = await Promise.all([
        prisma.report.count({ where }),
        prisma.report.findMany({
          where,
          skip,
          take: pageSize,
          include: {
            location: true,
            user: {
              select: { id: true, name: true, email: true, isDeleted: true },
            },
            attachments: {
              select: { id: true, filename: true, url: true, fileType: true },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
      ]);
      return { total, items };
    } catch (error) {
      throw error;
    }
  }

  static async getReportById(id: string) {
    try {
      const report = await prisma.report.findUnique({
        where: { id },
        include: {
          location: true,
          user: {
            select: {
              id: true,
              name: true,
              role: true,
              isDeleted: true,
              profile: true,
            },
          },
          attachments: true,
          responses: {
            include: {
              responder: { select: { name: true, role: true } },
              attachments: true,
            },
            orderBy: { createdAt: "asc" },
          },
          reportComments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  isDeleted: true,
                  profile: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
          reportUpvotes: {
            include: {
              user: { select: { id: true, name: true } },
            },
          },
        },
      });

      if (!report) return null;
      return {
        ...report,
        upvoteCount: report.reportUpvotes.length,
        commentCount: report.reportComments.length,
        responseCount: report.responses.length,
      };
    } catch (error) {
      throw error;
    }
  }

  static async addComment(reportId: string, userId: string, content: string) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const comment = await tx.reportComment.create({
          data: {
            reportId,
            userId,
            content,
          },
          include: {
            user: { select: { name: true, role: true } },
          },
        });

        await tx.report.update({
          where: { id: reportId },
          data: {
            commentCount: {
              increment: 1,
            },
          },
        });

        return comment;
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async toggleUpvote(reportId: string, userId: string) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Check if upvote already exists
        const existing = await tx.reportUpvote.findUnique({
          where: {
            reportId_userId: {
              reportId,
              userId,
            },
          },
        });

        if (existing) {
          // Remove upvote
          await tx.reportUpvote.delete({
            where: { id: existing.id },
          });

          // Decrement cached count
          await tx.report.update({
            where: { id: reportId },
            data: {
              upvoteCount: {
                decrement: 1,
              },
            },
          });

          return { upvoted: false, message: "Upvote removed" };
        } else {
          // Add upvote
          await tx.reportUpvote.create({
            data: { reportId, userId },
            include: {
              user: { select: { name: true } },
            },
          });

          // Increment cached count
          await tx.report.update({
            where: { id: reportId },
            data: {
              upvoteCount: {
                increment: 1,
              },
            },
          });

          return { upvoted: true, message: "Upvote added" };
        }
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(reportId: string, status: ReportStatus) {
    try {
      return await prisma.report.update({
        where: { id: reportId },
        data: { status },
        include: {
          location: true,
          user: { select: { name: true, role: true } },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async addOfficialResponse(
    reportId: string,
    responderId: string,
    message: string,
    attachments?: string[] // Array of attachment URLs/filenames
  ) {
    try {
      return await prisma.$transaction(async (tx) => {
        const response = await tx.response.create({
          data: {
            reportId,
            responderId, // Note: using responderId to match schema
            message,
            ...(attachments &&
              attachments.length > 0 && {
                attachments: {
                  create: attachments.map((attachment) => ({
                    filename: attachment,
                    url: attachment,
                    fileType: "image", // You might want to determine this dynamically
                  })),
                },
              }),
          },
          include: {
            responder: { select: { name: true, role: true } },
            attachments: true,
          },
        });

        // Optionally update report status when official response is added
        await tx.report.update({
          where: { id: reportId },
          data: {
            status: ReportStatus.IN_PROGRESS, // or keep current status
          },
        });

        return response;
      });
    } catch (error) {}
  }

  static async getReportsByCategory(category: string) {
    try {
      return await prisma.report.findMany({
        where: {
          category: category as any,
          isPublic: true,
        },
        include: {
          location: true,
          user: { select: { id: true, name: true, role: true } },
          _count: { select: { reportUpvotes: true, reportComments: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      throw error;
    }
  }

  static async getReportsByStatus(status: ReportStatus) {
    try {
      return await prisma.report.findMany({
        where: { status },
        include: {
          location: true,
          user: { select: { id: true, name: true, role: true } },
          _count: { select: { reportUpvotes: true, reportComments: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      throw error;
    }
  }

  // static async getReportsByLocation(rt: string, rw: string) {
  //   return await prisma.report.findMany({
  //     where: {
  //       location: {
  //         rt,
  //         rw,
  //       },
  //       isPublic: true,
  //     },
  //     include: {
  //       location: true,
  //       user: { select: { name: true, role: true } },
  //       _count: { select: { reportUpvotes: true, reportComments: true } },
  //     },
  //     orderBy: { createdAt: "desc" },
  //   });
  // }

  static async getUserUpvoteStatus(reportId: string, userId: string) {
    try {
      const upvote = await prisma.reportUpvote.findUnique({
        where: {
          reportId_userId: {
            reportId,
            userId,
          },
        },
      });
      return !!upvote;
    } catch (error) {
      throw error;
    }
  }

  static async getRecentReports() {
    const where: any = { ...visibleWhere() };
    const [total, items] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.findMany({
        where,
        include: {
          location: true,
          user: { select: { id: true, name: true, email: true } },
          attachments: {
            select: { id: true, filename: true, url: true, fileType: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);
    return { total, items };
  }

  static async deleteReport(reportId: string, userId: string) {
    try {
      // First verify the report belongs to the user
      const report = await prisma.report.findFirst({
        where: { id: reportId, userId: userId },
      });

      if (!report) {
        throw new Error("Report not found or unauthorized");
      }

      // Delete the report (this will cascade to related records)
      const deletedReport = await prisma.report.delete({
        where: { id: reportId },
      });

      return { success: true, data: deletedReport };
    } catch (error) {
      throw error;
    }
  }

  static async toggleVisibility(reportId: string, userId: string) {
    try {
      // First verify the report belongs to the user
      const report = await prisma.report.findFirst({
        where: { id: reportId, userId: userId },
      });

      if (!report) {
        throw new Error("Report not found or unauthorized");
      }

      // Toggle the visibility
      const updatedReport = await prisma.report.update({
        where: { id: reportId },
        data: { isPublic: !report.isPublic },
        include: {
          location: true,
          user: { select: { id: true, name: true, email: true } },
          attachments: {
            select: { id: true, filename: true, url: true, fileType: true },
          },
        },
      });

      return { success: true, data: updatedReport };
    } catch (error) {
      throw error;
    }
  }
}

export default ReportRepository;
