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
import AnnouncementDetailSkeleton from "./components/AnnouncementDetailSkeleton";
import { Pin, Calendar, Bell, Paperclip } from "lucide-react";

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
            <div className="flex-1">
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

              <CardTitle className="text-2xl text-gray-900 mb-4">
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
              <div className="prose prose-sm max-w-none whitespace-pre-line text-gray-700">
                {a.content}
              </div>
            </CardContent>
          </Card>

          {a.attachments?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Lampiran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {a.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center">
                        <Paperclip className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            {att.filename}
                          </a>
                          <p className="text-xs text-gray-500">
                            {att.fileType}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
