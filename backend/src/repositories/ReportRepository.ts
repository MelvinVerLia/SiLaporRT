import prisma from "../config/prisma";
import { ReportStatus } from "@prisma/client";
import { CreateReportData } from "../types/reportTypes";

class ReportRepository {
  static async createReport(data: any) {
    try {
      // Step 1: Create the location first
      console.log("Creating location with data:", data.location);
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
      console.log("Location created:", location);
      // Step 2: Create the report with the location ID
      const report = await prisma.report.create({
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          isAnonymous: data.isAnonymous ?? false,
          isPublic: data.isPublic ?? true,
          userId: data.userId,
          locationId: location.id, // Use the created location ID
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
      return null;
    }
  }

  static async getAllReports() {
    const data = await prisma.report.findMany({
      where: { isPublic: true },
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
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            reportUpvotes: true,
            reportComments: true,
            responses: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform data to include computed upvoteCount and commentCount
    return data.map((report) => ({
      ...report,
      upvoteCount: report._count.reportUpvotes,
      commentCount: report._count.reportComments,
      responseCount: report._count.responses,
    }));
  }

  static async getReportById(id: string) {
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

    // Transform to include computed counts
    return {
      ...report,
      upvoteCount: report.reportUpvotes.length,
      commentCount: report.reportComments.length,
      responseCount: report.responses.length,
    };
  }

  static async addComment(reportId: string, userId: string, content: string) {
    // Start a transaction to create comment and update comment count
    const result = await prisma.$transaction(async (tx) => {
      // Create the comment
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

      // Update the cached comment count
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
  }

  static async toggleUpvote(reportId: string, userId: string) {
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
  }

  static async updateStatus(reportId: string, status: ReportStatus) {
    return await prisma.report.update({
      where: { id: reportId },
      data: { status },
      include: {
        location: true,
        user: { select: { name: true, role: true } },
      },
    });
  }

  static async addOfficialResponse(
    reportId: string,
    responderId: string,
    message: string,
    attachments?: string[] // Array of attachment URLs/filenames
  ) {
    return await prisma.$transaction(async (tx) => {
      // Create the official response
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
  }

  // Additional useful methods aligned with your schema

  static async getReportsByCategory(category: string) {
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
  }

  static async getReportsByStatus(status: ReportStatus) {
    return await prisma.report.findMany({
      where: { status },
      include: {
        location: true,
        user: { select: { name: true, role: true } },
        _count: { select: { reportUpvotes: true, reportComments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getReportsByLocation(rt: string, rw: string) {
    return await prisma.report.findMany({
      where: {
        location: {
          rt,
          rw,
        },
        isPublic: true,
      },
      include: {
        location: true,
        user: { select: { name: true, role: true } },
        _count: { select: { reportUpvotes: true, reportComments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getUserUpvoteStatus(reportId: string, userId: string) {
    const upvote = await prisma.reportUpvote.findUnique({
      where: {
        reportId_userId: {
          reportId,
          userId,
        },
      },
    });
    return !!upvote;
  }
}

export default ReportRepository;
