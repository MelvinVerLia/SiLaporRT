import { sendNotification as send } from "../services/notificationService";
export const useNotification = () => {
  const sendNotification = (subscription: any) => send(subscription);
  return { sendNotification };
};
