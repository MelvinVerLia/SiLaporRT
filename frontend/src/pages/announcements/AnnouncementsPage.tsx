import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listAnnouncements } from "../../services/announcementService";
import { Announcement } from "../../types/announcement.types";
import AnnouncementListItem from "../../components/announcements/AnnouncementListItem";
import AnnouncementListItemSkeleton from "../../components/announcements/AnnouncementListItemSkeleton";
import { Card, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Pagination from "../../components/ui/Pagination";
import { FileText, RefreshCw } from "lucide-react";

export default function AnnouncementsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["announcements", { page, pageSize }],
    queryFn: () =>
      listAnnouncements({
        page,
        pageSize,
        pinnedFirst: true, // Keep pinned first for important announcements
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pengumuman</h1>
          <p className="text-gray-600 mt-1">
            Informasi resmi dari Admin RT • {total} pengumuman
          </p>
        </div>

        {/* Simple refresh button for live updates */}
        <Button
          variant="outline"
          onClick={() => refetch()}
          loading={isFetching}
          className="w-full sm:w-auto"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Perbarui
        </Button>
      </div>

      {/* Announcement Feed */}
      <div className="space-y-4">
        {isLoading && (
          <>
            {/* Show 3 skeleton items while loading */}
            {Array.from({ length: 3 }).map((_, index) => (
              <AnnouncementListItemSkeleton key={`skeleton-${index}`} />
            ))}
          </>
        )}

        {isError && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-red-500 mb-2">⚠️</div>
              <p className="text-sm text-red-600">Gagal memuat pengumuman.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-3"
              >
                Coba Lagi
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading &&
          !isError &&
          items.map((a: Announcement) => (
            <AnnouncementListItem key={a.id} a={a} />
          ))}
      </div>

      {/* Empty State */}
      {!isLoading && !isError && items.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Belum Ada Pengumuman
            </h3>
            <p className="text-gray-600">
              Pengumuman dari Admin RT akan muncul di sini.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="pt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={data?.total ?? 0}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            showPageSizeSelector={true}
            pageSizeOptions={[
              { value: "5", label: "5 per halaman" },
              { value: "10", label: "10 per halaman" },
              { value: "20", label: "20 per halaman" },
            ]}
          />
        </div>
      )}
    </div>
  );
}
