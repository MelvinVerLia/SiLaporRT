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
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition hover:cursor-pointer
            ${enabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition
              ${enabled ? "translate-x-6" : "translate-x-1"}`}
          />
        </button>
      </div>

      {Notification.permission === "denied" && enabled && (
        <p className="text-sm text-red-500">
          Notifications are blocked in browser settings.
        </p>
      )}
    </div>
  );
};

export default NotificationToggle;
