import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Users,
  MapPin,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  getRecentReports,
  getAllReportsStatistic,
} from "../../services/reportService";
import { Report } from "../../types/report.types";
import { useQuery } from "@tanstack/react-query";
import ReportListItem from "../reports/ReportListItem";
import FaqItems from "./components/FaqItems";
import ReportListItemSkeleton from "../reports/components/ReportListItemSkeleton";
import { useAuthContext } from "../../contexts/AuthContext";
import CountUp from "react-countup";

const HomePage: React.FC = () => {
  const { isAuthenticated, getAllUsersCount } = useAuthContext();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["recent-reports"],
    queryFn: getRecentReports,
  });
  const [userTotal, setUserTotal] = useState<number>(0);
  const [reportTotal, setReportTotal] = useState<number>(0);
  const [inProgressTotal, setInProgressTotal] = useState<number>(0);
  const [resolvedTotal, setResolvedTotal] = useState<number>(0);

  // const toast = useToast();
  // useEffect(() => {
  //   toast.success(
  //     "Selamat datang di Aplikasi Pengaduan Masyarakat",
  //     "Selamat Datang"
  //   );
  // }, []);

  const items = data?.items ?? [];

  const fetchAllUserCount = async () => {
    const count = await getAllUsersCount();
    setUserTotal(count.data);
  };

  const fetchAllReportCount = async () => {
    const count = await getAllReportsStatistic();
    console.log(count);
    setReportTotal(count.total);
    setInProgressTotal(count.progress);
    setResolvedTotal(count.finished);
  };

  useEffect(() => {
    fetchAllUserCount();
    fetchAllReportCount();
  }, []);

  const stats = [
    {
      title: "Total Laporan",
      value: reportTotal,
      icon: FileText,
      color: "text-primary-600",
      bgColor: "bg-primary-100",
    },
    {
      title: "Sedang Diproses",
      value: inProgressTotal,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Sudah Selesai",
      value: resolvedTotal,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Warga Aktif",
      value: userTotal,
      icon: MapPin,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const features = [
    {
      imageUrl: "/assets/map.webp",
      title: "Pelaporan Lokasi Nyata",
      description:
        "Laporan terintegrasi dengan peta interaktif untuk menunjukkan lokasi kejadian secara akurat",
    },
    {
      imageUrl: "/assets/documentation.webp",
      title: "Dokumentasi Visual",
      description:
        "Upload foto dan media pendukung untuk memperjelas konteks laporan Anda",
    },
    {
      imageUrl: "/assets/community.webp",
      title: "Diskusi & Voting Komunitas",
      description:
        "Warga dapat berdiskusi, memberikan masukan, dan memberi dukungan agar laporan diprioritaskan",
    },
    {
      imageUrl: "/assets/response.webp",
      title: "Tanggapan Resmi RT",
      description:
        "Admin RT memberikan balasan dan update progress penanganan secara transparan",
    },
  ];

  return (
    <div className="space-y-24">
      <section>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-primary-500 mb-6 leading-tight">
              Laporkan Masalah
              <span className="block text-primary-600">Lingkungan Anda</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-8 leading-relaxed">
              Platform digital untuk warga RT melaporkan masalah infrastruktur,
              kebersihan, dan keamanan lingkungan secara cepat, transparan, dan
              terorganisir.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-6 lg:gap-8 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-5xl font-extrabold text-center text-black lg:text-left"
                >
                  <div
                    className={`text-2xl lg:text-3xl font-bold ${stat.color} mb-1`}
                  >
                    <CountUp start={0} end={stat.value} duration={1} useEasing={false} delay={0.5} />
                  </div>
                  <div className="text-xs lg:text-sm text-gray-600 font-medium">
                    {stat.title}
                  </div>
                </div>
              ))}
            </div>

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

          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <img
                src="/assets/hero.webp"
                alt="Platform Pelaporan RT"
                className="w-full max-w-lg h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold leading-tight mb-3">
            Fitur-fitur SiLaporRT
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Fitur-fitur inovatif untuk memudahkan warga melaporkan masalah,
            berkolaborasi, dan meningkatkan kualitas lingkungan secara
            bersama-sama.
          </p>
        </div>

        {/* Row pertama (2 features) - Aligned Left */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10 lg:pr-32">
          {features.slice(0, 2).map((feature, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              <img
                src={feature.imageUrl}
                alt={feature.title}
                className="w-full h-40 object-contain"
              />
              <div className="p-4 pt-0 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Row kedua (2 features) - Aligned Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:pl-32">
          {features.slice(2, 4).map((feature, index) => (
            <div
              key={index + 2}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              <img
                src={feature.imageUrl}
                alt={feature.title}
                className="w-full h-40 object-contain"
              />
              <div className="p-4 pt-0 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

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

              {!isLoading && items.length > 0 ? (
                items.map((r: Report) => <ReportListItem key={r.id} r={r} />)
              ) : (
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
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <FaqItems />
      </section>
    </div>
  );
};

export default HomePage;
