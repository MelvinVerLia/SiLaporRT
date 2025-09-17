import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Clock,
  User,
  ThumbsUp,
  MessageCircle,
  Send,
  Paperclip,
  EyeOff,
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
import {
  getReportDetails,
  toggleUpvote,
  addComment,
  getUserUpvoteStatus,
} from "../../services/reportService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Attachment,
  Response,
  ReportComment,
  Report,
} from "../../types/report.types";
import ReportDetailSkeleton from "./components/ReportDetailSkeleton";
import { useAuthContext } from "../../contexts/AuthContext";

const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthContext();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");

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

  const hasUpvoted = upvoteStatus?.result || false;

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

  const handleUpvote = useMutation({
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

      // Get current upvote status to calculate the change correctly
      const currentHasUpvoted = upvoteStatus?.result || false;

      // Optimistically update the upvote status and count
      queryClient.setQueryData(["upvote-status", id], () => ({
        result: !currentHasUpvoted,
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
      // Rollback on error
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
      // Only invalidate list queries to sync them with the updated data
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["recent-reports"] });
    },
    onSettled: () => {
      // Minimal invalidation - just mark as stale without refetching
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

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    addCommentMutation.mutate(commentText);
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

  const breadcrumbItems = [
    { label: "Laporan", href: "/reports" },
    {
      label:
        report.title.length > 50
          ? report.title.substring(0, 50) + "..."
          : report.title,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Report Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
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
              </div>

              <CardTitle className="text-2xl text-gray-900 mb-4">
                {report.title}
              </CardTitle>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <User className="mr-1 h-4 w-4" />
                  <span>
                    {report.isAnonymous ? "Anonim" : report.user?.name}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>{formatDateTime(report.createdAt)}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  <span>{report.location.address}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <Button
                  variant={hasUpvoted ? "primary" : "outline"}
                  size="sm"
                  onClick={() => handleUpvote.mutate()}
                  className={`flex items-center transition-colors ${
                    hasUpvoted ? "bg-blue-600 text-white hover:bg-blue-700" : ""
                  }`}
                  disabled={handleUpvote.isPending}
                >
                  <ThumbsUp
                    className={`mr-1 h-4 w-4 ${
                      hasUpvoted ? "fill-current" : ""
                    }`}
                  />
                  {report.upvoteCount}
                </Button>
              )}

              <div className="flex items-center text-sm text-gray-500">
                <MessageCircle className="mr-1 h-4 w-4" />
                <span>{report.commentCount} komentar</span>
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
              <div className="prose prose-sm max-w-none">
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
              <CardHeader>
                <CardTitle>Lampiran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {report.attachments.map((attachment: Attachment) => (
                    <div
                      key={attachment.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center">
                        <Paperclip className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            {attachment.filename}
                          </a>
                          <p className="text-xs text-gray-500">
                            {attachment.fileType.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
              <CardTitle>Diskusi & Komentar</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Comment Form */}
              {isAuthenticated ? (
                <div className="mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Tulis komentar Anda..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        rows={3}
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
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          comment.user.role === "RT_ADMIN"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {comment.user.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {comment.user.name}
                        </span>
                        {comment.user.role === "RT_ADMIN" && (
                          <Badge variant="info" size="sm">
                            Admin RT
                          </Badge>
                        )}
                        <span className="text-sm text-gray-500">
                          {formatDateTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
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

          {/* Quick Actions */}
          {user?.role === "RT_ADMIN" && (
            <Card>
              <CardHeader>
                <CardTitle>Aksi Admin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Ubah Status
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Berikan Tanggapan
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetailPage;
