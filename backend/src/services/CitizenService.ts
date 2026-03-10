import CitizenRepository from "../repositories/CitizenRepository";

class CitizenService {
  static async getAllCitizens(
    params: {
      page?: any;
      pageSize?: any;
      q?: string;
      verificationStatus?: string;
    },
    rtId?: string,
  ) {
    const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(params.pageSize ?? "10", 10) || 10),
    );

    const { total, items } = await CitizenRepository.getAllCitizens({
      page,
      pageSize,
      q: params.q,
      verificationStatus: params.verificationStatus,
      rtId,
    });

    return { page, pageSize, total, items };
  }

  static async verifyCitizen(citizenId: string) {
    return CitizenRepository.verifyCitizen(citizenId);
  }

  static async rejectCitizen(citizenId: string) {
    return CitizenRepository.rejectCitizen(citizenId);
  }
}

export default CitizenService;
