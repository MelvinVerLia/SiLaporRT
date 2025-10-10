import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import AdminAnnouncementForm from "./components/AdminAnnouncementForm";

export default function CreateAnnouncementPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Redirect back to manage announcements page after successful creation
    navigate("/admin/announcements");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Buat Pengumuman Baru
          </h1>
          <p className="text-gray-600 mt-1">
            Buat pengumuman baru untuk warga RT
          </p>
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
            <AdminAnnouncementForm onSuccess={handleSuccess} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
