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
    <div className="space-y-16">
      {/* Hero Section */}  
      <section>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Laporkan Masalah
                <span className="block text-blue-600">Lingkungan Anda</span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 mb-8 leading-relaxed">
                Platform digital untuk warga RT melaporkan masalah
                infrastruktur, kebersihan, dan keamanan lingkungan secara cepat,
                transparan, dan terorganisir.
              </p>

              {/* Integrated Statistics */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 lg:gap-8 mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div
                      className={`text-2xl lg:text-3xl font-bold ${stat.color} mb-1`}
                    >
                      {stat.value}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600 font-medium">
                      {stat.title}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              {isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
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
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
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

            {/* Right Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <img
                  src="/assets/hero.png"
                  alt="Platform Pelaporan RT"
                  className="w-full max-w-lg h-auto object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <Card>
          <CardHeader>
            <div className="text-center">
              <div className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
                SISTEM PELAPORAN RT
              </div>
              <CardTitle className="text-2xl lg:text-3xl font-bold leading-tight mb-3">
                Platform yang tumbuh bersama komunitas Anda
              </CardTitle>
              <p className="text-gray-600 leading-relaxed">
                Dirancang sebagai sistem pelaporan yang dapat beradaptasi dengan
                kebutuhan RT dan mempermudah pengelolaan laporan warga secara
                transparan dan efisien.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {features.slice(0, 6).map((feature, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
    </div>
  );
};

export default HomePage;
