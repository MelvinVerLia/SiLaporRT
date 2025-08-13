const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export async function request(path: string, options: RequestInit = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include", // cookie dikirim otomatis
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    throw { message: json?.message || res.statusText || "Request failed" };
  }
  return json;
}
