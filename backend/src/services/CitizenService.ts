import {
  getAllCitizens as getAllCitizensRepo,
  verifyCitizen as verifyCitizenRepo,
  rejectCitizen as rejectCitizenRepo,
} from "../repositories/CitizenRepository";
export async function getAllCitizens(
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

  const { total, items } = await getAllCitizensRepo({
    page,
    pageSize,
    q: params.q,
    verificationStatus: params.verificationStatus,
    rtId,
  });

  return { page, pageSize, total, items };
}

export async function verifyCitizen(citizenId: string) {
  return verifyCitizenRepo(citizenId);
}

export async function rejectCitizen(citizenId: string) {
  return rejectCitizenRepo(citizenId);
}
