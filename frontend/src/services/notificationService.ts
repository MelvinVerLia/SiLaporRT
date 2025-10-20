import { request } from "./api";

export async function sendNotification(subscription: any) {
    const res = await request("/notification/send", { method: "POST", data: subscription});
    return res.data;
}
