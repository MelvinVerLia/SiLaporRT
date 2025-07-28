import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  MapPin,
  ThumbsUp,
  MessageCircle,
  Clock,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../hooks/useAuth";

const ReportsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Mock reports data
  const mockReports = [
    {
      id: "1",
      title: "Jalan berlubang besar di RT 05 RW 02",
      description:
        "Jalan di depan rumah nomor 45 terdapat lubang besar yang membahayakan pengendara motor dan mobil. Sudah beberapa kali ada kecelakaan kecil.",
      category: "INFRASTRUCTURE",
      status: "PENDING",
      isPublic: true,
      isAnonymous: false,
      upvoteCount: 12,
      commentCount: 5,
      responseCount: 0,
      location: {
        address: "Jl. Mawar No. 45, RT 05 RW 02",
        rt: "05",
        rw: "02",
      },
      user: {
        name: "Budi Santoso",
        role: "CITIZEN",
      },
      createdAt: "2024-01-20T08:30:00Z",
      attachments: [{ fileType: "image", url: "#" }],
    },
    {
      id: "2",
      title: "Lampu jalan mati sudah 3 hari",
      description:
        "Lampu jalan di ujung gang sudah mati 3 hari, sangat gelap di malam hari dan mengganggu keamanan warga.",
      category: "LIGHTING",
      status: "IN_PROGRESS",
      isPublic: true,
      isAnonymous: false,
      upvoteCount: 8,
      commentCount: 3,
      responseCount: 1,
      location: {
        address: "Gang Melati RT 03 RW 01",
        rt: "03",
        rw: "01",
      },
      user: {
        name: "Siti Aminah",
        role: "CITIZEN",
      },
      createdAt: "2024-01-19T15:20:00Z",
      attachments: [],
    },
    {
      id: "3",
      title: "Sampah menumpuk di tempat pembuangan",
      description:
        "TPS di belakang RT sudah penuh dan mulai berbau tidak sedap. Perlu segera dibersihkan.",
      category: "CLEANLINESS",
      status: "RESOLVED",
      isPublic: true,
      isAnonymous: true,
      upvoteCount: 15,
      commentCount: 7,
      responseCount: 2,
      location: {
        address: "TPS RT 04 RW 02",
        rt: "04",
        rw: "02",
      },
      user: null, // Anonymous
      createdAt: "2024-01-18T10:15:00Z",
      attachments: [
        { fileType: "image", url: "#" },
        { fileType: "image", url: "#" },
      ],
    },
  ];

  const categoryOptions = [
    { value: "", label: "Semua Kategori" },
    { value: "INFRASTRUCTURE", label: "Infrastruktur" },
    { value: "CLEANLINESS", label: "Kebersihan" },
    { value: "LIGHTING", label: "Penerangan" },
    { value: "SECURITY", label: "Keamanan" },
    { value: "UTILITIES", label: "Utilitas" },
    { value: "ENVIRONMENT", label: "Lingkungan" },
  ];

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "PENDING", label: "Menunggu" },
    { value: "IN_PROGRESS", label: "Dalam Proses" },
    { value: "RESOLVED", label: "Selesai" },
    { value: "REJECTED", label: "Ditolak" },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { variant: "warning" as const, label: "Menunggu" },
      IN_PROGRESS: { variant: "info" as const, label: "Proses" },
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Baru saja";
    if (diffInHours < 24) return `${diffInHours} jam lalu`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} hari lalu`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan Warga</h1>
          <p className="text-gray-600 mt-1">
            Lihat dan pantau laporan dari warga RT
          </p>
        </div>

        {isAuthenticated && (
          <Link to="/create-report">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Buat Laporan
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari laporan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              options={categoryOptions}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              placeholder="Pilih kategori"
            />

            <Select
              options={statusOptions}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              placeholder="Pilih status"
            />
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {mockReports.map((report) => {
          const statusInfo = getStatusBadge(report.status);

          return (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Main Content */}
                  <div className="flex-1 space-y-3">
                    {/* Title and Badges */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {report.title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="default" size="sm">
                          {getCategoryLabel(report.category)}
                        </Badge>
                        <Badge variant={statusInfo.variant} size="sm">
                          {statusInfo.label}
                        </Badge>
                        {report.isAnonymous && (
                          <Badge variant="default" size="sm">
                            Anonim
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {report.description}
                    </p>

                    {/* Location */}
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="mr-1 h-4 w-4" />
                      <span>{report.location.address}</span>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <ThumbsUp className="mr-1 h-4 w-4" />
                          {report.upvoteCount}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="mr-1 h-4 w-4" />
                          {report.commentCount}
                        </span>
                        {report.attachments.length > 0 && (
                          <span>📎 {report.attachments.length} file</span>
                        )}
                      </div>

                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>{formatTimeAgo(report.createdAt)}</span>
                      </div>
                    </div>

                    {/* Author */}
                    <div className="text-sm text-gray-500">
                      Dilaporkan oleh:{" "}
                      {report.isAnonymous ? "Anonim" : report.user?.name}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="lg:ml-6">
                    <Link to={`/reports/${report.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full lg:w-auto"
                      >
                        Lihat Detail
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State or Load More */}
      {mockReports.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Belum Ada Laporan
            </h3>
            <p className="text-gray-600 mb-6">
              Belum ada laporan yang sesuai dengan filter yang dipilih.
            </p>
            {isAuthenticated && (
              <Link to="/create-report">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Laporan Pertama
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="text-center">
          <Button variant="outline">Muat Lebih Banyak</Button>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
