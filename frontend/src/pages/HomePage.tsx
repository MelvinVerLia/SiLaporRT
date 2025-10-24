import React, { useEffect } from "react";
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
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import { getRecentReports } from "../services/reportService";
import { Report } from "../types/report.types";
import { useQuery } from "@tanstack/react-query";
import ReportListItem from "./reports/ReportListItem";
import FaqItems from "../components/faq/FaqItems";
import ReportListItemSkeleton from "./reports/components/ReportListItemSkeleton";
import { useAuthContext } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["recent-reports"],
    queryFn: getRecentReports,
  });
  const toast = useToast();
  
  useEffect(() => {
    toast.success(
      "Selamat datang di Aplikasi Pengaduan Masyarakat",
      "Selamat Datang"
    );
    // toast.error("Selamat datang di Aplikasi Pengaduan Masyarakat", "Selamat Datang");
    // toast.info("Selamat datang di Aplikasi Pengaduan Masyarakat", "Selamat Datang");
  }, []);
  const items = data?.items ?? [];

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

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Laporkan Masalah
              <span className="block text-blue-600">Lingkungan Anda</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-8 leading-relaxed">
              Platform digital untuk warga RT melaporkan masalah infrastruktur,
              kebersihan, dan keamanan lingkungan secara cepat, transparan, dan
              terorganisir.
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
                Fitur Unggulan SiLaporRT
              </CardTitle>
              <p className="text-gray-600 leading-relaxed">
                Fitur-fitur inovatif untuk memudahkan warga melaporkan masalah,
                berkolaborasi, dan meningkatkan kualitas lingkungan secara
                bersama-sama.
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
                  Lihat Semua
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading && (
                <>
                  {/* Show 3 skeleton items while loading */}
                  {Array.from({ length: 3 }).map((_, index) => (
                    <ReportListItemSkeleton key={`skeleton-${index}`} />
                  ))}
                </>
              )}
              {isError && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Gagal Memuat Laporan Terbaru
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Terjadi kesalahan saat memuat data laporan terbaru.
                      Silakan coba lagi.
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
                items &&
                items.map((r: Report) => <ReportListItem key={r.id} r={r} />)}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAQ Section */}
      <section>
        <FaqItems />
      </section>
    </div>
  );
};

export default HomePage;
