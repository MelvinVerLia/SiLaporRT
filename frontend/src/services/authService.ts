import { publicRequest, request } from "./api";
import {
  LoginCredentials,
  RegisterData,
  AuthUser,
  User,
} from "../types/auth.types";

export async function login(payload: LoginCredentials): Promise<AuthUser> {
  const res = await publicRequest("/auth/login", {
    method: "POST",
    data: payload,
  });
  return res.data as AuthUser;
}

export async function getProfile(): Promise<User> {
  const res = await request("/auth/profile", { method: "GET" });
  return (res.data as { user: User }).user;
}

export async function logout() {
  await publicRequest("/auth/logout", { method: "POST" });
}

export async function sendOTP(
  payload: Omit<RegisterData, "confirmPassword">
): Promise<AuthUser> {
  const res = await publicRequest("/auth/send-otp", {
    method: "POST",
    data: payload,
  });
  return res;
}

export async function resendOTP(token: string) {
  const res = await publicRequest(`/auth/resend-otp`, {
    method: "POST",
    data: { token },
  });
  return res;
}

export async function register(token: string, otp: string) {
  const res = await publicRequest(`/auth/register`, {
    method: "POST",
    data: { token, otp },
  });
  return res;
}

export async function deleteAccount() {
  const res = await request(`/auth/delete-account`, {
    method: "DELETE",
  });
  return res;
}

export async function updateProfile(data: User) {
  const res = await request(`/auth/update/profile`, {
    method: "PUT",
    data,
  });
  return res;
}

export async function changePassword(password: string) {
  const res = await request(`/auth/change-password`, {
    method: "put",
    data: { password },
  });
  return res;
}

export async function validateForgotPasswordToken(
  token: string,
  email: string
) {
  const res = await publicRequest(`/auth/validate-token`, {
    method: "POST",
    data: { token, email },
  });
  return res;
}

export async function changeForgotPassword(email: string, password: string) {
  const res = await publicRequest(`/auth/forgot-password-change`, {
    method: "PUT",
    data: { email, password },
  });
  return res;
}

export async function forgotPassword(email: string) {
  const res = await publicRequest(`/auth/forgot-password`, {
    method: "POST",
    data: { email },
  });
  return res;
}

export async function getNotifications() {
  const res = await request("/notification/notifications", { method: "GET" });
  return res;
}

export async function markNotificationRead(id: string) {
  const res = await request(`/notification/read/${id}`, { method: "PUT" });
  return res;
}

export async function markNotificationAsReadAll() {
  const res = await request("/notification/read-all", { method: "PUT" });
  return res;
}

export async function getAllUsers() {
  const res = await request("/auth/all-users", { method: "GET" });
  return res;
}

export async function getRtDropdown(search: string) {
  const res = await request(`/auth/available-rt?search=${search}`, {
    method: "GET",
  });
  return res;
}

export async function getRtLocation(rtId: string) {
  const res = await request(`/auth/location/${rtId}`, { method: "GET" });
  return res;
}
