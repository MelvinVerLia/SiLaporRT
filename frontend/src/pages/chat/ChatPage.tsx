import React, { useState, useEffect, useRef, useMemo } from "react";
import { Send, User, MapPin } from "lucide-react";
import { useAuthContext } from "../../contexts/AuthContext";
import { Report } from "../../types/report.types";
import { Role } from "../../types/auth.types";
import Button from "../../components/ui/Button";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { getUserReports } from "../../services/reportService";
import { adminListReports } from "../../services/reportAdminService";
import { getMessages, startChat, getChatId } from "../../services/chatService";
import { useQuery } from "@tanstack/react-query";
import { socket } from "../../utils/socket";
import MessageBox from "./components/MessageBox";

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
};

const ChatPage: React.FC = () => {
  const { user } = useAuthContext();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { data: chatData } = useQuery({
    queryKey: ["chat", selectedReport?.id],
    queryFn: () => getChatId(selectedReport?.id || ""),
    enabled: !!selectedReport,
  });

  const ChatId = chatData?.data?.id ?? "";

  useEffect(() => {
    if (!ChatId) return;
    setMessages([]);
    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const response = await getMessages(selectedReport!.id);
        setMessages(response.data);
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [ChatId, selectedReport]);

  const scrollToBottom = () => {
    const el = messagesContainerRef.current;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: "auto",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [messages]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);

        if (user?.role === Role.RT_ADMIN) {
          const response = await adminListReports({
            pageSize: 100,
            sortBy: "createdAt",
            sortOrder: "desc",
          });

          const allReports = response.items || response.reports || [];

          const filteredReports = allReports
            .filter((report: Report) => {
              const hasUser = !!report.user;
              const isCitizen = report.user?.role === Role.CITIZEN;
              const sameRT = report.user?.rtId === user.rtId;
              const validStatus =
                report.status === "IN_PROGRESS" || report.status === "PENDING";

              return hasUser && isCitizen && user.rtId && sameRT && validStatus;
            })
            .sort(
              (a: Report, b: Report) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            );

          setReports(filteredReports);
        } else {
          const response = await getUserReports({
            pageSize: 100,
            sortBy: "createdAt",
          });

          const allReports = response.items || response.reports || [];

          const filteredReports = allReports.filter((report: Report) => {
            const isValidStatus =
              report.status === "IN_PROGRESS" || report.status === "PENDING";
            return isValidStatus;
          });

          setReports(filteredReports);
        }
      } catch (error) {
        console.error("❌ Error fetching reports:", error);
        setReports([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchReports();
    }
  }, [user]);

  useEffect(() => {
    console.log("socket connecting");
    socket.connect();
    console.log("socket connected");

    if (!ChatId) return;

    setMessages([]);
    socket.emit("join_room", ChatId);

    socket.on("receive_message", (tempId, payload) => {
      setMessages((prev) => {
        if (tempId) {
          const exists = prev.some((m) => m.id === tempId);

          if (exists) {
            return prev.map((m) => (m.id === tempId ? { ...payload } : m));
          }
        }

        return [...prev, payload];
      });
    });

    return () => {
      socket.off("receive_message");
      socket.emit("leave_room", ChatId);
    };
  }, [ChatId]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const tempId = `temp-${crypto.randomUUID()}`;

    const optimisticMessage: Message = {
      id: tempId,
      chatId: ChatId,
      message: newMessage,
      userId: user!.id,
      user: {
        name: user!.name,
        profile: user!.profile,
        role: user!.role,
      },
      createdAt: new Date().toISOString(),
    };

    console.log(optimisticMessage);

    setMessages((prev) => [...prev, optimisticMessage]);

    socket.emit("send_message", {
      tempId,
      optimisticMessage,
    });

    setNewMessage("");
  };

  const handleStartChat = async (reportId: string) => {
    if (!selectedReport) return;

    const response = await startChat(reportId || "");
    console.log(response);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">
          Chat Laporan
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {user?.role === Role.RT_ADMIN
            ? "Chat dengan warga untuk laporan yang ditangani"
            : "Chat dengan RT untuk laporan Anda"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12">
          <div
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-250px)]"
            style={{ minHeight: "600px" }}
          >
            <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {user?.role === Role.RT_ADMIN
                    ? "Laporan yang Ditangani"
                    : "Laporan Saya"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {reports.length} laporan
                </p>
              </div>
              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <div className="text-gray-400 dark:text-gray-500 mb-2">
                      <User className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {user?.role === Role.RT_ADMIN
                        ? "Belum ada laporan yang ditangani"
                        : "Anda belum membuat laporan"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        onClick={() => setSelectedReport(report)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          selectedReport?.id === report.id
                            ? "bg-primary-50 dark:bg-gray-700 border-l-4 border-primary-600"
                            : ""
                        }`}
                      >
                        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                          {report.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {report.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Chat
                </h2>
                {selectedReport && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedReport.title}
                  </p>
                )}
              </div>

              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {!selectedReport ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400">
                      Pilih laporan untuk memulai chat
                    </p>
                  </div>
                ) : isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : !ChatId ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500 dark:text-gray-400">
                      <Button
                        onClick={() => handleStartChat(selectedReport.id)}
                        variant="primary"
                        size="sm"
                      >
                        Start Chat
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {sortedMessages.map((msg: Message, idx: number) => (
                      <MessageBox
                        msg={msg}
                        user={user}
                        idx={idx}
                        sortedMessages={sortedMessages}
                      />
                    ))}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {ChatId && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ketik pesan..."
                      rows={1}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white resize-none"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={newMessage.trim() === ""}
                      className="px-3 h-10 flex items-center justify-center"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Detail Laporan
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {!selectedReport ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400">
                      Pilih laporan untuk melihat detail
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedReport.title}
                      </h3>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedReport.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Lokasi
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedReport.location.address}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        RT {selectedReport.location.rt} / RW{" "}
                        {selectedReport.location.rw}
                      </p>
                    </div>

                    {selectedReport.attachments &&
                      selectedReport.attachments.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Lampiran ({selectedReport.attachments.length})
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedReport.attachments.map((attachment) => (
                              <div
                                key={attachment.id}
                                className="relative aspect-square rounded-lg overflow-hidden"
                              >
                                {attachment.fileType === "image" ? (
                                  <img
                                    src={attachment.url}
                                    alt={attachment.filename}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      {attachment.fileType}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Dibuat:</span>
                          <span>
                            {formatDistanceToNow(
                              new Date(selectedReport.createdAt),
                              {
                                addSuffix: true,
                                locale: id,
                              },
                            )}
                          </span>
                        </div>
                        {!selectedReport.isAnonymous && selectedReport.user && (
                          <div className="flex justify-between">
                            <span>Pelapor:</span>
                            <span>{selectedReport.user.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
