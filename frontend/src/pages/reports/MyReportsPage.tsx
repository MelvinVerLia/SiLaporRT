import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Eye,
  EyeOff,
  TrendingUp,
  MessageCircle,
  ThumbsUp,
  Clock,
  AlertTriangle,
  MapPin,
  Paperclip,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import { useAuthContext } from "../../contexts/AuthContext";
import {
  getUserReports,
  deleteUserReport,
  toggleReportVisibility,
} from "../../services/reportService";
import { Report } from "../../types/report.types";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

const MyReportsPage: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Clear cache when user changes (fixes cache issue when switching accounts)
  useEffect(() => {
    if (user?.id) {
      qc.invalidateQueries({ queryKey: ["user-reports"] });
    }
  }, [user?.id, qc]);

  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!event.target) return;

      const target = event.target as Element;
      const isDropdownClick =
        target.closest("[data-dropdown]") ||
        target.closest("button[data-dropdown-toggle]");

      if (!isDropdownClick) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Query for user's reports
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "user-reports",
      user?.id,
      { page, pageSize, q: searchTerm, selectedCategory, selectedStatus },
    ],
    queryFn: () =>
      getUserReports({
        page,
        pageSize,
        q: searchTerm || undefined,
        category: selectedCategory || undefined,
        status: selectedStatus || undefined,
      }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Mutation for deleting reports
  const deleteMutation = useMutation({
    mutationFn: deleteUserReport,
    onMutate: async (reportId: string) => {
      // Cancel any outgoing refetches
      await qc.cancelQueries({ queryKey: ["user-reports"] });

      // Snapshot the previous value
      const previousUserReports = qc.getQueryData([
        "user-reports",
        user?.id,
        page,
        searchTerm,
        selectedStatus,
        selectedCategory,
      ]);

      // Optimistically update by removing the report
      qc.setQueryData(
        [
          "user-reports",
          user?.id,
          page,
          searchTerm,
          selectedStatus,
          selectedCategory,
        ],
        (old: unknown) => {
          if (!old || typeof old !== "object") return old;
          const reportData = old as { items: Report[]; total: number };
          return {
            ...reportData,
            items: reportData.items.filter(
              (report: Report) => report.id !== reportId
            ),
            total: reportData.total - 1,
          };
        }
      );

      return { previousUserReports };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousUserReports) {
        qc.setQueryData(
          [
            "user-reports",
            user?.id,
            page,
            searchTerm,
            selectedStatus,
            selectedCategory,
          ],
          context.previousUserReports
        );
      }
    },
    onSuccess: () => {
      // Invalidate user reports and general reports to keep data consistent
      qc.invalidateQueries({ queryKey: ["user-reports"] });
      qc.invalidateQueries({ queryKey: ["reports"] });
      qc.invalidateQueries({ queryKey: ["recent-reports"] });
    },
  });

  // Mutation for toggling visibility
  const visibilityMutation = useMutation({
    mutationFn: toggleReportVisibility,
    onMutate: async (reportId: string) => {
      // Cancel any outgoing refetches
      await qc.cancelQueries({ queryKey: ["user-reports"] });

      // Snapshot the previous value
      const previousUserReports = qc.getQueryData([
        "user-reports",
        user?.id,
        page,
        searchTerm,
        selectedStatus,
        selectedCategory,
      ]);

      // Optimistically update by toggling the visibility
      qc.setQueryData(
        [
          "user-reports",
          user?.id,
          page,
          searchTerm,
          selectedStatus,
          selectedCategory,
        ],
        (old: unknown) => {
          if (!old || typeof old !== "object") return old;
          const reportData = old as { items: Report[]; total: number };
          return {
            ...reportData,
            items: reportData.items.map((report: Report) =>
              report.id === reportId
                ? { ...report, isPublic: !report.isPublic }
                : report
            ),
          };
        }
      );

      return { previousUserReports };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousUserReports) {
        qc.setQueryData(
          [
            "user-reports",
            user?.id,
            page,
            searchTerm,
            selectedStatus,
            selectedCategory,
          ],
          context.previousUserReports
        );
      }
    },
    onSuccess: () => {
      // Invalidate user reports and general reports to keep data consistent
      qc.invalidateQueries({ queryKey: ["user-reports"] });
      qc.invalidateQueries({ queryKey: ["reports"] });
      qc.invalidateQueries({ queryKey: ["recent-reports"] });
    },
  });

  const reports = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Statistics calculation from real data
  const stats = {
    total: total,
    pending: reports.filter((r: Report) => r.status === "PENDING").length,
    inProgress: reports.filter((r: Report) => r.status === "IN_PROGRESS")
      .length,
    resolved: reports.filter((r: Report) => r.status === "RESOLVED").length,
    rejected: reports.filter((r: Report) => r.status === "REJECTED").length,
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

  const handleDeleteReport = (reportId: string) => {
    if (window.confirm("Yakin ingin menghapus laporan ini?")) {
      deleteMutation.mutate(reportId);
    }
  };

  const handleToggleVisibility = (reportId: string) => {
    visibilityMutation.mutate(reportId);
  };

  const handleCardClick = (reportId: string) => {
    navigate(`/reports/${reportId}`, {
      state: { from: "my-reports" },
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when page size changes
  };

  // No client-side filtering needed since API handles it
  const filteredReports = reports;

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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
              <p className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </p>
              <p className="text-sm text-gray-600">Ditolak</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari laporan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </form>

            <Select
              options={statusOptions}
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              placeholder="Filter status"
            />

            <Select
              options={categoryOptions}
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              placeholder="Filter kategori"
            />
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(pageSize)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="flex gap-2 mb-2">
                      <div className="h-5 bg-gray-200 rounded w-20"></div>
                      <div className="h-5 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Gagal Memuat Laporan
            </h3>
            <p className="text-gray-600 mb-4">
              {error?.message || "Terjadi kesalahan saat memuat laporan Anda"}
            </p>
            <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
          </CardContent>
        </Card>
      ) : filteredReports.length === 0 ? (
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
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report: Report) => {
            const statusInfo = getStatusBadge(report.status);

            return (
              <Card
                key={report.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Main Content */}
                    <div
                      className="flex-1 space-y-2 min-w-0 cursor-pointer"
                      onClick={() => handleCardClick(report.id)}
                    >
                      {/* Title and Badges */}
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900 whitespace-pre-wrap break-words line-clamp-1">
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
                          {!report.isPublic && (
                            <Badge variant="default" size="sm">
                              <EyeOff className="mr-1 h-3 w-3" />
                              Privat
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm line-clamp-3 break-words whitespace-pre-wrap">
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
                            <span className="flex items-center">
                              <Paperclip className="mr-1 h-4 w-4" />
                              {report.attachments.length} file
                            </span>
                          )}
                        </div>

                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          <span>
                            {formatDistanceToNow(new Date(report.createdAt), {
                              addSuffix: true,
                              locale: id,
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Author */}
                      <div className="text-sm text-gray-500">
                        Dilaporkan oleh: Anda
                      </div>
                    </div>

                    {/* Action Menu */}
                    <div className="relative flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        data-dropdown-toggle
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          setOpenDropdown(
                            openDropdown === report.id ? null : report.id
                          );
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>

                      {/* Dropdown Menu */}
                      {openDropdown === report.id && (
                        <div
                          className="absolute right-0 top-8 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10"
                          data-dropdown
                        >
                          <div className="py-1">
                            <button
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleVisibility(report.id);
                                setOpenDropdown(null);
                              }}
                            >
                              {report.isPublic ? (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Jadikan Privat
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Jadikan Publik
                                </>
                              )}
                            </button>
                            <button
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteReport(report.id);
                                setOpenDropdown(null);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus Laporan
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !isError && totalPages > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          showPageSizeSelector={true}
          className="mt-6"
        />
      )}
    </div>
  );
};

export default MyReportsPage;
