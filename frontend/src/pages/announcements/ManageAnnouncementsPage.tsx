import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pin,
  PinOff,
  Eye,
  EyeOff,
  Edit3,
  Megaphone,
  AlertTriangle,
} from "lucide-react";
import {
  adminListAnnouncements,
  setActive,
  setPinned,
} from "../../services/announcementAdminService";
import Button from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Announcement } from "../../types/announcement.types";
import AdminAnnouncementForm from "../../components/announcements/AdminAnnouncementForm";

export default function ManageAnnouncementsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [includeInactive, setIncludeInactive] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-announcements", { page, pageSize, includeInactive }],
    queryFn: () =>
      adminListAnnouncements({
        page,
        pageSize,
        includeInactive,
        pinnedFirst: true,
      }),
    staleTime: 0,
  });

  const mutPin = useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) =>
      setPinned(id, isPinned),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-announcements"] }),
  });

  const mutActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setActive(id, isActive),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-announcements"] }),
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const getTypeBadge = (type: string) => {
    const variants = {
      GENERAL: { variant: "default" as const, label: "Umum" },
      URGENT: { variant: "danger" as const, label: "Mendesak" },
      EVENT: { variant: "info" as const, label: "Acara" },
      MAINTENANCE: { variant: "warning" as const, label: "Pemeliharaan" },
      REGULATION: { variant: "info" as const, label: "Peraturan" },
    };
    return variants[type as keyof typeof variants] || variants.GENERAL;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      LOW: { variant: "default" as const, label: "Rendah" },
      NORMAL: { variant: "default" as const, label: "Normal" },
      HIGH: { variant: "warning" as const, label: "Tinggi" },
      URGENT: { variant: "danger" as const, label: "Urgent" },
    };
    return variants[priority as keyof typeof variants] || variants.NORMAL;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    qc.invalidateQueries({ queryKey: ["admin-announcements"] });
  };

  const handleEditSuccess = () => {
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-announcements"] });
  };

  const handleEditCancel = () => {
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Kelola Pengumuman
          </h1>
          <p className="text-gray-600 mt-1">
            Buat dan atur pengumuman untuk warga RT
          </p>
        </div>

        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="w-full lg:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          {showCreateForm ? "Tutup Form" : "Buat Pengumuman"}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Pengumuman
                </p>
                <p className="text-3xl font-bold text-gray-900">{total}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Megaphone className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Pengumuman Aktif
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {items.filter((item) => item.isActive).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Dipinned
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {items.filter((item) => item.isPinned).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <Pin className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Forms */}
      {(showCreateForm || editing) && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="mr-2 h-5 w-5" />
                  Buat Pengumuman Baru
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AdminAnnouncementForm onSuccess={handleCreateSuccess} />
              </CardContent>
            </Card>
          )}

          {editing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit3 className="mr-2 h-5 w-5" />
                  Edit Pengumuman
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AdminAnnouncementForm
                  initial={editing}
                  onCancel={handleEditCancel}
                  onSuccess={handleEditSuccess}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Announcements List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Daftar Pengumuman</CardTitle>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <input
                  type="checkbox"
                  checked={includeInactive}
                  onChange={(e) => {
                    setIncludeInactive(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Tampilkan tidak aktif
              </label>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          )}

          {isError && (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-8 w-8 text-red-400 mb-2" />
              <p className="text-red-600">Gagal memuat pengumuman</p>
            </div>
          )}

          {!isLoading && items.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum ada pengumuman
              </h3>
              <p className="text-gray-600 mb-6">
                Buat pengumuman pertama untuk warga RT
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Buat Pengumuman
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 pr-6 text-sm font-medium text-gray-600">
                        Pengumuman
                      </th>
                      <th className="text-left py-3 pr-6 text-sm font-medium text-gray-600">
                        Jenis
                      </th>
                      <th className="text-left py-3 pr-6 text-sm font-medium text-gray-600">
                        Prioritas
                      </th>
                      <th className="text-left py-3 pr-6 text-sm font-medium text-gray-600">
                        Status
                      </th>
                      <th className="text-left py-3 pr-6 text-sm font-medium text-gray-600">
                        Tanggal
                      </th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((announcement: Announcement) => {
                      const typeBadge = getTypeBadge(announcement.type);
                      const priorityBadge = getPriorityBadge(
                        announcement.priority
                      );

                      return (
                        <tr
                          key={announcement.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 pr-6">
                            <div className="flex items-start space-x-3">
                              {announcement.isPinned && (
                                <Pin className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                  {announcement.title}
                                </p>
                                <p className="text-sm text-gray-500 line-clamp-2">
                                  {announcement.content}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 pr-6">
                            <Badge variant={typeBadge.variant} size="sm">
                              <span className="flex items-center">
                                <span className="ml-1">{typeBadge.label}</span>
                              </span>
                            </Badge>
                          </td>
                          <td className="py-4 pr-6">
                            <Badge variant={priorityBadge.variant} size="sm">
                              {priorityBadge.label}
                            </Badge>
                          </td>
                          <td className="py-4 pr-6">
                            <div className="flex flex-col space-y-1">
                              <Badge
                                variant={
                                  announcement.isActive ? "success" : "default"
                                }
                                size="sm"
                              >
                                {announcement.isActive ? "Aktif" : "Nonaktif"}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-4 pr-6">
                            <div className="text-sm text-gray-600">
                              <p>{formatDate(announcement.createdAt)}</p>
                              {announcement.publishAt && (
                                <p className="text-xs text-gray-500">
                                  Tayang: {formatDate(announcement.publishAt)}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  mutPin.mutate({
                                    id: announcement.id,
                                    isPinned: !announcement.isPinned,
                                  })
                                }
                                loading={mutPin.isPending}
                              >
                                {announcement.isPinned ? (
                                  <PinOff className="h-4 w-4" />
                                ) : (
                                  <Pin className="h-4 w-4" />
                                )}
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  mutActive.mutate({
                                    id: announcement.id,
                                    isActive: !announcement.isActive,
                                  })
                                }
                                loading={mutActive.isPending}
                              >
                                {announcement.isActive ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditing(announcement)}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {items.map((announcement: Announcement) => {
                  const typeBadge = getTypeBadge(announcement.type);
                  const priorityBadge = getPriorityBadge(announcement.priority);

                  return (
                    <Card
                      key={announcement.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                {announcement.isPinned && (
                                  <Pin className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                                )}
                                <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                                  {announcement.title}
                                </h3>
                              </div>
                              <p className="text-sm text-gray-500 line-clamp-2">
                                {announcement.content}
                              </p>
                            </div>
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2">
                            <Badge variant={typeBadge.variant} size="sm">
                              <span className="flex items-center">
                                <span className="ml-1">{typeBadge.label}</span>
                              </span>
                            </Badge>
                            <Badge variant={priorityBadge.variant} size="sm">
                              {priorityBadge.label}
                            </Badge>
                            <Badge
                              variant={
                                announcement.isActive ? "success" : "default"
                              }
                              size="sm"
                            >
                              {announcement.isActive ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </div>

                          {/* Date */}
                          <div className="text-xs text-gray-500">
                            <p>Dibuat: {formatDate(announcement.createdAt)}</p>
                            {announcement.publishAt && (
                              <p>
                                Tayang: {formatDate(announcement.publishAt)}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex justify-between pt-2 border-t border-gray-100">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  mutPin.mutate({
                                    id: announcement.id,
                                    isPinned: !announcement.isPinned,
                                  })
                                }
                                loading={mutPin.isPending}
                              >
                                {announcement.isPinned ? "Unpin" : "Pin"}
                              </Button>

                              <Button
                                size="sm"
                                variant={
                                  announcement.isActive ? "danger" : "primary"
                                }
                                onClick={() =>
                                  mutActive.mutate({
                                    id: announcement.id,
                                    isActive: !announcement.isActive,
                                  })
                                }
                                loading={mutActive.isPending}
                              >
                                {announcement.isActive
                                  ? "Nonaktifkan"
                                  : "Aktifkan"}
                              </Button>
                            </div>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditing(announcement)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Menampilkan {items.length} dari {total} pengumuman
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Sebelumnya
                    </Button>

                    <span className="px-3 py-2 text-sm text-gray-600">
                      Halaman {page} dari {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
