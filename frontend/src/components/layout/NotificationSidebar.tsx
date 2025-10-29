import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, FileText, Paperclip } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import { Notification } from "../../types/notification.types";
import { cn } from "../../utils/cn";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  unreadNotifications: Notification[];
  readNotifications: Notification[];
  notificationCount: number;
  unreadNotificationCount: number;
  readNotificationCount: number;
  onNotificationClick: (notification: Notification) => void;
}

export default function NotificationSidebar({
  isOpen,
  onClose,
  notifications,
  unreadNotifications,
  readNotifications,
  notificationCount,
  unreadNotificationCount,
  readNotificationCount,
  onNotificationClick,
}: Props) {
  const [tabvalue, setTabValue] = useState("unread");

  useEffect(() => {
    const isMobileOrTablet = window.innerWidth <= 1024;

    if (isOpen && isMobileOrTablet) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case "REPORT":
        return tabvalue === "unread" ? (
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600">
            <FileText className="w-6 h-6" />
          </div>
        ) : tabvalue === "read" ? (
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600">
            <FileText className="w-6 h-6" />
          </div>
        ) : (
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 text-gray-600">
            <FileText className="w-6 h-6" />
          </div>
        );
      case "ANNOUNCEMENT":
        return tabvalue === "unread" ? (
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600">
            <Paperclip className="w-6 h-6" />
          </div>
        ) : tabvalue === "read" ? (
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600">
            <Paperclip className="w-6 h-6" />
          </div>
        ) : (
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 text-gray-600">
            <Paperclip className="w-6 h-6" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed top-0 right-0 h-full sm:w-[600px] w-full bg-white shadow-2xl z-50 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            <div className="p-4 border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">
                {tabvalue === "unread"
                  ? "Belum Dibaca "
                  : tabvalue === "read"
                  ? "Dibaca "
                  : "Semua "}
              </h2>
              <button
                className="p-1 hover:bg-gray-100 rounded-full hover:cursor-pointer"
                onClick={onClose}
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <Tabs
              defaultValue="unread"
              onValueChange={setTabValue}
              className="flex flex-col flex-1 px-4"
            >
              <TabsList>
                <TabsTrigger value="unread">
                  Belum Dibaca
                  <span className="ml-2 text-xs bg-primary-100 text-primary-700 rounded-full px-2 py-0.5">
                    {unreadNotificationCount}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="read">
                  Dibaca
                  <span className="ml-2 text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5">
                    {readNotificationCount}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="all">
                  Semua
                  <span className="ml-2 text-xs bg-gray-200 text-gray-800 rounded-full px-2 py-0.5">
                    {notificationCount}
                  </span>
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto py-2 bg-gray-50">
                <TabsContent value="all">
                  <div className="flex flex-col gap-2 overflow-y-auto max-h-[75vh] sm:max-h-[80vh]">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={cn(
                            `py-4 cursor-pointer transition-colors ${
                              n.isRead === true
                                ? "bg-gray-300 text-gray-300"
                                : "bg-white hover:bg-gray-100"
                            }  flex items-center rounded-xl`
                          )}
                          onClick={() => onNotificationClick(n)}
                        >
                          <div className="mx-4">
                            {renderCategoryIcon(n.category)}
                          </div>
                          <div className="">
                            <p className="text-sm font-medium text-gray-800">
                              {n.title}
                            </p>
                            <p>
                              <span className="text-xs text-gray-500 line-clamp-2">
                                {n.body}
                              </span>
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(n.createdAt), {
                                addSuffix: true,
                                locale: id,
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        Tidak ada pemberitahuan
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="unread">
                  <div className="flex flex-col gap-2 overflow-y-auto max-h-[75vh] sm:max-h-[80vh]">
                    {unreadNotifications.length > 0 ? (
                      unreadNotifications.map((n) => (
                        <div
                          key={n.id}
                          className="py-4 cursor-pointer transition-colors hover:bg-gray-100 flex items-center rounded-xl"
                          onClick={() => onNotificationClick(n)}
                        >
                          <div className="mx-4">
                            {renderCategoryIcon(n.category)}
                          </div>
                          <div className="">
                            <p className="text-sm font-medium text-gray-800">
                              {n.title}
                            </p>
                            <p>
                              <span className="text-xs text-gray-500 line-clamp-2">
                                {n.body}
                              </span>
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(n.createdAt), {
                                addSuffix: true,
                                locale: id,
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        Tidak ada pemberitahuan
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="read">
                  <div className="flex flex-col gap-2 overflow-y-auto max-h-[75vh] sm:max-h-[80vh]">
                    {readNotifications.length > 0 ? (
                      readNotifications.map((n) => (
                        <div
                          key={n.id}
                          className="py-4 cursor-pointer transition-colors hover:bg-gray-100 flex items-center rounded-xl"
                          onClick={() => onNotificationClick(n)}
                        >
                          <div className="mx-4">
                            {renderCategoryIcon(n.category)}
                          </div>
                          <div className="">
                            <p className="text-sm font-medium text-gray-800">
                              {n.title}
                            </p>
                            <p>
                              <span className="text-xs text-gray-500 line-clamp-2">
                                {n.body}
                              </span>
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(n.createdAt), {
                                addSuffix: true,
                                locale: id,
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        Tidak ada pemberitahuan
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
