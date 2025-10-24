import axios, { type AxiosRequestConfig } from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL_PROD || import.meta.env.VITE_API_BASE_URL;

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
      const status = error.response.status;

      if (status === 401) {
        try {
          console.log("refreshed");
          await api.post("/auth/refresh", {}, { withCredentials: true });

          const retryRes = await api.request({ url: path, ...config });
          const retryData = retryRes?.data ?? {};
          if (retryData?.success === false) {
            throw { message: retryData?.message || "Request failed" };
          }
          return retryData;
        } catch (error) {
          console.log("error", error);
          throw { message: "Session expired, please login again", status: 401 };
        }
      }

      const msg =
        error.response?.data?.message ||
        error.response?.statusText ||
        "Request failed";
      throw { message: msg, status };
    }

    if (error.request) {
      throw { message: "Network error" };
    }

    throw { message: error?.message || "Request failed" };
  }
}

export async function publicRequest(
  path: string,
  config: AxiosRequestConfig = {}
) {
  try {
    const res = await api.request({ url: path, ...config });
    return res?.data ?? {};
  } catch (error: any) {
    if (error.response) {
      throw {
        message:
          error.response?.data?.message ||
          error.response?.statusText ||
          "Request failed",
        status: error.response.status,
      };
    }
    if (error.request) throw { message: "Network error" };
    throw { message: error?.message || "Request failed" };
  }
}
