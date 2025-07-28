import React from "react";
import { Link } from "react-router-dom";
import { FileText, Users, MapPin, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { useAuth } from "../hooks/useAuth";

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // Mock statistics data
  const stats = [
    {
      title: "Total Laporan",
      value: "127",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Laporan Aktif",
      value: "23",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Warga Terlibat",
      value: "89",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Area Tercover",
      value: "5 RT",
      icon: MapPin,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  // Mock recent reports
  const recentReports = [
    {
      id: "1",
      title: "Jalan berlubang di RT 05",
      category: "INFRASTRUCTURE",
      status: "PENDING",
      upvotes: 12,
      timeAgo: "2 jam lalu",
    },
    {
      id: "2",
      title: "Lampu jalan mati",
      category: "LIGHTING",
      status: "IN_PROGRESS",
      upvotes: 8,
      timeAgo: "5 jam lalu",
    },
    {
      id: "3",
      title: "Sampah menumpuk",
      category: "CLEANLINESS",
      status: "RESOLVED",
      upvotes: 15,
      timeAgo: "1 hari lalu",
    },
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

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Selamat Datang di SiLaporRT
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Platform pelaporan digital untuk warga RT yang transparan dan efektif
        </p>

        {isAuthenticated ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/create-report">
              <Button size="lg" className="w-full sm:w-auto">
                <FileText className="mr-2 h-5 w-5" />
                Buat Laporan Baru
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Lihat Semua Laporan
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/reports">
              <Button size="lg" className="w-full sm:w-auto">
                Lihat Laporan Publik
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Masuk untuk Melaporkan
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Reports List */}
        <Card>
          <CardHeader>
            <CardTitle>Laporan Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map((report) => {
                const statusInfo = getStatusBadge(report.status);
                return (
                  <div
                    key={report.id}
                    className="flex items-start justify-between border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {report.title}
                      </h4>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="default" size="sm">
                          {getCategoryLabel(report.category)}
                        </Badge>
                        <Badge variant={statusInfo.variant} size="sm">
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>👍 {report.upvotes} dukungan</span>
                        <span>{report.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 text-center">
              <Link to="/reports">
                <Button variant="outline" size="sm">
                  Lihat Semua Laporan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* User Dashboard or Call to Action */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isAuthenticated
                ? "Dashboard Saya"
                : "Bergabung dengan Komunitas"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600 mb-4">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user?.name}
                  </h3>
                  <Badge
                    variant={user?.role === "RT_ADMIN" ? "info" : "default"}
                  >
                    {user?.role === "RT_ADMIN" ? "Admin RT" : "Warga"}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <Link to="/my-reports">
                    <Button variant="outline" className="w-full justify-start mb-4">
                      <FileText className="mr-2 h-4 w-4" />
                      Laporan Saya
                    </Button>
                  </Link>
                  <Link to="/create-report">
                    <Button className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Buat Laporan Baru
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="mb-4">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Daftar Sekarang
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Bergabunglah dengan komunitas dan mulai membuat laporan
                    untuk lingkungan yang lebih baik.
                  </p>
                </div>

                <div className="space-y-3">
                  <Link to="/register">
                    <Button className="w-full mb-4">Daftar Sebagai Warga</Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" className="w-full">
                      Sudah Punya Akun? Masuk
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
