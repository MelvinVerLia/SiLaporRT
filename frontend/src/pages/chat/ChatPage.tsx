import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Send,
  User,
  MapPin,
  ChevronLeft,
  FileText,
  Camera,
  X,
} from "lucide-react";
import { useAuthContext } from "../../contexts/AuthContext";
import { Report } from "../../types/report.types";
import { Role } from "../../types/auth.types";
import Button from "../../components/ui/Button";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { getUserReports } from "../../services/reportService";
import { adminListReports } from "../../services/reportAdminService";
import { getMessages, startChat, getChatId } from "../../services/chatService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { socket } from "../../utils/socket";
import MessageBox from "./components/MessageBox";
import MessageBoxSkeleton from "./components/MessageBoxSkeleton";
import ReportBoxSkeleton from "./components/ReportBoxSkeleton";
import ReportBox from "./components/ReportBox";
import TextBoxSkeleton from "./components/TextBoxSkeleton";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import CloudinaryUpload, {
  CloudinaryUploadRef,
} from "../../components/upload/CloudinaryUpload";
import AttachmentViewer from "../../components/ui/AttachmentViewer";
import { CloudinaryFile } from "../../types/announcement.types";
import { classifyFile } from "../../utils/classifyFile";

type Attachment = {
  id: string;
  filename: string;
  url: string;
  fileType: "image" | "video" | "audio" | "document";
  provider?: "cloudinary";
  publicId?: string;
  resourceType?: string;
  format?: string;
  bytes?: number;
  createdAt: string;
};

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
  attachments?: Attachment[];
};

type ReportWithUnread = Report & {
  unreadCount: number;
  hasChat?: boolean;
  lastMessageAt?: string | null;
};

