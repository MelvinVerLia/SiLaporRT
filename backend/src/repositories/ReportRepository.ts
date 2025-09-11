import prisma from "../config/prisma";
import { ReportStatus } from "@prisma/client";
import { CreateReportData } from "../types/reportTypes";

const visibleWhere = () => {
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

  static async getAllReports({ page, pageSize, q, category, status }: any) {
    try {
      const where: any = { ...visibleWhere() };
      if (q && q.trim()) {
        where.OR = [
          ...(where.OR || []),
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ];
      }
      if (category) where.category = category;
      if (status) where.status = status;

      const skip = (page - 1) * pageSize;

      const [total, items] = await Promise.all([
        prisma.report.count({ where }),
        prisma.report.findMany({
          where,
          skip,
          take: pageSize,
          include: {
            location: true,
            user: { select: { id: true, name: true, email: true } },
            attachments: {
              select: { id: true, filename: true, url: true, fileType: true },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
      ]);
      return { total, items };

      // const data = await prisma.report.findMany({
      //   where: { isPublic: true },
      //   include: {
      //     location: true,
      //     user: {
      //       select: {
      //         id: true,
      //         name: true,
      //         role: true,
      //       },
      //     },
      //     attachments: true,
      //     responses: {
      //       include: {
      //         responder: { select: { name: true, role: true } },
      //         attachments: true,
      //       },
      //       orderBy: { createdAt: "desc" },
      //     },
      //     _count: {
      //       select: {
      //         reportUpvotes: true,
      //         reportComments: true,
      //         responses: true,
      //       },
      //     },
      //   },
      //   orderBy: { createdAt: "desc" },
      // });

      // return data.map((report) => ({
      //   // report,
      //   ...report,
      //   upvoteCount: report._count.reportUpvotes,
      //   commentCount: report._count.reportComments,
      //   responseCount: report._count.responses,
      // }));
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
          user: { select: { name: true, role: true } },
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
          user: { select: { name: true, role: true } },
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
}

export default ReportRepository;
