import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listAnnouncements } from "../../services/announcementService";
import {
  AnnouncementType,
  Priority,
  Announcement,
} from "../../types/announcement.types";
import AnnouncementListItem from "../../components/announcements/AnnouncementListItem";
import { Card, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { Search, FileText } from "lucide-react";

const typeOptions = [
  { value: "", label: "Semua Jenis" },
  { value: AnnouncementType.GENERAL, label: "Umum" },
  { value: AnnouncementType.URGENT, label: "Mendesak" },
  { value: AnnouncementType.EVENT, label: "Acara" },
  { value: AnnouncementType.MAINTENANCE, label: "Pemeliharaan" },
  { value: AnnouncementType.REGULATION, label: "Peraturan" },
];

const priorityOptions = [
  { value: "", label: "Semua Prioritas" },
  { value: Priority.LOW, label: "Rendah" },
  { value: Priority.NORMAL, label: "Normal" },
  { value: Priority.HIGH, label: "Tinggi" },
  { value: Priority.URGENT, label: "Urgent" },
];

export default function AnnouncementsPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["announcements", { page, pageSize, q, type, priority }],
    queryFn: () =>
      listAnnouncements({
        page,
        pageSize,
        q,
        type: type as AnnouncementType | undefined,
        priority: priority as Priority | undefined,
        pinnedFirst: true,
      }),
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pengumuman</h1>
        <p className="text-gray-600 mt-1">Informasi resmi dari Admin RT</p>
      </div>

      {/* Filters (mirip ReportsPage) */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari pengumuman…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              options={typeOptions}
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              placeholder="Pilih jenis"
            />

            <Select
              options={priorityOptions}
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              placeholder="Pilih prioritas"
            />
          </div>

          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setPage(1);
                refetch();
              }}
              loading={isFetching}
            >
              Terapkan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-4">
        {isLoading && <p className="text-sm text-gray-500">Memuat…</p>}
        {isError && <p className="text-sm text-red-600">Gagal memuat data.</p>}

        {!isLoading &&
          items.map((a: Announcement) => (
            <AnnouncementListItem key={a.id} a={a} />
          ))}
      </div>

      {/* Empty / Pagination */}
      {!isLoading && items.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Belum Ada Pengumuman
            </h3>
            <p className="text-gray-600">
              Pengumuman akan muncul di sini ketika tersedia.
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
}
