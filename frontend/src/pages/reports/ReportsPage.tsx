import React, { useState, useMemo } from "react";
import { Search, FileText, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import Input from "../../components/ui/Input";
// import { useAuth } from "../../hooks/useAuth";
import { getReportList } from "../../services/reportService";
import { Report } from "../../types/report.types";
import { useQuery } from "@tanstack/react-query";
import Button from "../../components/ui/Button";
import Pagination from "../../components/ui/Pagination";
import ReportListItem from "./ReportListItem";
import ReportListItemSkeleton from "./components/ReportListItemSkeleton";
import AdvancedFilter, {
  FilterField,
} from "../../components/common/AdvancedFilter";

const ReportsPage: React.FC = () => {
  // const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: [
      "reports",
      { page, pageSize, q, selectedCategory, selectedStatus },
    ],
    queryFn: () =>
      getReportList({
        page,
        pageSize,
        q,
        category: selectedCategory,
        status: selectedStatus,
      }),
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

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

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedStatus) count++;
    return count;
  }, [selectedCategory, selectedStatus]);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory("");
    setSelectedStatus("");
    setPage(1);
  };

  // Filter fields configuration
  const filterFields: FilterField[] = [
    {
      name: "category",
      label: "Kategori",
      type: "select",
      value: selectedCategory,
      onChange: (value) => {
        setSelectedCategory(value as string);
        setPage(1);
      },
      options: categoryOptions,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      value: selectedStatus,
      onChange: (value) => {
        setSelectedStatus(value as string);
        setPage(1);
      },
      options: statusOptions,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary-600">Laporan Warga</h1>
        <p className="text-gray-600 mt-1">
          Lihat dan pantau laporan dari warga RT • {total} laporan
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
              <Input
                placeholder="Cari laporan..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-10"
              />
            </div>

            <AdvancedFilter
              fields={filterFields}
              activeFilterCount={activeFilterCount}
              onReset={handleResetFilters}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isLoading && (
          <>
            {/* Show 5 skeleton items while loading */}
            {Array.from({ length: 5 }).map((_, index) => (
              <ReportListItemSkeleton key={`skeleton-${index}`} />
            ))}
          </>
        )}

        {isError && (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Gagal Memuat Laporan
              </h3>
              <p className="text-gray-600 mb-6">
                Terjadi kesalahan saat memuat data laporan. Silakan coba lagi.
              </p>
              <Button
                variant="outline"
                onClick={() => refetch()}
                loading={isFetching}
                className="w-full sm:w-auto"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Coba Lagi
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading &&
          !isError &&
          items &&
          items.map((r: Report) => <ReportListItem key={r.id} r={r} />)}
      </div>

      {!isLoading && !isError && items.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Belum Ada Laporan
            </h3>
            <p className="text-gray-600">
              Laporan akan muncul ketika tersedia.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Pagination */}
      <div className="pt-6">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={data?.total ?? 0}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          showPageSizeSelector={true}
        />
      </div>
    </div>
  );
};

export default ReportsPage;
