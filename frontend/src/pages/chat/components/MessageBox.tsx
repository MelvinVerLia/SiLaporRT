import { format, isSameDay, isToday, isYesterday, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { User as UserIcon } from "lucide-react";
import type { User as UserProps } from "../../../types/auth.types";

type Message = {
  id: string;
  chatId: string;
  message: string;
  userId: string | undefined;
  user: {
    name: string | undefined;
    profile: string | undefined;
    role: string | undefined;
  };
  createdAt: string;
  optimistic?: boolean;
  isRead?: boolean;
};

type MessageBoxProps = {
  msg: Message;
  user: UserProps | null;
  idx: number;
  sortedMessages: Message[];
};

const MessageBox = ({ msg, user, idx, sortedMessages }: MessageBoxProps) => {
  const prev = idx > 0 ? sortedMessages[idx - 1] : null;
  const showDayDivider =
    idx === 0 || !isSameDay(parseISO(msg.createdAt), parseISO(prev!.createdAt));

  const getDayLabel = (iso: string) => {
    const d = parseISO(iso);
    if (isToday(d)) return "Hari ini";
    if (isYesterday(d)) return "Kemarin";
    return format(d, "dd MMM yyyy", { locale: id });
  };

  const getStatusText = () => {
    if (msg.userId !== user?.id) return null;

    if (msg.optimistic) {
      return (
        <span className="text-[10px] text-gray-400 dark:text-gray-500">
          Mengirim...
        </span>
      );
    }

    if (msg.isRead) {
      return (
        <span className="text-[10px] text-gray-500 dark:text-gray-400">
          Dibaca
        </span>
      );
    }

    return (
      <span className="text-[10px] text-gray-400 dark:text-gray-500">
        Belum dibaca
      </span>
    );
  };

  return (
    <>
      {showDayDivider && (
        <div className="flex justify-center py-2">
          <span className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {getDayLabel(msg.createdAt)}
          </span>
        </div>
      )}

      <div
        className={`flex ${
          msg.userId === user?.id ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`flex ${
            msg.userId === user?.id ? "flex-row-reverse" : "flex-row"
          } items-start gap-2 max-w-[85%] sm:max-w-[70%]`}
        >
          <div className="flex-shrink-0">
            {msg.user.profile ? (
              <img
                src={msg.user.profile}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <UserIcon />
            )}
          </div>

          <div>
            <div
              className={`rounded-lg p-3 ${
                msg.userId === user?.id
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
              }`}
            >
              <p className="text-xs font-medium mb-1 opacity-80">
                {msg.user.name}
              </p>
              <p className="text-sm whitespace-pre-wrap break-all">
                {msg.message}
              </p>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1 flex items-center gap-1">
              {format(parseISO(msg.createdAt), "HH:mm")}
              {getStatusText()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageBox;
