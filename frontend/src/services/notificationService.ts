import { request } from "./api";

export async function sendNotification(subscription: any) {
    const res = await request("/notification/send", { method: "POST", data: subscription});
    return res.data;
}

export async function toggleSubscribe(enabled: boolean) {
  const res = await request(`/notification/toggle/subscribe`, {
    method: "PUT",
    data: { enabled },
  });
  return res.data;
}

export async function getSubscriptionStatus()
{
  const res = await request(`/notification/subscribe/status`, { method: "GET" });
  return res;
}