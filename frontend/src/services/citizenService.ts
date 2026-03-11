import { request } from "./api";

export interface Citizen {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  profile: string | null;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface CitizenListResponse {
  items: Citizen[];
  page: number;
  pageSize: number;
  total: number;
}

export async function adminListCitizens(params: {
  page?: number;
  pageSize?: number;
  q?: string;
  verificationStatus?: string;
}): Promise<CitizenListResponse> {
  const res = await request("/citizens", {
    method: "GET",
    params,
  });
  return res.data;
}

export async function verifyCitizen(citizenId: string) {
  const res = await request(`/citizens/${citizenId}/verify`, {
    method: "PUT",
  });
  return res.data;
}

export async function rejectCitizen(citizenId: string) {
  const res = await request(`/citizens/${citizenId}/reject`, {
    method: "PUT",
  });
  return res.data;
}
