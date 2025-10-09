import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  ArrowRight,
  Megaphone,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import StatusDonutChart from "./components/StatusDonutChart";
import CategoryBarChart from "./components/CategoryBarChart";
import AdminDashboardSkeleton from "./components/AdminDashboardSkeleton";
import { useAuthContext } from "../../contexts/AuthContext";
import {
  getDashboardStats,
  type DashboardStats,
} from "../../services/reportService";
import { getAnnouncementsCount } from "../../services/announcementService";

const AdminDashboard: React.FC = () => {
  const { user } = useAuthContext();
  const [selectedPeriod, setSelectedPeriod] = useState("30");

  // State for real data - simple approach like AnnouncementsPage
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(
    null
  );
  const [totalAnnouncements, setTotalAnnouncements] = useState<number>(0);

  // Fetch dashboard data - simple approach like AnnouncementsPage
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Convert selectedPeriod to days for filtering
      const daysBack = selectedPeriod ? parseInt(selectedPeriod) : undefined;

      const [stats, announcementsCount] = await Promise.all([
        getDashboardStats(daysBack),
        getAnnouncementsCount(daysBack),
      ]);

      setDashboardData(stats);
      setTotalAnnouncements(announcementsCount);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod, fetchDashboardData]);

  // Generate statistics cards from real data
  const getStats = () => {
    if (!dashboardData) return [];

    return [
      {
        title: "Total Laporan",
        value: dashboardData.totalReports.toString(),
        icon: FileText,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        href: "/admin/reports",
      },
      {
        title: "Menunggu Tindakan",
        value: dashboardData.pendingReports.toString(),
        icon: Clock,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        href: "/admin/reports",
      },
      {
        title: "Total Pengumuman",
        value: totalAnnouncements.toString(),
        icon: Megaphone,
        color: "text-green-600",
        bgColor: "bg-green-100",
        href: "/admin/announcements",
      },
      {
        title: "Warga Aktif",
        value: dashboardData.activeUsers.toString(),
        icon: Users,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        href: "/admin/users",
      },
    ];
  };

  // Generate status chart data from real data (excludes CLOSED reports)
  const getStatusChartData = () => {
    if (!dashboardData) return [];

    return [
      {
        name: "Pending",
        value: dashboardData.pendingReports,
        color: "#f59e0b",
        bgColor: "bg-yellow-100",
      },
      {
        name: "Proses",
        value: dashboardData.inProgressReports || 0,
        color: "#3b82f6",
        bgColor: "bg-blue-100",
      },
      {
        name: "Selesai",
        value: dashboardData.resolvedReports,
        color: "#10b981",
        bgColor: "bg-green-100",
      },
      {
        name: "Ditolak",
        value: dashboardData.rejectedReports || 0,
        color: "#ef4444",
        bgColor: "bg-red-100",
      },
    ];
  };

  // Generate category chart data from real data (excludes CLOSED reports, shows all categories regardless of isPublic)
  const getCategoryChartData = () => {
    if (!dashboardData) return [];

    const categoryColors = {
      INFRASTRUCTURE: "#3b82f6",
      CLEANLINESS: "#10b981",
      LIGHTING: "#f59e0b",
      SECURITY: "#ef4444",
      UTILITIES: "#8b5cf6",
      ENVIRONMENT: "#06b6d4",
      SUGGESTION: "#f97316",
      OTHER: "#6b7280",
    };

    const categoryLabels = {
      INFRASTRUCTURE: "Infrastruktur",
      CLEANLINESS: "Kebersihan",
      LIGHTING: "Penerangan",
      SECURITY: "Keamanan",
      UTILITIES: "Utilitas",
      ENVIRONMENT: "Lingkungan",
      SUGGESTION: "Saran",
      OTHER: "Lainnya",
    };

    return dashboardData.categoryStats.map((item) => ({
      name:
        categoryLabels[item.category as keyof typeof categoryLabels] ||
        item.category,
      count: item.count,
      color:
        categoryColors[item.category as keyof typeof categoryColors] ||
        "#6b7280",
    }));
  };

  // Mock recent activities - simplified
  const recentActivities = [
    {
      id: "1",
      type: "NEW_REPORT",
      message: 'Laporan baru: "Jalan berlubang di RT 05"',
      user: "Budi Santoso",
      time: "2 jam lalu",
      icon: FileText,
    },
    {
      id: "2",
      type: "STATUS_UPDATE",
      message: 'Laporan "Lampu jalan mati" selesai ditindaklanjuti',
      user: "Admin RT",
      time: "4 jam lalu",
      icon: CheckCircle,
    },
    {
      id: "3",
      type: "NEW_ANNOUNCEMENT",
      message: 'Pengumuman baru: "Rapat Bulanan RT"',
      user: "Admin RT",
      time: "6 jam lalu",
      icon: Megaphone,
    },
    {
      id: "4",
      type: "NEW_COMMENT",
      message: "Komentar baru pada laporan infrastruktur",
      user: "Siti Aminah",
      time: "1 hari lalu",
      icon: MessageSquare,
    },
  ];

  const periodOptions = [
    { value: "7", label: "7 Hari Terakhir" },
    { value: "30", label: "30 Hari Terakhir" },
    { value: "90", label: "3 Bulan Terakhir" },
    { value: "365", label: "1 Tahun Terakhir" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Admin RT
          </h1>
          <p className="text-gray-600 mt-1">
            Selamat datang, {user?.name}. Overview sistem RT Anda.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Select
            options={periodOptions}
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-48"
          />
        </div>
      </div>

      {/* Loading State - Simple approach like AnnouncementsPage */}
      {loading && (
        <>
          {/* Show skeleton items while loading */}
          <AdminDashboardSkeleton />
        </>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>Terjadi kesalahan saat memuat data: {error}</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Muat Ulang
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content - Simple approach like AnnouncementsPage */}
      {!loading && !error && dashboardData && (
        <div>
          {/* Statistics Cards - Clickable for navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {getStats().map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Link key={index} to={stat.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            {stat.title}
                          </p>
                          <p className="text-3xl font-bold text-gray-900 mb-1">
                            {stat.value}
                          </p>
                        </div>
                        <div className={`p-3 rounded-full ${stat.bgColor}`}>
                          <Icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Quick Actions & Overview */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mt-8">
            {/* Status Chart */}
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                  Status Laporan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatusDonutChart data={getStatusChartData()} />
              </CardContent>
            </Card>

            {/* Category Chart */}
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-500" />
                  Kategori Laporan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryBarChart data={getCategoryChartData()} />
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="xl:col-span-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-green-500" />
                  Aktivitas Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  {recentActivities.slice(0, 4).map((activity) => {
                    const Icon = activity.icon;

                    return (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Icon className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 mb-1">
                            {activity.message}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <span>{activity.user}</span>
                            <span className="mx-1">•</span>
                            <span>{activity.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-2 border-t border-gray-100">
                  <Link to="/admin/activities">
                    <Button variant="ghost" size="sm" className="w-full">
                      Lihat Semua Aktivitas
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
