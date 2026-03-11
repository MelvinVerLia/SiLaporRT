import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Search,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  adminListCitizens,
  verifyCitizen,
  rejectCitizen,
  Citizen,
} from "../../services/citizenService";
import Button from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import Input from "../../components/ui/Input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/Tabs";
import CitizenTableSkeleton from "./components/CitizenTableSkeleton";
import { useToast } from "../../hooks/useToast";

const VERIFICATION_TABS = [
  { value: "", label: "Semua" },
  { value: "PENDING", label: "Menunggu" },
  { value: "VERIFIED", label: "Terverifikasi" },
  { value: "REJECTED", label: "Ditolak" },
] as const;

function getStatusBadge(status: string) {
  switch (status) {
    case "VERIFIED":
      return (
        <Badge variant="success" size="sm">
          Terverifikasi
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="danger" size="sm">
          Ditolak
        </Badge>
      );
    default:
      return (
        <Badge variant="warning" size="sm">
          Menunggu
        </Badge>
      );
  }
}

export default function ManageCitizensPage() {
  const qc = useQueryClient();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-citizens", { page, pageSize, q, activeTab }],
    queryFn: () =>
      adminListCitizens({
        page,
        pageSize,
        q,
        verificationStatus: activeTab || undefined,
      }),
    staleTime: 0,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleVerify = async (e: React.MouseEvent, citizen: Citizen) => {
    e.stopPropagation();
    setActionId(citizen.id);
    try {
      await verifyCitizen(citizen.id);
      toast.success("Warga berhasil diverifikasi", "Berhasil");
      qc.invalidateQueries({ queryKey: ["admin-citizens"] });
    } catch {
      toast.error("Gagal memverifikasi warga", "Gagal");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (e: React.MouseEvent, citizen: Citizen) => {
    e.stopPropagation();
    setActionId(citizen.id);
    try {
      await rejectCitizen(citizen.id);
      toast.success("Verifikasi warga ditolak", "Berhasil");
      qc.invalidateQueries({ queryKey: ["admin-citizens"] });
    } catch {
      toast.error("Gagal menolak verifikasi warga", "Gagal");
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary-600">Kelola Warga</h1>
        <p className="text-gray-600 dark:text-gray-200 mt-1">
          Verifikasi dan kelola data warga terdaftar di RT Anda
        </p>
      </div>

      {/* Citizens List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <CardTitle>Daftar Warga</CardTitle>
              <Badge variant="default" size="sm">
                {total} total
              </Badge>
            </div>

            <form
              onSubmit={handleSearch}
              className="flex gap-2 w-full lg:w-auto"
            >
              <Input
                placeholder="Cari nama, email, telepon..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full md:w-64"
              />
              <Button type="submit" variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-6">
              {VERIFICATION_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Shared content for all tabs */}
            {VERIFICATION_TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                {isLoading ? (
                  <CitizenTableSkeleton />
                ) : isError ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="mx-auto h-8 w-8 text-red-400 mb-2" />
                    <p className="text-red-600">Gagal memuat data warga</p>
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Tidak ada warga
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Belum ada warga yang sesuai dengan filter yang dipilih
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="min-w-full table-fixed">
                        <colgroup>
                          <col className="w-[28%]" />
                          <col className="w-[22%]" />
                          <col className="w-[20%]" />
                          <col className="w-[12%]" />
                          <col className="w-[18%]" />
                        </colgroup>
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-4 pr-6 text-sm font-medium text-gray-600 dark:text-gray-300">
                              Warga
                            </th>
                            <th className="text-left py-4 pr-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                              Kontak
                            </th>
                            <th className="text-left py-4 pr-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                              Alamat
                            </th>
                            <th className="text-left py-4 pr-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                              Status
                            </th>
                            <th className="text-left py-4 pr-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((citizen: Citizen) => (
                            <tr
                              key={citizen.id}
                              className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                              <td className="py-5 pr-6">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {citizen.profile ? (
                                      <img
                                        src={citizen.profile}
                                        alt={citizen.name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        {citizen.name.charAt(0).toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-white truncate">
                                      {citizen.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {formatDate(citizen.createdAt)}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-5 pr-4">
                                <div className="space-y-1">
                                  {citizen.email && (
                                    <p className="text-sm text-gray-700 dark:text-gray-200 flex items-center gap-1 truncate">
                                      <Mail className="h-3 w-3 flex-shrink-0 text-gray-400" />
                                      <span className="truncate">
                                        {citizen.email}
                                      </span>
                                    </p>
                                  )}
                                  {citizen.phone && (
                                    <p className="text-sm text-gray-700 dark:text-gray-200 flex items-center gap-1">
                                      <Phone className="h-3 w-3 flex-shrink-0 text-gray-400" />
                                      {citizen.phone}
                                    </p>
                                  )}
                                  {!citizen.email && !citizen.phone && (
                                    <p className="text-sm text-gray-400 italic">
                                      Tidak ada kontak
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="py-5 pr-4">
                                {citizen.address ? (
                                  <p className="text-sm text-gray-700 dark:text-gray-200 flex items-start gap-1">
                                    <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5 text-gray-400" />
                                    <span className="line-clamp-2">
                                      {citizen.address}
                                    </span>
                                  </p>
                                ) : (
                                  <p className="text-sm text-gray-400 italic">
                                    Belum diisi
                                  </p>
                                )}
                              </td>
                              <td className="py-5 pr-4">
                                {getStatusBadge(citizen.verificationStatus)}
                              </td>
                              <td className="py-5 pr-4">
                                <div className="flex gap-2">
                                  {citizen.verificationStatus !==
                                    "VERIFIED" && (
                                    <Button
                                      size="sm"
                                      variant="primary"
                                      onClick={(e) => handleVerify(e, citizen)}
                                      loading={actionId === citizen.id}
                                      disabled={actionId === citizen.id}
                                    >
                                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                      Verifikasi
                                    </Button>
                                  )}
                                  {citizen.verificationStatus !==
                                    "REJECTED" && (
                                    <Button
                                      size="sm"
                                      variant="danger"
                                      onClick={(e) => handleReject(e, citizen)}
                                      loading={actionId === citizen.id}
                                      disabled={actionId === citizen.id}
                                    >
                                      <XCircle className="h-3.5 w-3.5 mr-1" />
                                      Tolak
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-4">
                      {items.map((citizen: Citizen) => (
                        <Card
                          key={citizen.id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Header: Avatar + Name */}
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {citizen.profile ? (
                                    <img
                                      src={citizen.profile}
                                      alt={citizen.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                      {citizen.name.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white truncate">
                                    {citizen.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Bergabung {formatDate(citizen.createdAt)}
                                  </p>
                                </div>
                                {getStatusBadge(citizen.verificationStatus)}
                              </div>

                              {/* Contact Info */}
                              <div className="space-y-1 text-sm">
                                {citizen.email && (
                                  <p className="text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                                    <span className="truncate">
                                      {citizen.email}
                                    </span>
                                  </p>
                                )}
                                {citizen.phone && (
                                  <p className="text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                                    {citizen.phone}
                                  </p>
                                )}
                                {citizen.address && (
                                  <p className="text-gray-700 dark:text-gray-200 flex items-start gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
                                    <span className="line-clamp-2">
                                      {citizen.address}
                                    </span>
                                  </p>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2 pt-1">
                                {citizen.verificationStatus !== "VERIFIED" && (
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    className="flex-1"
                                    onClick={(e) => handleVerify(e, citizen)}
                                    loading={actionId === citizen.id}
                                    disabled={actionId === citizen.id}
                                  >
                                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                    Verifikasi
                                  </Button>
                                )}
                                {citizen.verificationStatus !== "REJECTED" && (
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    className="flex-1"
                                    onClick={(e) => handleReject(e, citizen)}
                                    loading={actionId === citizen.id}
                                    disabled={actionId === citizen.id}
                                  >
                                    <XCircle className="h-3.5 w-3.5 mr-1" />
                                    Tolak
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Pagination */}
                    <div className="pt-6">
                      <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        pageSize={pageSize}
                        totalItems={total}
                        onPageChange={setPage}
                        onPageSizeChange={handlePageSizeChange}
                        showPageSizeSelector={true}
                      />
                    </div>
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
