import React, { useState, useEffect, useRef } from "react";
import { Send, User, MapPin } from "lucide-react";
import { useAuthContext } from "../../contexts/AuthContext";
import { Report } from "../../types/report.types";
import { Role } from "../../types/auth.types";
import Button from "../../components/ui/Button";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { getUserReports } from "../../services/reportService";
import { adminListReports } from "../../services/reportAdminService";

// Dummy chat messages
interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderProfile?: string;
  message: string;
  timestamp: Date;
  isAdmin: boolean;
}

const ChatPage: React.FC = () => {
  const { user } = useAuthContext();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize dummy messages based on user role
  useEffect(() => {
    if (user) {
      const dummyMessages: ChatMessage[] = [
        {
          id: "1",
          senderId: user.role === Role.CITIZEN ? (user.id || '') : "other-user",
          senderName: "Warga",
          message: "Halo, saya ingin melaporkan tentang lampu jalan yang mati",
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          isAdmin: false,
        },
        {
          id: "2",
          senderId: user.role === Role.RT_ADMIN ? (user.id || '') : "admin-user",
          senderName: "Admin RT",
          message: "Baik, terima kasih laporannya. Saya akan segera menindaklanjuti",
          timestamp: new Date(Date.now() - 1000 * 60 * 25),
          isAdmin: true,
        },
        {
          id: "3",
          senderId: user.role === Role.CITIZEN ? (user.id || '') : "other-user",
          senderName: "Warga",
          message: "Terima kasih pak",
          timestamp: new Date(Date.now() - 1000 * 60 * 20),
          isAdmin: false,
        },
        {
          id: "4",
          senderId: user.role === Role.RT_ADMIN ? (user.id || '') : "admin-user",
          senderName: "Admin RT",
          message: "Sudah saya koordinasikan dengan pihak terkait. Mohon menunggu ya",
          timestamp: new Date(Date.now() - 1000 * 60 * 10),
          isAdmin: true,
        },
      ];
      setMessages(dummyMessages);
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch reports based on user role
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        
        if (user?.role === Role.RT_ADMIN) {
          // Admin: Get all reports without status filter first
          const response = await adminListReports({
            pageSize: 100,
            sortBy: "createdAt",
            sortOrder: "desc",
          });
          
          // Use items instead of reports based on the actual API response structure
          const allReports = response.items || response.reports || [];
          
          // Filter: IN_PROGRESS or PENDING status, CITIZEN users with same rtId
          const filteredReports = allReports.filter(
            (report: Report) => {
              const hasUser = !!report.user;
              const isCitizen = report.user?.role === Role.CITIZEN;
              const sameRT = report.user?.rtId === user.rtId;
              const validStatus = report.status === "IN_PROGRESS" || report.status === "PENDING";
              
              return hasUser && isCitizen && user.rtId && sameRT && validStatus;
            }
          ).sort((a: Report, b: Report) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          setReports(filteredReports);
          
          // Auto-select first report if available
          if (filteredReports.length > 0 && !selectedReport) {
            setSelectedReport(filteredReports[0]);
          }
        } else {
          // Citizen: Get their own reports
          const response = await getUserReports({
            pageSize: 100,
            sortBy: "createdAt",
          });
          
          // Use items instead of reports based on the actual API response structure
          const allReports = response.items || response.reports || [];
          
          // Filter only IN_PROGRESS and PENDING reports
          const filteredReports = allReports.filter(
            (report: Report) => {
              const isValidStatus = report.status === "IN_PROGRESS" || report.status === "PENDING";
              return isValidStatus;
            }
          );
          
          setReports(filteredReports);
          
          // Auto-select first report if available
          if (filteredReports.length > 0 && !selectedReport) {
            setSelectedReport(filteredReports[0]);
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: user?.id || "",
      senderName: user?.name || "User",
      senderProfile: user?.profile,
      message: newMessage,
      timestamp: new Date(),
      isAdmin: user?.role === Role.RT_ADMIN,
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">
          Chat Laporan
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {user?.role === Role.RT_ADMIN 
            ? "Chat dengan warga untuk laporan yang ditangani" 
            : "Chat dengan admin untuk laporan Anda"}
        </p>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-250px)]" style={{ minHeight: '600px' }}>
          {/* Left Panel - Report List */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {user?.role === Role.RT_ADMIN ? "Laporan yang Ditangani" : "Laporan Saya"}
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

          {/* Center Panel - Chat */}
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
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {!selectedReport ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 dark:text-gray-400">
                    Pilih laporan untuk memulai chat
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.senderId === user?.id ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex ${
                          msg.senderId === user?.id ? "flex-row-reverse" : "flex-row"
                        } items-start gap-2 max-w-[70%]`}
                      >
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                          {msg.senderProfile ? (
                            <img
                              src={msg.senderProfile}
                              alt={msg.senderName}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              msg.isAdmin
                                ? "bg-primary-600 text-white"
                                : "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                            }`}>
                              <User className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        
                        {/* Message Bubble */}
                        <div>
                          <div
                            className={`rounded-lg p-3 ${
                              msg.senderId === user?.id
                                ? "bg-primary-600 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                            }`}
                          >
                            <p className="text-xs font-medium mb-1 opacity-80">
                              {msg.senderName}
                            </p>
                            <p className="text-sm">{msg.message}</p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
                            {formatDistanceToNow(msg.timestamp, {
                              addSuffix: true,
                              locale: id,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            {selectedReport && (
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
                    onClick={handleSendMessage}
                    disabled={newMessage.trim() === ""}
                    className="px-3 h-10 flex items-center justify-center"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Report Details */}
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
                  {/* Title */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedReport.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedReport.description}
                    </p>
                  </div>

                  {/* Location */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Lokasi
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedReport.location.address}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      RT {selectedReport.location.rt} / RW {selectedReport.location.rw}
                    </p>
                  </div>

                  {/* Attachments */}
                  {selectedReport.attachments && selectedReport.attachments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Lampiran ({selectedReport.attachments.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedReport.attachments.map((attachment) => (
                          <div key={attachment.id} className="relative aspect-square rounded-lg overflow-hidden">
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

                  {/* Metadata */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Dibuat:</span>
                        <span>
                          {formatDistanceToNow(new Date(selectedReport.createdAt), {
                            addSuffix: true,
                            locale: id,
                          })}
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
