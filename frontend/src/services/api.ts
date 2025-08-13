import axios, { type AxiosRequestConfig } from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export async function request(path: string, config: AxiosRequestConfig = {}) {
  try {
    const res = await api.request({ url: path, ...config });
    const data = res?.data ?? {};
    if (data?.success === false) {
      throw { message: data?.message || "Request failed" };
    }
    return data;
  } catch (err: any) {
    if (err.response) {
      const msg =
        err.response?.data?.message ||
        err.response?.statusText ||
        "Request failed";
      throw { message: msg, status: err.response.status };
    }
    if (err.request) {
      throw { message: "Network error" };
    }
    throw { message: err?.message || "Request failed" };
  }
}
