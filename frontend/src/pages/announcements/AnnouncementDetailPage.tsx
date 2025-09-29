import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAnnouncement } from "../../services/announcementService";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Breadcrumb from "../../components/ui/Breadcrumb";
import AttachmentViewer from "../../components/ui/AttachmentViewer";
import AnnouncementDetailSkeleton from "./components/AnnouncementDetailSkeleton";
import { Pin, Calendar, Bell } from "lucide-react";

function formatDateTime(s?: string | null) {
  if (!s) return "-";
  return new Date(s).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  // Detect where user came from based on location state or current URL context
  const isFromAdmin =
    location.state?.from === "admin" ||
    location.pathname.includes("/admin") ||
    document.referrer.includes("/admin/announcements");

  const {
    data: a,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["announcement", id],
    queryFn: () => getAnnouncement(id!),
    enabled: !!id,
  });

  if (isLoading) return <AnnouncementDetailSkeleton />;
  if (isError || !a)
    return <p className="text-sm text-red-600">Pengumuman tidak ditemukan.</p>;

  const priorityVariant =
    a.priority === "URGENT"
      ? "danger"
      : a.priority === "HIGH"
      ? "warning"
      : "default";

  // Dynamic breadcrumb based on where user came from
  const breadcrumbItems = isFromAdmin
    ? [
        { label: "Dashboard", href: "/admin" },
        { label: "Kelola Pengumuman", href: "/admin/announcements" },
        { label: a.title },
      ]
    : [{ label: "Pengumuman", href: "/announcements" }, { label: a.title }];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-3">
                {a.isPinned && (
                  <span className="inline-flex items-center gap-1 text-amber-600 text-sm font-medium">
                    <Pin className="h-3 w-3" /> Pinned
                  </span>
                )}
                <Badge variant="info">{a.type}</Badge>
                <Badge
                  variant={priorityVariant as "danger" | "warning" | "default"}
                >
                  {a.priority}
                </Badge>
              </div>

              <CardTitle className="text-2xl text-gray-900 mb-4 whitespace-pre-wrap break-words">
                {a.title}
              </CardTitle>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600">
                <span className="inline-flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {formatDateTime(a.publishAt || a.createdAt)}
                </span>
                <span className="inline-flex items-center">
                  <Bell className="mr-1 h-4 w-4" />
                  {a.author?.name || "-"}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Isi Pengumuman</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap break-words text-gray-700">
                {a.content}
              </div>
            </CardContent>
          </Card>

          {a.attachments?.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <AttachmentViewer
                  attachments={a.attachments.map((att) => ({
                    id: att.id,
                    filename: att.filename,
                    url: att.url,
                    fileType: att.fileType as "image" | "video" | "document",
                    format: att.filename.split(".").pop()?.toLowerCase(),
                  }))}
                  title="Lampiran"
                  gridCols={3}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar (opsional perlu, sementara info singkat) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status Tayang</span>
                <span className="font-medium">
                  {a.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Mulai Tayang</span>
                <span className="font-medium">
                  {formatDateTime(a.publishAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Berakhir</span>
                <span className="font-medium">
                  {formatDateTime(a.expireAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