const ChatPage: React.FC = () => {
  const { user } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reports, setReports] = useState<ReportWithUnread[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"ongoing" | "history">("ongoing");
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingStartChat, setIsLoadingStartChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat" | "detail">(
    "list",
  );
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const typingIndicatorTimeoutRef = useRef<number | null>(null);
  const selectedReportRef = useRef<Report | null>(null);
  const uploadRef = useRef<CloudinaryUploadRef>(null);
  const hasAutoSelectedRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    selectedReportRef.current = selectedReport;
  }, [selectedReport]);

  const {
    data: chatData,
    isLoading: isLoadingChat,
    isFetching: isFetchingChat,
    refetch: refetchChat,
  } = useQuery({
    queryKey: ["chat", selectedReport?.id],
    queryFn: () => getChatId(selectedReport?.id || ""),
    enabled: !!selectedReport,
  });

  const ChatId = chatData?.data?.id ?? "";

  useEffect(() => {
    if (!ChatId) return;

    const reportId = selectedReport?.id;

    if (!reportId) return;

    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const response = await getMessages(reportId);
        // Clear and set messages in one operation to avoid flash
        setMessages(response.data);

        response.data.forEach((msg: Message) => {
          if (msg.userId !== user?.id) {
            socket.emit("message_read", {
              messageId: msg.id,
              chatId: ChatId,
            });
          }
        });

        queryClient.invalidateQueries({ queryKey: ["chatHasUnread"] });
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [ChatId, selectedReport?.id, user?.id, queryClient]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const el = messagesContainerRef.current;
    if (!el) return;

    // Use requestAnimationFrame for smoother, no-blink scrolling
    requestAnimationFrame(() => {
      el.scrollTo({
        top: el.scrollHeight,
        behavior,
      });
    });
  }, []);

  const scrollToBottomWithImageWait = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;

    // Wait for all images to load before scrolling
    const images = el.querySelectorAll("img");
    if (images.length === 0) {
      scrollToBottom("auto");
      return;
    }

    let loadedCount = 0;
    const totalImages = images.length;
    let scrolled = false;

    const checkAndScroll = () => {
      if (scrolled) return;
      loadedCount++;
      if (loadedCount === totalImages) {
        scrolled = true;
        scrollToBottom("auto");
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        checkAndScroll();
      } else {
        img.addEventListener("load", checkAndScroll);
        img.addEventListener("error", checkAndScroll);
      }
    });

    // Fallback: scroll after 300ms even if images haven't loaded
    setTimeout(() => {
      if (!scrolled) {
        scrolled = true;
        scrollToBottom("auto");
      }
    }, 300);
  }, [scrollToBottom]);

  // Only scroll when message count changes, not on property updates (like isRead)
  useEffect(() => {
    if (messages.length > 0) {
      // Use the image-aware scroll on initial load
      if (isLoadingMessages) return;
      scrollToBottomWithImageWait();
    }
  }, [messages.length, isLoadingMessages, scrollToBottomWithImageWait]);

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
              const hasUser = report.user;
              const isCitizen = report.user?.role === Role.CITIZEN;
              const sameRT = report.user?.rtId === user.rtId;
              const validStatus =
                report.status === "IN_PROGRESS" || report.status === "RESOLVED";

              return hasUser && isCitizen && user.rtId && sameRT && validStatus;
            })
            .sort(
              (a: Report, b: Report) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            );

          console.log({ filteredReports });
          setReports(filteredReports);
        } else {
          const response = await getUserReports({
            pageSize: 100,
            sortBy: "createdAt",
          });

          const allReports = response.items || response.reports || [];

          const filteredReports = allReports.filter((report: Report) => {
            const isValidStatus =
              report.status === "IN_PROGRESS" || report.status === "RESOLVED";
            return isValidStatus;
          });
          console.log({ filteredReports });
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

  // Auto-select report if reportId is passed via navigation state
  useEffect(() => {
    const state = location.state as { reportId?: string } | null;
    if (state?.reportId && reports.length > 0 && !hasAutoSelectedRef.current) {
      const report = reports.find((r) => r.id === state.reportId);
      if (report) {
        setActiveTab(report.status === "RESOLVED" ? "history" : "ongoing");
        setSelectedReport(report);
        setMobileView("chat");
        hasAutoSelectedRef.current = true;
        // Clear the state after using it
        navigate(location.pathname, { replace: true, state: {} });
      }
    }

    // Reset the ref when component unmounts so it works on re-navigation
    return () => {
      hasAutoSelectedRef.current = false;
    };
  }, [location.state, reports, location.pathname, navigate]);

  useEffect(() => {
    socket.connect();
    console.log("socket connected");

    // Listen for real-time message notifications to update the report list
    const handleNewMessageNotification = (data: {
      reportId: string;
      chatId: string;
      lastMessageAt: string;
      senderId: string;
      senderName: string;
      isSender: boolean;
    }) => {
      setReports((prev) =>
        prev.map((r) =>
          r.id === data.reportId
            ? {
                ...r,
                lastMessageAt: data.lastMessageAt,
                hasChat: true,
                unreadCount:
                  data.isSender ||
                  selectedReportRef.current?.id === data.reportId
                    ? r.unreadCount
                    : r.unreadCount + 1,
              }
            : r,
        ),
      );
    };

    socket.on("new_message_notification", handleNewMessageNotification);

    return () => {
      socket.off("new_message_notification", handleNewMessageNotification);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!ChatId) return;

    socket.emit("join_room", ChatId);

    const handleReceiveMessage = (tempId: string, payload: Message) => {
      // Clear typing indicator immediately when message is received
      if (payload.userId !== user?.id) {
        if (typingIndicatorTimeoutRef.current) {
          clearTimeout(typingIndicatorTimeoutRef.current);
          typingIndicatorTimeoutRef.current = null;
        }
        setIsTyping(false);
      }

      setMessages((prev) => {
        if (tempId) {
          const exists = prev.some((m) => m.id === tempId);
          if (exists) {
            const realMessage = { ...payload, optimistic: false };
            return prev.map((m) => (m.id === tempId ? realMessage : m));
          }
        }

        if (payload.userId !== user?.id) {
          socket.emit("message_read", {
            messageId: payload.id,
            chatId: ChatId,
          });
          queryClient.invalidateQueries({ queryKey: ["chatHasUnread"] });
        }

        return [...prev, payload];
      });
    };

    const handleMessageRead = (data: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === data.messageId ? { ...m, isRead: true } : m)),
      );
    };

    const handleUserTyping = (data: { userId: string }) => {
      if (data.userId !== user?.id) {
        if (typingIndicatorTimeoutRef.current) {
          clearTimeout(typingIndicatorTimeoutRef.current);
        }
        setIsTyping(true);
        typingIndicatorTimeoutRef.current = window.setTimeout(() => {
          setIsTyping(false);
          typingIndicatorTimeoutRef.current = null;
        }, 3000);
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_read", handleMessageRead);
    socket.on("user_typing", handleUserTyping);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_read", handleMessageRead);
      socket.off("user_typing", handleUserTyping);
      socket.emit("leave_room", ChatId);
    };
  }, [ChatId, user?.id, queryClient]);

  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit("typing", { chatId: ChatId, userId: user?.id });

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { chatId: ChatId, userId: user?.id });
    }, 1000);
  };

  const handleAttachmentUploaded = (files: CloudinaryFile[]) => {
    const mapped = files.map((f) => {
      const baseName = f.original_filename || "file";
      const ext = f.format ? `.${f.format}` : "";
      const filename = baseName.endsWith(ext) ? baseName : `${baseName}${ext}`;
      return {
        id: f.public_id,
        filename,
        url: f.secure_url,
        fileType: classifyFile(f),
        provider: "cloudinary" as const,
        publicId: f.public_id,
        resourceType: f.resource_type,
        format: f.format,
        bytes: f.bytes,
        createdAt: new Date().toISOString(),
      };
    });
    setAttachments((prev) => [...prev, ...mapped]);
  };

  const handleAttachmentRemove = (identifier: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== identifier));
  };

  const sendMessage = () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      socket.emit("stop_typing", { chatId: ChatId, userId: user?.id });
    }

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
      optimistic: true,
      isRead: false,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    console.log(optimisticMessage);

    setMessages((prev) => [...prev, optimisticMessage]);

    socket.emit("send_message", {
      tempId,
      optimisticMessage,
    });

    setNewMessage("");
    setAttachments([]);
  };

  const handleStartChat = async (reportId: string) => {
    if (!selectedReport) return;

    try {
      setIsLoadingStartChat(true);
      await startChat(reportId || "");
      await refetchChat();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingStartChat(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNavigateToReportDetail = () => {
    if (!selectedReport) return;
    const basePath =
      user?.role === Role.RT_ADMIN ? "/admin/reports" : "/reports";
    navigate(`${basePath}/${selectedReport.id}`, {
      state: {
        from: "chat",
        reportId: selectedReport.id,
      },
    });
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Reports List - Hidden on mobile when chat/detail is active */}
            <div
              className={`lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[80vh] ${
                mobileView !== "list" ? "hidden lg:flex" : ""
              }`}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {user?.role === Role.RT_ADMIN
                    ? "Laporan yang Ditangani"
                    : "Laporan Saya"}
                </h2>
                <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                  <button
                    onClick={() => {
                      setActiveTab("ongoing");
                      setSelectedReport(null);
                    }}
                    className={`flex-1 text-sm font-medium py-1.5 px-3 rounded-md transition-colors ${
                      activeTab === "ongoing"
                        ? "bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    On Going (
                    {reports.filter((r) => r.status === "IN_PROGRESS").length})
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("history");
                      setSelectedReport(null);
                    }}
                    className={`flex-1 text-sm font-medium py-1.5 px-3 rounded-md transition-colors ${
                      activeTab === "history"
                        ? "bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    History (
                    {
                      reports.filter(
                        (r) => r.status === "RESOLVED" && r.hasChat,
                      ).length
                    }
                    )
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                {isLoading ? (
                  <ReportBoxSkeleton />
                ) : reports.filter((r) =>
                    activeTab === "ongoing"
                      ? r.status === "IN_PROGRESS"
                      : r.status === "RESOLVED" && r.hasChat,
                  ).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <div className="text-gray-400 dark:text-gray-500 mb-2">
                      <User className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {activeTab === "ongoing"
                        ? "Tidak ada laporan yang sedang ditangani"
                        : "Belum ada riwayat laporan"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {reports
                      .filter((report) =>
                        activeTab === "ongoing"
                          ? report.status === "IN_PROGRESS"
                          : report.status === "RESOLVED" && report.hasChat,
                      )
                      .sort((a, b) => {
                        const aTime = a.lastMessageAt
                          ? new Date(a.lastMessageAt).getTime()
                          : 0;
                        const bTime = b.lastMessageAt
                          ? new Date(b.lastMessageAt).getTime()
                          : 0;
                        return bTime - aTime;
                      })
                      .map((report) => (
                        <div
                          key={report.id}
                          onClick={() => {
                            setSelectedReport(report);
                            setMobileView("chat");
                            setReports((prev) =>
                              prev.map((r) =>
                                r.id === report.id
                                  ? { ...r, unreadCount: 0 }
                                  : r,
                              ),
                            );
                          }}
                        >
                          <ReportBox
                            user={user}
                            report={report}
                            selectedReport={selectedReport}
                            setSelectedReport={setSelectedReport}
                          />
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Panel - Hidden on mobile when list is active */}
            <div
              className={`lg:col-span-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[80vh] ${
                mobileView !== "chat" ? "hidden lg:flex" : ""
              }`}
            >
              {/* Mobile Header with Back Button */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <button
                  onClick={() => setMobileView("list")}
                  className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {selectedReport ? selectedReport.title : "Chat"}
                  </h2>
                </div>
                <button
                  onClick={() => setMobileView("detail")}
                  className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <FileText className="h-5 w-5" />
                </button>
              </div>

              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
              >
                {!selectedReport ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400">
                      Pilih laporan untuk memulai chat
                    </p>
                  </div>
                ) : isLoadingMessages ? (
                  <MessageBoxSkeleton />
                ) : isLoadingChat ? (
                  <MessageBoxSkeleton />
                ) : !ChatId ? (
                  <div className="flex items-center justify-center h-full">
                    {selectedReport.status === "RESOLVED" ? (
                      <p className="text-gray-500 dark:text-gray-400">
                        Tidak ada riwayat chat untuk laporan ini
                      </p>
                    ) : isLoadingStartChat ? (
                      <div>
                        <LoadingSpinner />
                      </div>
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400">
                        <Button
                          onClick={() => handleStartChat(selectedReport.id)}
                          variant="primary"
                          size="sm"
                          disabled={isLoadingStartChat || isFetchingChat}
                        >
                          Start Chat
                        </Button>
                      </div>
                    )}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <p className="text-gray-700 dark:text-gray-200 font-medium">
                      Belum ada pesan
                    </p>
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

                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="flex items-start gap-2 max-w-[85%] sm:max-w-[70%]">
                          <div className="flex-shrink-0">
                            <User className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                            <div className="flex gap-1">
                              <span
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0ms" }}
                              ></span>
                              <span
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "150ms" }}
                              ></span>
                              <span
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "300ms" }}
                              ></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {isLoadingChat || isLoadingMessages ? (
                <TextBoxSkeleton />
              ) : ChatId && selectedReport?.status !== "RESOLVED" ? (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  {/* Attachment Preview */}
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {attachments.map((attachment) => (
                        <div key={attachment.id} className="relative group">
                          <img
                            src={attachment.url}
                            alt={attachment.filename}
                            className="h-16 w-16 object-cover rounded"
                          />
                          <button
                            onClick={() =>
                              handleAttachmentRemove(attachment.id)
                            }
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Hidden CloudinaryUpload for file handling */}
                  <div className="hidden">
                    <CloudinaryUpload
                      ref={uploadRef}
                      folder="reports"
                      multiple
                      accept="image/jpeg,image/png,image/jpg"
                      maxFiles={3}
                      attachments={attachments}
                      onUploaded={handleAttachmentUploaded}
                      onRemove={handleAttachmentRemove}
                      onUploadingChange={setIsUploading}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => uploadRef.current?.openFileDialog()}
                      className="px-3 h-10 flex items-center justify-center"
                      title="Tambah Lampiran"
                      disabled={attachments.length >= 3 || isUploading}
                    >
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                    <textarea
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyDown={handleKeyPress}
                      placeholder="Ketik pesan..."
                      rows={1}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white resize-none"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={
                        (newMessage.trim() === "" &&
                          attachments.length === 0) ||
                        isUploading
                      }
                      className="px-3 h-10 flex items-center justify-center"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : ChatId && selectedReport?.status === "RESOLVED" ? (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                  <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                    Laporan sudah selesai. Chat tidak dapat dilanjutkan.
                  </p>
                </div>
              ) : null}
            </div>

            {/* Detail Panel - Show as modal on mobile */}
            <div
              className={`lg:col-span-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[80vh] ${
                mobileView !== "detail" ? "hidden lg:flex" : ""
              }`}
            >
              {/* Mobile Header with Back Button */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <button
                  onClick={() => setMobileView("chat")}
                  className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="font-semibold text-gray-900 dark:text-white flex-1">
                  Detail Laporan
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                {!selectedReport ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400">
                      Pilih laporan untuk melihat detail
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Report Header */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedReport.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {selectedReport.description}
                      </p>
                    </div>

                    <div className="pt-2">
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
                          <AttachmentViewer
                            attachments={selectedReport.attachments.map(
                              (attachment) => ({
                                id: attachment.id,
                                filename: attachment.filename,
                                url: attachment.url,
                                fileType: attachment.fileType as
                                  | "image"
                                  | "video"
                                  | "audio"
                                  | "document",
                                format: attachment.filename
                                  .split(".")
                                  .pop()
                                  ?.toLowerCase(),
                              }),
                            )}
                            title="Lampiran"
                            gridCols={2}
                          />
                        </div>
                      )}

                    {/* Link to full detail */}
                    <div className="pt-2">
                      <button
                        onClick={handleNavigateToReportDetail}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline cursor-pointer hover:text-primary-700 dark:hover:text-primary-300"
                      >
                        Lihat detail selengkapnya
                      </button>
                    </div>

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
                          <div className="flex justify-between gap-2">
                            <span className="flex-shrink-0">Pelapor:</span>
                            <span className="text-right truncate">
                              {selectedReport.user.name}
                            </span>
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
