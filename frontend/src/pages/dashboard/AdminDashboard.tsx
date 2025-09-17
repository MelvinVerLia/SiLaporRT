// src/pages/dashboard/AdminDashboard.tsx
import React, { useState } from "react";
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
import { useAuthContext } from "../../contexts/AuthContext";

const AdminDashboard: React.FC = () => {
  const { user } = useAuthContext();
  const [selectedPeriod, setSelectedPeriod] = useState("30");

  // Mock statistics data
  const stats = [
    {
      title: "Total Laporan",
      value: "127",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      href: "/admin/reports",
    },
    {
      title: "Menunggu Tindakan",
      value: "23",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      href: "/admin/reports?status=pending",
    },
    {
      title: "Total Pengumuman",
      value: "45",
      icon: Megaphone,
      color: "text-green-600",
      bgColor: "bg-green-100",
      href: "/admin/announcements",
    },
    {
      title: "Warga Aktif",
      value: "89",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      href: "/admin/users",
    },
  ];

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

  // Chart data
  const statusChartData = [
    {
      name: "Pending",
      value: 23,
      color: "#f59e0b",
      bgColor: "bg-yellow-100",
    },
    {
      name: "Proses",
      value: 18,
      color: "#3b82f6",
      bgColor: "bg-blue-100",
    },
    {
      name: "Selesai",
      value: 78,
      color: "#10b981",
      bgColor: "bg-green-100",
    },
    {
      name: "Ditolak",
      value: 8,
      color: "#ef4444",
      bgColor: "bg-red-100",
    },
  ];

  const categoryChartData = [
    { name: "Infrastruktur", count: 35, color: "#3b82f6" },
    { name: "Kebersihan", count: 28, color: "#10b981" },
    { name: "Penerangan", count: 22, color: "#f59e0b" },
    { name: "Keamanan", count: 18, color: "#ef4444" },
    { name: "Utilitas", count: 15, color: "#8b5cf6" },
    { name: "Lingkungan", count: 9, color: "#06b6d4" },
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

      {/* Statistics Cards - Clickable for navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Status Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
              Status Laporan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatusDonutChart data={statusChartData} />
          </CardContent>
        </Card>

        {/* Category Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-500" />
              Kategori Laporan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryBarChart data={categoryChartData} />
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-4">
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
                  <div key={activity.id} className="flex items-start space-x-3">
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
  );
};

export default AdminDashboard;
