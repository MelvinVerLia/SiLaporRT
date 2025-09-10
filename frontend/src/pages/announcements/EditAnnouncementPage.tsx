import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit3, AlertTriangle } from "lucide-react";
import Button from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Breadcrumb from "../../components/ui/Breadcrumb";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import AdminAnnouncementForm from "../../components/announcements/AdminAnnouncementForm";
import { adminGetAnnouncement } from "../../services/announcementAdminService";

export default function EditAnnouncementPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: announcement,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-announcement", id],
    queryFn: () => adminGetAnnouncement(id!),
    enabled: !!id,
  });

  const breadcrumbItems = [
    { label: "Dashboard", href: "/admin" },
    { label: "Kelola Pengumuman", href: "/admin/announcements" },
    { label: "Edit Pengumuman" },
  ];

  const handleSuccess = () => {
    // Redirect back to manage announcements page after successful update
    navigate("/admin/announcements");
  };

  const handleCancel = () => {
    // Navigate back to manage announcements page
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

        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Pengumuman tidak ditemukan
          </h3>
          <p className="text-gray-600 mb-6">
            Pengumuman yang Anda cari tidak dapat ditemukan atau telah dihapus.
          </p>
          <Button onClick={handleCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Pengumuman
            </h1>
          </div>
          <p className="text-gray-600">Edit pengumuman: {announcement.title}</p>
        </div>
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
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
