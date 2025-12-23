import Button from "./Button";
import { enableNotifications } from "../../utils/PushSubscription";
import { BellRing } from "lucide-react";

interface NotificationPopupProps {
  userId: string;
  onClose: () => void;
}

const NotificationPopup = ({ userId, onClose }: NotificationPopupProps) => {
  const handleClickGranted = () => {
    enableNotifications(userId);
    onClose();
  };

  const handleClickDenied = () => {
    onClose();
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 w-80 rounded-2xl bg-zinc-900 p-5 shadow-xl ring-1 ring-white/10">
      <h3 className="mb-1 text-sm font-semibold text-white">
        <BellRing className="mr-2 inline-block h-5 w-5" />
        Turn on notifications?
      </h3>

      <p className="mb-4 text-sm text-zinc-400">
        We’ll only notify you about important updates.
      </p>

      <div className="flex justify-end gap-3">
        <Button
          variant="secondary"
          onClick={handleClickDenied}
          className="text-black"
        >
          Not now
        </Button>

        <Button onClick={handleClickGranted}>Allow</Button>
      </div>
    </div>
  );
};

export default NotificationPopup;
