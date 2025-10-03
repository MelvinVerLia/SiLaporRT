import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import Button from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Breadcrumb from "../../components/ui/Breadcrumb";
import AdminAnnouncementForm from "./components/AdminAnnouncementForm";

export default function CreateAnnouncementPage() {
  const navigate = useNavigate();

  const breadcrumbItems = [
    { label: "Kelola Pengumuman", href: "/admin/announcements" },
    { label: "Buat Pengumuman" },
  ];

  const handleSuccess = () => {
    // Redirect back to manage announcements page after successful creation
    navigate("/admin/announcements");
  };

  const handleCancel = () => {
    // Navigate back to manage announcements page
    navigate("/admin/announcements");
  };

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
              Buat Pengumuman Baru
            </h1>
          </div>
          <p className="text-gray-600">Buat pengumuman baru untuk warga RT</p>
        </div>
      </div>

      {/* Create Form */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Form Pengumuman Baru
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <AdminAnnouncementForm
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
