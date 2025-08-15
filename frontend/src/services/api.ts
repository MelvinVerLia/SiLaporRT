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
  } catch (error: any) {
    if (error.response) {
      const msg =
        error.response?.data?.message ||
        error.response?.statusText ||
        "Request failed";
      throw { message: msg, status: error.response.status };
    }
    if (error.request) {
      throw { message: "Network error" };
    }
    throw { message: error?.message || "Request failed" };
  }
}
