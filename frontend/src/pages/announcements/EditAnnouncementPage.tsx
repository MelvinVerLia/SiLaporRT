import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Edit3, AlertCircle, RefreshCw } from "lucide-react";
import Button from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Breadcrumb from "../../components/ui/Breadcrumb";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import AdminAnnouncementForm from "./components/AdminAnnouncementForm";
import { adminGetAnnouncement } from "../../services/announcementAdminService";

export default function EditAnnouncementPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: announcement,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin-announcement", id],
    queryFn: () => adminGetAnnouncement(id!),
  });

  const breadcrumbItems = [
    { label: "Kelola Pengumuman", href: "/admin/announcements" },
    { label: "Edit Pengumuman" },
  ];

  const handleSuccess = () => {
    // Redirect back to manage announcements page after successful update
    navigate("/admin/announcements");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (isError || !announcement) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {!announcement
                ? "Pengumuman Tidak Ditemukan"
                : "Gagal Memuat Pengumuman"}
            </h3>
            <p className="text-gray-600 mb-6">
              {!announcement
                ? "Pengumuman yang Anda cari tidak ditemukan atau mungkin sudah dihapus."
                : "Terjadi kesalahan saat memuat data pengumuman. Silakan coba lagi."}
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
              <Link to="/admin/announcements">
                <Button>Kembali ke Kelola Pengumuman</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Pengumuman</h1>
        <p className="text-gray-600 mt-1">
          Edit pengumuman: {announcement.title}
        </p>
      </div>

      {/* Edit Form */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Edit3 className="mr-2 h-5 w-5" />
              Form Edit Pengumuman
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <AdminAnnouncementForm
              initial={announcement}
              onSuccess={handleSuccess}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
