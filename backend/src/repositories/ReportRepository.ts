import prisma from "../config/prisma";

class ReportRepository {
  static async createReport(data: any) {
    console.log(data);
    return await prisma.report.create({ data });
  }

  static async getAllReports() {
    const data = await prisma.report.findMany({
      where: { isPublic: true },
      include: {
        location: true,
        user: { select: { name: true, role: true } },
        _count: { select: { reportUpvotes: true, reportComments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return data;
  }

  static async getReportById(id: string) {
    return await prisma.report.findUnique({
      where: { id },
      include: {
        location: true,
        user: { select: { name: true, role: true } },
        reportComments: {
          include: { user: { select: { name: true, role: true } } },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { reportUpvotes: true } },
      },
    });
  }

  static async addComment(reportId: string, userId: string, content: string) {
    return await prisma.reportComment.create({
      data: {
        reportId,
        userId,
        content,
      },
    });
  }

  static async toggleUpvote(reportId: string, userId: string) {
    // const existing = await prisma.upvote.findFirst({
    //   where: { reportId, userId },
    // });
    // if (existing) {
    //   await prisma.upvote.delete({ where: { id: existing.id } });
    //   return { upvoted: false };
    // } else {
    //   await prisma.upvote.create({ data: { reportId, userId } });
    //   return { upvoted: true };
    // }
  }

  static async updateStatus(reportId: string, status: string) {
    // return await prisma.report.update({
    //   where: { id: reportId },
    //   data: { status },
    // });
  }

  static async addOfficialResponse(
    reportId: string,
    userId: string,
    message: string
  ) {
    // return await prisma.response.create({
    //   data: {
    //     reportId,
    //     userId,
    //     message,
    //   },
    // });
  }
}

export default ReportRepository;
