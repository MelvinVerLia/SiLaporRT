import { request } from "./api";
import { LoginCredentials, RegisterData, AuthUser, User } from "../types/auth.types";

export async function login(payload: LoginCredentials): Promise<AuthUser> {
  const res = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data as AuthUser; // { user, token }
}

export async function register(
  payload: Omit<RegisterData, "confirmPassword">
): Promise<AuthUser> {
  const { ...body } = payload;
  const res = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res.data as AuthUser; // { user, token }
}

export async function getProfile(): Promise<User> {
  const res = await request("/auth/profile", { method: "GET" });
  return (res.data as { user: User }).user;
}

export async function logout() {
  await request("/auth/logout", { method: "POST" }); // clear cookie di BE
}
