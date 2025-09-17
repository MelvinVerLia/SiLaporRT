import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  TrendingUp,
  MessageCircle,
  ThumbsUp,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import { useAuthContext } from "../../contexts/AuthContext";

const MyReportsPage: React.FC = () => {
  const { user } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Mock user's reports data
  const mockUserReports = [
    {
      id: "1",
      title: "Jalan berlubang di RT 05",
      description:
        "Jalan di depan rumah nomor 45 terdapat lubang besar yang membahayakan pengendara.",
      category: "INFRASTRUCTURE",
      status: "PENDING",
      isPublic: true,
      isAnonymous: false,
      upvoteCount: 12,
      commentCount: 5,
      responseCount: 0,
      viewCount: 87,
      location: {
        address: "Jl. Mawar No. 45, RT 05",
        rt: "05",
        rw: "02",
      },
      attachments: [
        { fileType: "image", filename: "photo1.jpg" },
        { fileType: "image", filename: "photo2.jpg" },
      ],
      createdAt: "2024-01-20T08:30:00Z",
      updatedAt: "2024-01-20T08:30:00Z",
    },
    {
      id: "2",
      title: "Lampu jalan mati sudah 3 hari",
      description:
        "Lampu jalan di ujung gang sudah mati 3 hari, sangat gelap di malam hari.",
      category: "LIGHTING",
      status: "IN_PROGRESS",
      isPublic: true,
      isAnonymous: false,
      upvoteCount: 8,
      commentCount: 3,
      responseCount: 1,
      viewCount: 45,
      location: {
        address: "Gang Melati RT 03",
        rt: "03",
        rw: "01",
      },
      attachments: [],
      createdAt: "2024-01-19T15:20:00Z",
      updatedAt: "2024-01-21T10:30:00Z",
    },
    {
      id: "3",
      title: "Saran perbaikan taman RT",
      description:
        "Taman RT perlu diperbaiki dengan menambah bangku dan tanaman hias.",
      category: "SUGGESTION",
      status: "RESOLVED",
      isPublic: false,
      isAnonymous: false,
      upvoteCount: 6,
      commentCount: 2,
      responseCount: 1,
      viewCount: 23,
      location: {
        address: "Taman RT 04",
        rt: "04",
        rw: "02",
      },
      attachments: [{ fileType: "image", filename: "taman-sketch.jpg" }],
      createdAt: "2024-01-15T09:00:00Z",
      updatedAt: "2024-01-22T14:20:00Z",
    },
    {
      id: "4",
      title: "Keluhan sampah tidak diangkut",
      description: "Sampah di TPS sudah 2 minggu tidak diangkut, mulai bau.",
      category: "CLEANLINESS",
      status: "REJECTED",
      isPublic: true,
      isAnonymous: true,
      upvoteCount: 3,
      commentCount: 1,
      responseCount: 1,
      viewCount: 34,
      location: {
        address: "TPS RT 05",
        rt: "05",
        rw: "02",
      },
      attachments: [],
      createdAt: "2024-01-10T11:15:00Z",
      updatedAt: "2024-01-18T16:45:00Z",
    },
  ];

  // Statistics calculation
  const stats = {
    total: mockUserReports.length,
    pending: mockUserReports.filter((r) => r.status === "PENDING").length,
    inProgress: mockUserReports.filter((r) => r.status === "IN_PROGRESS")
      .length,
    resolved: mockUserReports.filter((r) => r.status === "RESOLVED").length,
    totalUpvotes: mockUserReports.reduce((sum, r) => sum + r.upvoteCount, 0),
    totalViews: mockUserReports.reduce((sum, r) => sum + r.viewCount, 0),
  };

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "PENDING", label: "Menunggu" },
    { value: "IN_PROGRESS", label: "Dalam Proses" },
    { value: "RESOLVED", label: "Selesai" },
    { value: "REJECTED", label: "Ditolak" },
  ];

  const categoryOptions = [
    { value: "", label: "Semua Kategori" },
    { value: "INFRASTRUCTURE", label: "Infrastruktur" },
    { value: "CLEANLINESS", label: "Kebersihan" },
    { value: "LIGHTING", label: "Penerangan" },
    { value: "SECURITY", label: "Keamanan" },
    { value: "SUGGESTION", label: "Saran" },
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
      SUGGESTION: "Saran",
      EVENT: "Kegiatan",
    };
    return labels[category as keyof typeof labels] || category;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteReport = (reportId: string) => {
    if (window.confirm("Yakin ingin menghapus laporan ini?")) {
      // In real app, call delete API
      console.log("Delete report:", reportId);
    }
  };

  const toggleReportVisibility = (reportId: string) => {
    // In real app, call toggle visibility API
    console.log("Toggle visibility:", reportId);
  };

  // Filter reports based on search and filters
  const filteredReports = mockUserReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || report.status === selectedStatus;
    const matchesCategory =
      !selectedCategory || report.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan Saya</h1>
          <p className="text-gray-600 mt-1">
            Kelola dan pantau semua laporan yang telah Anda buat
          </p>
        </div>

        <Link to="/create-report">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Buat Laporan Baru
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Laporan</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
              <p className="text-sm text-gray-600">Menunggu</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {stats.inProgress}
              </p>
              <p className="text-sm text-gray-600">Proses</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {stats.resolved}
              </p>
              <p className="text-sm text-gray-600">Selesai</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {stats.totalUpvotes}
              </p>
              <p className="text-sm text-gray-600">Total Dukungan</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">
                {stats.totalViews}
              </p>
              <p className="text-sm text-gray-600">Total Dilihat</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              options={statusOptions}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              placeholder="Filter status"
            />

            <Select
              options={categoryOptions}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              placeholder="Filter kategori"
            />

            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "primary" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex-1"
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "primary" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex-1"
              >
                List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }
      >
        {filteredReports.map((report) => {
          const statusInfo = getStatusBadge(report.status);

          return (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* Header with actions */}
                <div className="flex justify-between items-start mb-3">
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
                    {!report.isPublic && (
                      <Badge variant="default" size="sm">
                        <EyeOff className="mr-1 h-3 w-3" />
                        Privat
                      </Badge>
                    )}
                  </div>

                  {/* Action Menu */}
                  <div className="relative">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                    {/* Dropdown menu would go here in real implementation */}
                  </div>
                </div>

                {/* Title and Description */}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {report.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {report.description}
                </p>

                {/* Location */}
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span className="truncate">{report.location.address}</span>
                </div>

                {/* Metrics */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <ThumbsUp className="mr-1 h-4 w-4" />
                      {report.upvoteCount}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="mr-1 h-4 w-4" />
                      {report.commentCount}
                    </span>
                    <span className="flex items-center">
                      <Eye className="mr-1 h-4 w-4" />
                      {report.viewCount}
                    </span>
                  </div>

                  {report.attachments.length > 0 && (
                    <span className="text-xs">
                      📎 {report.attachments.length}
                    </span>
                  )}
                </div>

                {/* Dates */}
                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    Dibuat: {formatDate(report.createdAt)}
                  </span>
                  {report.updatedAt !== report.createdAt && (
                    <span className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      Update: {formatDate(report.updatedAt)}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link to={`/reports/${report.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="mr-1 h-4 w-4" />
                      Lihat
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleReportVisibility(report.id)}
                    className="px-3"
                  >
                    {report.isPublic ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>

                  <Button variant="ghost" size="sm" className="px-3">
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteReport(report.id)}
                    className="px-3 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || selectedStatus || selectedCategory
                ? "Tidak Ada Laporan yang Sesuai"
                : "Belum Ada Laporan"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedStatus || selectedCategory
                ? "Coba ubah filter pencarian Anda"
                : "Mulai berkontribusi dengan membuat laporan pertama Anda"}
            </p>
            {!searchTerm && !selectedStatus && !selectedCategory && (
              <Link to="/create-report">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Laporan Pertama
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Load More (if needed) */}
      {filteredReports.length > 0 && (
        <div className="text-center">
          <Button variant="outline">Muat Lebih Banyak</Button>
        </div>
      )}
    </div>
  );
};

export default MyReportsPage;
