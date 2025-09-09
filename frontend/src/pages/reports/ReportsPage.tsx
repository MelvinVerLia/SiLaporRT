import React, { useState } from "react";
import { Search, FileText, X } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
// import { useAuth } from "../../hooks/useAuth";
import { getReportList } from "../../services/reportService";
import { Report } from "../../types/report.types";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import Button from "../../components/ui/Button";
import ReportListItem from "./ReportListItem";

const ReportsPage: React.FC = () => {
  // const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const pageSize = 10;
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const { data, isLoading, isError } = useQuery({
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Laporan Warga</h1>
        <p className="text-gray-600 mt-1">
          Lihat dan pantau laporan dari warga RT
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari laporan..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              options={categoryOptions}
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              placeholder="Pilih kategori"
            />

            <Select
              options={statusOptions}
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              placeholder="Pilih status"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center gap-2">
            <LoadingSpinner className="w-5 h-5" />
            <p className="text-sm text-gray-500">Memuat…</p>{" "}
          </div>
        )}
        {isError && (
          <div className="flex items-center justify-center gap-2">
            <X className="w-5 h-5" />
            <p className="text-sm text-gray-500">Terjadi kesalahan</p>{" "}
          </div>
        )}
        {!isLoading &&
          items &&
          items.map((r: Report) => (<ReportListItem key={r.id} r={r} />))}
      </div>
      {/* <Card>
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
              </Button>x
            </Link>
          )}
        </CardContent>
      </Card> */}
      {!isLoading && items.length === 0 ? (
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
      ) : totalPages > 1 ? (
        <div className="text-center">
          <div className="inline-flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Sebelumnya
            </Button>
            <span className="text-sm text-gray-600 self-center">
              Hal {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ReportsPage;
