import ReportRepository from "../repositories/ReportRepository";

class ReportService {
  static async createReport(data: any) {
    const newReport = await ReportRepository.createReport(data);
    return newReport;
  }

  static async getAllReports() {
    return await ReportRepository.getAllReports();
  }

  static getReportById(id: string) {
    return ReportRepository.getReportById(id);
  }

  static addComment(reportId: string, userId: string, content: string) {
    return ReportRepository.addComment(reportId, userId, content);
  }

  static toggleUpvote(reportId: string, userId: string) {
    return ReportRepository.toggleUpvote(reportId, userId);
  }

  static updateStatus(reportId: string, status: string) {
    return ReportRepository.updateStatus(reportId, status);
  }

  static addOfficialResponse(
    reportId: string,
    userId: string,
    message: string
  ) {
    return ReportRepository.addOfficialResponse(reportId, userId, message);
  }
}

export default ReportService;
