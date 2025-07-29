import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Users,
  MapPin,
  TrendingUp,
  Camera,
  MessageSquare,
  ThumbsUp,
  Shield,
  BarChart3,
} from "lucide-react";
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
      value: "47",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Sudah Selesai",
      value: "32",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Sedang Diproses",
      value: "12",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Warga Aktif",
      value: "156",
      icon: MapPin,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
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
      comments: 5,
      timeAgo: "2 jam lalu",
      location: "Jl. Mawar Blok A",
    },
    {
      id: "2",
      title: "Lampu jalan mati area taman",
      category: "LIGHTING",
      status: "IN_PROGRESS",
      upvotes: 8,
      comments: 3,
      timeAgo: "5 jam lalu",
      location: "Taman RT 05",
    },
    {
      id: "3",
      title: "Sampah menumpuk di tempat pembuangan",
      category: "CLEANLINESS",
      status: "RESOLVED",
      upvotes: 15,
      comments: 8,
      timeAgo: "1 hari lalu",
      location: "TPS RT 05",
    },
  ];

  // Features data
  const features = [
    {
      icon: <MapPin className="w-8 h-8 text-blue-600" />,
      title: "Pelaporan Lokasi Nyata",
      description:
        "Laporan terintegrasi dengan peta interaktif untuk menunjukkan lokasi kejadian secara akurat",
    },
    {
      icon: <Camera className="w-8 h-8 text-green-600" />,
      title: "Dokumentasi Visual",
      description:
        "Upload foto dan media pendukung untuk memperjelas konteks laporan Anda",
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-purple-600" />,
      title: "Diskusi Komunitas",
      description:
        "Warga dapat berdiskusi dan memberikan masukan pada setiap laporan yang dibuat",
    },
    {
      icon: <ThumbsUp className="w-8 h-8 text-orange-600" />,
      title: "Voting Dukungan",
      description:
        "Berikan dukungan pada laporan agar dapat diprioritaskan penanganannya",
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Tanggapan Resmi RT",
      description:
        "Admin RT memberikan balasan dan update progress penanganan secara transparan",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-indigo-600" />,
      title: "Statistik & Riwayat",
      description:
        "Data laporan dan analitik untuk mendukung pengambilan keputusan lingkungan",
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
      <section className="min-h-[90vh] bg-gradient-to-b from-blue-100 to-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Laporkan Masalah
            <span className="block text-blue-600">Lingkungan Anda</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Platform digital untuk warga RT melaporkan masalah infrastruktur,
            kebersihan, dan keamanan lingkungan secara cepat, transparan, dan
            terorganisir.
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
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
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
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Masuk untuk Melaporkan
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Statistics Cards */}
      <section className="color-black py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
      </section>

      {/* Recent Reports */}
      <section>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Laporan Terbaru</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Aktivitas terkini dari warga RT
                </p>
              </div>
              <Link to="/reports">
                <Button variant="outline" size="sm">
                  Lihat Semua →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentReports.map((report) => {
                const statusInfo = getStatusBadge(report.status);
                return (
                  <div
                    key={report.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant={statusInfo.variant} size="sm">
                        {statusInfo.label}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {report.timeAgo}
                      </span>
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-2">
                      {report.title}
                    </h4>

                    <p className="text-sm text-gray-600 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {report.location}
                    </p>

                    <div className="flex items-center justify-between">
                      <Badge variant="default" size="sm">
                        {getCategoryLabel(report.category)}
                      </Badge>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {report.upvotes}
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {report.comments}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Features Section */}
      <section className="py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Fitur Unggulan
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            SiLaporRT menyediakan berbagai fitur untuk memudahkan pelaporan dan
            meningkatkan transparansi
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
