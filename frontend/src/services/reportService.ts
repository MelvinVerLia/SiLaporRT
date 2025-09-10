import { request } from "./api";

export async function getReportList(params: {
  page?: number;
  pageSize: number;
  q: string;
  category: string;
  status: string;
}) {
  const res = await request("/reports", { method: "GET", params });
  console.log(res.data);
  return res.data;
}

export async function getReportDetails(id: string) {
  const res = await request(`/reports/${id}`, { method: "GET" });
  return res.data;
}

export async function getRecentReports() {
  const res = await request("/reports/get-recent", { method: "GET" });
  console.log(res.data)
  return res.data;
}

export async function toggleUpvote(id: string) {
  console.log("help")
  const res = await request(`/reports/${id}/upvote`, { method: "PUT" });
  return res.data;
}

// export async function getRecentReports(search: string, category: string, status:string) {
//   const res = await request("/reports/get-recent", { method: "GET" });
//   return res.data;
// }
