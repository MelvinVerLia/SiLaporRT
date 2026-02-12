import {
  getSubscriptionStatus,
  toggleSubscribe,
} from "../../../services/notificationService";
import { useEffect, useState } from "react";
import { enableNotifications } from "../../../utils/PushSubscription";

interface NotificationToggleProps {
  userId: string;
}

const NotificationToggle = ({ userId }: NotificationToggleProps) => {
  const [enabled, setEnabled] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await getSubscriptionStatus();

      setEnabled(status.status);
      setHasSubscription(status.hasSubscription);
    };
    checkStatus();
  }, []);
  const handleToggle = async (next: boolean) => {
    if (next) {
      if (!hasSubscription) {
        await enableNotifications(userId);
      }

      await toggleSubscribe(true);
    }

    if (!next) {
      await toggleSubscribe(false);
    }

    setEnabled(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Notifications
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Aktifkan notifikasi untuk pengumuman penting
          </p>
        </div>

        <button
          onClick={() => handleToggle(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800
            ${enabled ? "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-blue-500" : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 focus:ring-gray-400"}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200
              ${enabled ? "translate-x-6" : "translate-x-1"}`}
          />
        </button>
      </div>

      {Notification.permission === "denied" && enabled && (
        <div className="mt-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2">
          <p className="text-sm text-red-600 dark:text-red-400">
            Notifikasi diblokir oleh browser. Silakan aktifkan di pengaturan
            browser Anda.
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationToggle;
