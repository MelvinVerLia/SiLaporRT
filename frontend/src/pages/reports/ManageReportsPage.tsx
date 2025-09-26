import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FileText,
  Search,
  MapPin,
  MessageCircle,
  ThumbsUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
} from "lucide-react";
import {
  adminListReports,
  updateReportStatus,
  getReportStatistics,
} from "../../services/reportAdminService";
import Button from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Breadcrumb from "../../components/ui/Breadcrumb";
import Pagination from "../../components/ui/Pagination";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { Report } from "../../types/report.types";

export default function ManageReportsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [q, setQ] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(
    searchParams.get("status") || ""
  );

  // Update selected status when URL params change
  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam && statusParam !== selectedStatus) {
      setSelectedStatus(statusParam);
    }
  }, [searchParams, selectedStatus]);

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "admin-reports",
      { page, pageSize, q, selectedCategory, selectedStatus },
    ],
    queryFn: () =>
      adminListReports({
        page,
        pageSize,
        q,
        category: selectedCategory,
        status: selectedStatus,
      }),
    staleTime: 0,
  });

  // Separate query for statistics that's not affected by pagination
  const { data: statsData } = useQuery({
    queryKey: ["report-statistics"],
    queryFn: () => getReportStatistics(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      message,
    }: {
      id: string;
      status: string;
      message?: string;
    }) => updateReportStatus(id, status, message),
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await qc.cancelQueries({ queryKey: ["admin-reports"] });

      // Snapshot previous data
      const previousData = qc.getQueryData([
        "admin-reports",
        { page, pageSize, q, selectedCategory, selectedStatus },
      ]);

      // Optimistically update
      qc.setQueryData(
        [
          "admin-reports",
          { page, pageSize, q, selectedCategory, selectedStatus },
        ],
        (old: unknown) => {
          if (!old || typeof old !== "object") return old;
          const data = old as { items: Report[]; total: number };
          return {
            ...data,
            items: data.items.map((item: Report) =>
              item.id === id
                ? { ...item, status: status as Report["status"] }
                : item
            ),
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        qc.setQueryData(
          [
            "admin-reports",
            { page, pageSize, q, selectedCategory, selectedStatus },
          ],
          context.previousData
        );
      }
    },
    onSettled: (_, __, variables) => {
      // Always refetch to ensure consistency
      qc.invalidateQueries({ queryKey: ["admin-reports"] });
      qc.invalidateQueries({ queryKey: ["reports"] });
      qc.invalidateQueries({ queryKey: ["report", variables.id] });
      qc.invalidateQueries({ queryKey: ["report-statistics"] });
    },
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Use stats data for statistics cards, fallback to local counting if not available
  const statusCounts =
    statsData ||
    items.reduce((acc: Record<string, number>, report: Report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {});

  const breadcrumbItems = [
    { label: "Dashboard", href: "/admin" },
    { label: "Kelola Laporan" },
  ];

  const categoryOptions = [
    { value: "", label: "Semua Kategori" },
    { value: "INFRASTRUCTURE", label: "Infrastruktur" },
    { value: "CLEANLINESS", label: "Kebersihan" },
    { value: "LIGHTING", label: "Penerangan" },
    { value: "SECURITY", label: "Keamanan" },
    { value: "UTILITIES", label: "Utilitas" },
    { value: "ENVIRONMENT", label: "Lingkungan" },
    { value: "SUGGESTION", label: "Saran" },
    { value: "OTHER", label: "Lainnya" },
  ];

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "PENDING", label: "Menunggu" },
    { value: "IN_PROGRESS", label: "Dalam Proses" },
    { value: "RESOLVED", label: "Selesai" },
    { value: "REJECTED", label: "Ditolak" },
    { value: "CLOSED", label: "Ditutup" },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { variant: "warning" as const, label: "Menunggu", icon: Clock },
      IN_PROGRESS: { variant: "info" as const, label: "Proses", icon: Pause },
      RESOLVED: {
        variant: "success" as const,
        label: "Selesai",
        icon: CheckCircle,
      },
      REJECTED: { variant: "danger" as const, label: "Ditolak", icon: XCircle },
      CLOSED: { variant: "default" as const, label: "Ditutup", icon: XCircle },
    };
    return variants[status as keyof typeof variants] || variants.PENDING;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      INFRASTRUCTURE: "Infrastruktur",
      CLEANLINESS: "Kebersihan",
      LIGHTING: "Penerangan",
      SECURITY: "Keamanan",
      UTILITIES: "Utilitas",
      ENVIRONMENT: "Lingkungan",
      SUGGESTION: "Saran",
      OTHER: "Lainnya",
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getPriorityIndicator = (report: Report) => {
    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(report.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (report.upvoteCount >= 10 || daysSinceCreated >= 7) {
      return { level: "HIGH", color: "text-red-500", label: "Tinggi" };
    } else if (report.upvoteCount >= 5 || daysSinceCreated >= 3) {
      return { level: "NORMAL", color: "text-yellow-500", label: "Normal" };
    }
    return { level: "LOW", color: "text-green-500", label: "Rendah" };
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

  const handleViewClick = (report: Report) => {
    navigate(`/reports/${report.id}`, {
      state: { from: "admin" },
    });
  };

  const handleStatusChange = (reportId: string, newStatus: string) => {
    const report = items.find((r: Report) => r.id === reportId);
    if (!report) return;

    // For status changes that need a reason, we might want to show a modal
    // For now, let's do a quick status update
    statusMutation.mutate({ id: reportId, status: newStatus });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Laporan</h1>
          <p className="text-gray-600 mt-1">
            Kelola dan tanggapi laporan dari warga RT
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Menunggu</p>
                <p className="text-lg font-semibold">
                  {statusCounts.PENDING || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Pause className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Proses</p>
                <p className="text-lg font-semibold">
                  {statusCounts.IN_PROGRESS || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Selesai</p>
                <p className="text-lg font-semibold">
                  {statusCounts.RESOLVED || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Ditolak</p>
                <p className="text-lg font-semibold">
                  {statusCounts.REJECTED || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <CardTitle>Daftar Laporan</CardTitle>
              <Badge variant="default" size="sm">
                {total} total
              </Badge>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Cari laporan..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full md:w-64"
                />
                <Button type="submit" variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </form>

              <Select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                options={categoryOptions}
                className="w-full md:w-48"
              />

              <Select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                options={statusOptions}
                className="w-full md:w-48"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-8 w-8 text-red-400 mb-2" />
              <p className="text-red-600">Gagal memuat laporan</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tidak ada laporan
              </h3>
              <p className="text-gray-600">
                Belum ada laporan yang sesuai dengan filter yang dipilih
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full table-fixed">
                  <colgroup>
                    <col className="w-35/100" /> {/* Laporan - 35% */}
                    <col className="w-1/10" /> {/* Kategori - 10% */}
                    <col className="w-1/10" /> {/* Prioritas - 10% */}
                    <col className="w-1/10" /> {/* Visibilitas - 10% */}
                    <col className="w-2/10" /> {/* Tanggal - 20% */}
                    <col className="w-15/100" /> {/* Status - 15% */}
                  </colgroup>
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 pr-6 text-sm font-medium text-gray-600">
                        Laporan
                      </th>
                      <th className="text-left py-4 pr-4 text-sm font-medium text-gray-600">
                        Kategori
                      </th>
                      <th className="text-left py-4 pr-4 text-sm font-medium text-gray-600">
                        Prioritas
                      </th>
                      <th className="text-left py-4 pr-4 text-sm font-medium text-gray-600">
                        Visibilitas
                      </th>
                      <th className="text-left py-4 text-sm font-medium text-gray-600">
                        Tanggal
                      </th>
                      <th className="text-left py-4 pr-4 text-sm font-medium text-gray-600">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((report: Report) => {
                      const priority = getPriorityIndicator(report);

                      return (
                        <tr
                          key={report.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleViewClick(report)}
                        >
                          <td className="py-5 pr-6">
                            <div className="min-w-0 flex-1">
                              <p
                                className="text-sm font-medium text-gray-900 line-clamp-1 leading-5"
                                title={report.title}
                              >
                                {report.title.length > 50
                                  ? report.title.substring(0, 50) + "..."
                                  : report.title}
                              </p>
                              <p
                                className="text-sm text-gray-500 line-clamp-1 leading-5 mt-1"
                                title={report.description}
                              >
                                {report.description.length > 50
                                  ? report.description.substring(0, 50) + "..."
                                  : report.description}
                              </p>
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span
                                  className="truncate"
                                  title={report.location.address}
                                >
                                  {report.location.address.length > 50
                                    ? report.location.address.substring(0, 50) +
                                      "..."
                                    : report.location.address}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 pr-4">
                            <Badge variant="default" size="sm">
                              <span className="block truncate text-xs">
                                {getCategoryLabel(report.category)}
                              </span>
                            </Badge>
                          </td>
                          <td className="py-5 pr-4">
                            <Badge variant="default" size="sm">
                              <span
                                className={`block truncate text-xs ${priority.color}`}
                              >
                                {priority.label}
                              </span>
                            </Badge>
                          </td>
                          <td className="py-5 pr-4">
                            <Badge
                              variant={report.isPublic ? "success" : "warning"}
                              size="sm"
                            >
                              <span className="block truncate text-xs">
                                {report.isPublic ? "Publik" : "Privat"}
                              </span>
                            </Badge>
                          </td>
                          <td className="py-5">
                            <div className="text-xs text-gray-600">
                              <p className="font-medium">
                                {formatDate(report.createdAt)}
                              </p>
                              {report.user && !report.isAnonymous && (
                                <p className="text-gray-500 truncate">
                                  oleh {report.user.name}
                                </p>
                              )}
                              {report.isAnonymous && (
                                <p className="text-gray-500">Anonim</p>
                              )}
                            </div>
                          </td>
                          <td className="py-5 pr-4">
                            <select
                              value={report.status}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleStatusChange(report.id, e.target.value);
                              }}
                              className="text-xs border rounded px-2 py-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="PENDING">Menunggu</option>
                              <option value="IN_PROGRESS">Dalam Proses</option>
                              <option value="RESOLVED">Selesai</option>
                              <option value="REJECTED">Ditolak</option>
                              <option value="CLOSED">Ditutup</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {items.map((report: Report) => {
                  const priority = getPriorityIndicator(report);

                  return (
                    <Card
                      key={report.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleViewClick(report)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 whitespace-pre-wrap break-words">
                              {report.title}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1 whitespace-pre-wrap break-words">
                              {report.description}
                            </p>
                          </div>

                          {/* Location */}
                          <div className="flex items-center text-xs text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate">
                              {report.location.address}
                            </span>
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="default" size="sm">
                              {getCategoryLabel(report.category)}
                            </Badge>
                            <Badge
                              variant={getStatusBadge(report.status).variant}
                              size="sm"
                            >
                              {getStatusBadge(report.status).label}
                            </Badge>
                            <Badge variant="default" size="sm">
                              <span className={priority.color}>
                                {priority.label}
                              </span>
                            </Badge>
                            <Badge
                              variant={report.isPublic ? "success" : "warning"}
                              size="sm"
                            >
                              {report.isPublic ? "Publik" : "Privat"}
                            </Badge>
                          </div>

                          {/* Stats */}
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                <span>{report.upvoteCount}</span>
                              </div>
                              <div className="flex items-center">
                                <MessageCircle className="h-3 w-3 mr-1" />
                                <span>{report.commentCount}</span>
                              </div>
                            </div>
                            <div>
                              <p>{formatDate(report.createdAt)}</p>
                              {report.user && !report.isAnonymous && (
                                <p>oleh {report.user.name}</p>
                              )}
                              {report.isAnonymous && <p>Anonim</p>}
                            </div>
                          </div>

                          {/* Status Update */}
                          <div className="pt-2 border-t border-gray-100">
                            <select
                              value={report.status}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleStatusChange(report.id, e.target.value);
                              }}
                              className="w-full text-sm border rounded px-3 py-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="PENDING">Menunggu</option>
                              <option value="IN_PROGRESS">Dalam Proses</option>
                              <option value="RESOLVED">Selesai</option>
                              <option value="REJECTED">Ditolak</option>
                              <option value="CLOSED">Ditutup</option>
                            </select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="pt-6">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={total}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  showPageSizeSelector={true}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
