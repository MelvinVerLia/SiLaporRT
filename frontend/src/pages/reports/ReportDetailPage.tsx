import React, { useState, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  Clock,
  User,
  ThumbsUp,
  MessageCircle,
  Send,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Textarea from "../../components/ui/Textarea";
import Breadcrumb from "../../components/ui/Breadcrumb";
import AttachmentViewer from "../../components/ui/AttachmentViewer";
import {
  getReportDetails,
  toggleUpvote,
  addComment,
  getUserUpvoteStatus,
} from "../../services/reportService";
import {
  updateReportStatus,
  addOfficialResponse,
} from "../../services/reportAdminService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Attachment,
  Response,
  ReportComment,
  Report,
} from "../../types/report.types";
import ReportDetailSkeleton from "./components/ReportDetailSkeleton";
import { useAuthContext } from "../../contexts/AuthContext";
import { Role } from "../../types/auth.types";
import {
  GoogleMap,
  Libraries,
  LoadScript,
  Marker,
} from "@react-google-maps/api";

const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthContext();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [adminResponseText, setAdminResponseText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const libraries: Libraries = ["places"];

  // Ref untuk mencegah spam clicking
  const lastUpvoteTime = useRef<number>(0);
  const UPVOTE_COOLDOWN = 500; // 500ms cooldown

  const isAdmin = user?.role === Role.RT_ADMIN;

  // Detect where user came from based on location state or current URL context
  const isFromAdmin =
    location.state?.from === "admin" ||
    location.pathname.includes("/admin") ||
    document.referrer.includes("/admin/reports");

  const isFromMyReports =
    location.state?.from === "my-reports" ||
    document.referrer.includes("/my-reports");

  const {
    data: report,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["report", id],
    queryFn: () => getReportDetails(id!),
  });

  // Get user's upvote status
  const { data: upvoteStatus } = useQuery({
    queryKey: ["upvote-status", id],
    queryFn: () => getUserUpvoteStatus(id!),
    enabled: !!id && isAuthenticated,
  });

  const hasUpvoted = upvoteStatus?.data?.result || false;

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { variant: "warning" as const, label: "Menunggu" },
      IN_PROGRESS: { variant: "info" as const, label: "Dalam Proses" },
      RESOLVED: { variant: "success" as const, label: "Selesai" },
      REJECTED: { variant: "danger" as const, label: "Ditolak" },
    };
    return variants[status as keyof typeof variants] || variants.PENDING;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      INFRASTRUCTURE: "Infrastruktur",
      LIGHTING: "Penerangan",
      CLEANLINESS: "Kebersihan",
      SECURITY: "Keamanan",
      UTILITIES: "Utilitas",
      ENVIRONMENT: "Lingkungan",
    };
    return labels[category as keyof typeof labels] || category;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleMapClick = () => {
    window.open(
      `https://www.google.com/maps?q=${report.location.latitude},${report.location.longitude}`,
      "_blank"
    );
  };

  const handleUpvote = useMutation({
    mutationKey: ["upvote", id], // Unique key to prevent duplicate mutations
    mutationFn: () => toggleUpvote(report!.id),
    onMutate: async () => {
      // Cancel outgoing refetches to prevent overwriting optimistic updates
      await queryClient.cancelQueries({ queryKey: ["report", id] });
      await queryClient.cancelQueries({ queryKey: ["upvote-status", id] });

      // Snapshot the previous values for rollback
      const previousReport = queryClient.getQueryData(["report", id]);
      const previousUpvoteStatus = queryClient.getQueryData([
        "upvote-status",
        id,
      ]);

      // Get CURRENT upvote status from fresh query data (not stale upvoteStatus variable)
      const currentUpvoteData = queryClient.getQueryData([
        "upvote-status",
        id,
      ]) as { data: { result: boolean } } | undefined;
      const currentHasUpvoted = currentUpvoteData?.data?.result || false;

      // Optimistically update the upvote status and count
      queryClient.setQueryData(["upvote-status", id], () => ({
        data: { result: !currentHasUpvoted },
      }));

      queryClient.setQueryData(["report", id], (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        const reportData = old as Report;
        return {
          ...reportData,
          upvoteCount: currentHasUpvoted
            ? reportData.upvoteCount - 1
            : reportData.upvoteCount + 1,
        };
      });

      return { previousReport, previousUpvoteStatus };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error (but not for cooldown errors)
      if (context?.previousReport) {
        queryClient.setQueryData(["report", id], context.previousReport);
      }
      if (context?.previousUpvoteStatus) {
        queryClient.setQueryData(
          ["upvote-status", id],
          context.previousUpvoteStatus
        );
      }
    },
    onSuccess: () => {
      // Sync with other queries immediately
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["recent-reports"] });
    },
    onSettled: () => {
      // Ensure data is fresh for next operations
      queryClient.invalidateQueries({
        queryKey: ["report", id],
        refetchType: "none",
      });
      queryClient.invalidateQueries({
        queryKey: ["upvote-status", id],
        refetchType: "none",
      });
    },
  });

  // Helper function untuk handle upvote dengan cooldown check
  const handleUpvoteClick = () => {
    const now = Date.now();

    // Check cooldown
    if (now - lastUpvoteTime.current < UPVOTE_COOLDOWN) {
      // Silently ignore rapid clicks - no error thrown to user
      return;
    }

    // Only proceed if not currently pending another upvote request
    if (!handleUpvote.isPending) {
      lastUpvoteTime.current = now; // Update timestamp on successful call
      handleUpvote.mutate();
    }
  };

  // const handleUpvote = () => {
  //   setHasUpvoted(!hasUpvoted);
  //   // In real app, call API to toggle upvote
  // };

  // Comment submission mutation
  const addCommentMutation = useMutation({
    mutationFn: (content: string) => addComment(report!.id, content),
    onSuccess: () => {
      // Invalidate all report-related queries to keep data in sync across all pages
      queryClient.invalidateQueries({ queryKey: ["report"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["recent-reports"] });
      setCommentText("");
    },
    onError: (error) => {
      console.error("Error adding comment:", error);
    },
  });

  // Admin mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ status, message }: { status: string; message?: string }) =>
      updateReportStatus(report!.id, status, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      setSelectedStatus("");
    },
    onError: (error) => {
      console.error("Error updating status:", error);
    },
  });

  const addResponseMutation = useMutation({
    mutationFn: (message: string) => addOfficialResponse(report!.id, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      setAdminResponseText("");
    },
    onError: (error) => {
      console.error("Error adding response:", error);
    },
  });

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    addCommentMutation.mutate(commentText);
  };

  const handleStatusChange = (status: string) => {
    if (status === selectedStatus) return;
    setSelectedStatus(status);

    // For certain status changes, we might want to require a message
    if (status === "REJECTED") {
      // For now, just update without message - could add modal for message later
      updateStatusMutation.mutate({ status });
    } else {
      updateStatusMutation.mutate({ status });
    }
  };

  const handleSubmitResponse = () => {
    if (!adminResponseText.trim()) return;
    addResponseMutation.mutate(adminResponseText);
  };

  if (isLoading) return <ReportDetailSkeleton />;

  if (isError || !report) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {!report ? "Laporan Tidak Ditemukan" : "Gagal Memuat Laporan"}
          </h3>
          <p className="text-gray-600 mb-6">
            {!report
              ? "Laporan yang Anda cari tidak ditemukan atau mungkin sudah dihapus."
              : "Terjadi kesalahan saat memuat detail laporan. Silakan coba lagi."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isError && (
              <Button
                variant="outline"
                onClick={() => refetch()}
                loading={isFetching}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Coba Lagi
              </Button>
            )}
            <Link to="/reports">
              <Button>Kembali ke Daftar Laporan</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }
  const statusInfo = getStatusBadge(report.status);

  // Dynamic breadcrumb based on where user came from
  const breadcrumbItems = isFromAdmin
    ? [
        { label: "Kelola Laporan", href: "/admin/reports" },
        { label: report.title },
      ]
    : isFromMyReports
    ? [{ label: "Laporan Saya", href: "/my-reports" }, { label: report.title }]
    : [{ label: "Laporan", href: "/reports" }, { label: report.title }];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Report Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="default">
                  {getCategoryLabel(report.category)}
                </Badge>
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                {report.isAnonymous && <Badge variant="default">Anonim</Badge>}
                {!report.isPublic && (
                  <Badge variant="default">
                    <EyeOff className="mr-1 h-3 w-3" />
                    Privat
                  </Badge>
                )}
              </div> */}

              <CardTitle className="text-2xl text-gray-900 mb-5 whitespace-pre-wrap break-words">
                {report.title}
              </CardTitle>

              <div className="rounded-md overflow-hidden border border-gray-200 h-96 mb-5">
                <LoadScript
                  googleMapsApiKey={import.meta.env.VITE_API_GOOGLE_MAP}
                  libraries={libraries}
                >
                  <GoogleMap
                    zoom={15}
                    center={{
                      lat: report.location.latitude,
                      lng: report.location.longitude,
                    }}
                    onClick={handleMapClick}
                    mapContainerClassName="w-full h-full"
                  >
                    <Marker
                      position={{
                        lat: report.location.latitude,
                        lng: report.location.longitude,
                      }}
                    />
                  </GoogleMap>
                </LoadScript>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600">
                {isAuthenticated && (
                  <div className="flex items-center">
                    <Button
                      variant={hasUpvoted ? "primary" : "outline"}
                      size="sm"
                      onClick={handleUpvoteClick}
                      className={`flex items-center transition-all duration-200 ${
                        hasUpvoted
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : ""
                      } ${
                        handleUpvote.isPending
                          ? "scale-95 opacity-75"
                          : "hover:scale-105"
                      }`}
                    >
                      <ThumbsUp
                        className={`mr-1 h-4 w-4 transition-all duration-200 ${
                          hasUpvoted ? "fill-current" : ""
                        } ${handleUpvote.isPending ? "animate-pulse" : ""}`}
                      />
                      {report.upvoteCount}
                    </Button>
                  </div>
                )}
                <div className="flex items-center">
                  <User className="mr-1 h-4 w-4" />
                  <span>
                    {report.isAnonymous
                      ? "Anonim"
                      : report.user?.isDeleted
                      ? "Pengguna Terhapus"
                      : report.user?.name}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>{formatDateTime(report.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Report Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Deskripsi Laporan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap break-words">
                {report.description
                  .split("\n")
                  .map((paragraph: string, index: number) => (
                    <p
                      key={index}
                      className="mb-4 text-gray-700 leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          {report.attachments.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <AttachmentViewer
                  attachments={report.attachments.map(
                    (attachment: Attachment) => ({
                      id: attachment.id,
                      filename: attachment.filename,
                      url: attachment.url,
                      fileType: attachment.fileType as
                        | "image"
                        | "video"
                        | "document",
                      format: attachment.filename
                        .split(".")
                        .pop()
                        ?.toLowerCase(),
                    })
                  )}
                  title="Lampiran"
                  gridCols={3}
                />
              </CardContent>
            </Card>
          )}

          {/* Official Responses */}
          {report.responseCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tanggapan Resmi RT</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.responses.map((response: Response) => (
                    <div
                      key={response.id}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                            {response.responder.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {response.responder.name}
                            </p>
                            <p className="text-sm text-gray-600">Admin RT</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDateTime(response.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 ml-11">{response.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <MessageCircle className="mx-1 h-7 w-7" />
                  <CardTitle>Diskusi & Komentar</CardTitle>
                </div>
                <div className="flex items-center text-xl font-bold">
                  <span>{report.commentCount}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Comment Form */}
              {isAuthenticated ? (
                <div className="mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center overflow-hidden justify-center text-sm font-medium text-gray-600">
                        {user!.profile ? (
                          <img src={user!.profile} alt={user!.name.charAt(0)} />
                        ) : (
                          user!.name.charAt(0)
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Tulis komentar Anda..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        limit={250}
                        showCounter
                        rows={3}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmitComment();
                          }
                        }}
                      />
                      <div className="flex justify-end mt-2">
                        <Button
                          size="sm"
                          onClick={handleSubmitComment}
                          disabled={
                            !commentText.trim() || addCommentMutation.isPending
                          }
                          loading={addCommentMutation.isPending}
                        >
                          <Send className="mr-1 h-4 w-4" />
                          Kirim
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-600 mb-2">
                    Silakan masuk untuk bergabung dalam diskusi
                  </p>
                  <Link to="/login">
                    <Button size="sm">Masuk</Button>
                  </Link>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {report.reportComments.map((comment: ReportComment) => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-sm font-medium ${
                          comment.user.role === "RT_ADMIN"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {comment.user.isDeleted ? (
                          <Badge />
                        ) : comment.user.profile ? (
                          <img
                            src={comment.user.profile}
                            alt={comment.user.name.charAt(0).toUpperCase()}
                          />
                        ) : (
                          comment.user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {comment.user.isDeleted
                            ? "Pengguna Terhapus"
                            : comment.user.name}
                        </span>
                        {comment.user.role === "RT_ADMIN" && (
                          <Badge variant="info" size="sm">
                            Admin RT
                          </Badge>
                        )}
                        {comment.user.id === report.user.id &&
                          !report.isAnonymous && (
                            <Badge variant="success" size="sm">
                              Penulis
                            </Badge>
                          )}
                        <span className="text-sm text-gray-500">
                          {formatDateTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {report.reportComments.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-500">Belum ada komentar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Report Info */}
          <Card>
            <CardHeader>
              <CardTitle>Info Laporan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Status
                </label>
                <div className="mt-1">
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Kategori
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {getCategoryLabel(report.category)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Lokasi
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {report.location.address}
                </p>
                <p className="text-xs text-gray-500">
                  RT {report.location.rt} RW {report.location.rw}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Dilaporkan
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDateTime(report.createdAt)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Dukungan
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {report.upvoteCount} warga
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Admin Controls */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Kontrol Admin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status Update */}
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Ubah Status
                  </label>
                  <select
                    value={selectedStatus || report.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={updateStatusMutation.isPending}
                  >
                    <option value="PENDING">Menunggu</option>
                    <option value="IN_PROGRESS">Dalam Proses</option>
                    <option value="RESOLVED">Selesai</option>
                    <option value="REJECTED">Ditolak</option>
                    <option value="CLOSED">Ditutup</option>
                  </select>
                </div>

                {/* Quick Response */}
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Tanggapan Resmi
                  </label>
                  <Textarea
                    value={adminResponseText}
                    onChange={(e) => setAdminResponseText(e.target.value)}
                    placeholder="Tulis tanggapan resmi untuk warga..."
                    rows={3}
                    className="w-full text-sm"
                  />
                  <Button
                    onClick={handleSubmitResponse}
                    disabled={
                      !adminResponseText.trim() || addResponseMutation.isPending
                    }
                    className="w-full mt-2"
                    size="sm"
                  >
                    {addResponseMutation.isPending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Kirim Tanggapan
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetailPage;
