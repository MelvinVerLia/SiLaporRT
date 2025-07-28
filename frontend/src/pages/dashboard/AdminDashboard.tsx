// src/pages/dashboard/AdminDashboard.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  Filter,
  Search,
  Eye,
  Edit,
  MessageCircle,
  MapPin,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { useAuth } from "../../hooks/useAuth";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock statistics data
  const stats = [
    {
      title: "Total Laporan",
      value: "127",
      change: "+12%",
      changeType: "increase" as const,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Menunggu Tindakan",
      value: "23",
      change: "+5",
      changeType: "increase" as const,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Selesai Bulan Ini",
      value: "45",
      change: "+18%",
      changeType: "increase" as const,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Warga Aktif",
      value: "89",
      change: "+7",
      changeType: "increase" as const,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  // Mock recent reports needing attention
  const pendingReports = [
    {
      id: "1",
      title: "Jalan berlubang besar di RT 05",
      category: "INFRASTRUCTURE",
      status: "PENDING",
      priority: "HIGH",
      upvoteCount: 12,
      commentCount: 5,
      location: {
        address: "Jl. Mawar No. 45",
        rt: "05",
      },
      user: {
        name: "Budi Santoso",
      },
      createdAt: "2024-01-20T08:30:00Z",
      daysSinceReported: 2,
    },
    {
      id: "2",
      title: "Lampu jalan mati sudah 5 hari",
      category: "LIGHTING",
      status: "PENDING",
      priority: "MEDIUM",
      upvoteCount: 8,
      commentCount: 3,
      location: {
        address: "Gang Melati",
        rt: "03",
      },
      user: {
        name: "Siti Aminah",
      },
      createdAt: "2024-01-19T15:20:00Z",
      daysSinceReported: 3,
    },
    {
      id: "3",
      title: "Sampah menumpuk di TPS",
      category: "CLEANLINESS",
      status: "IN_PROGRESS",
      priority: "HIGH",
      upvoteCount: 15,
      commentCount: 7,
      location: {
        address: "TPS RT 04",
        rt: "04",
      },
      user: {
        name: "Ahmad Wijaya",
      },
      createdAt: "2024-01-18T10:15:00Z",
      daysSinceReported: 4,
    },
  ];

  // Mock category distribution
  const categoryStats = [
    { category: "INFRASTRUCTURE", count: 35, percentage: 28 },
    { category: "CLEANLINESS", count: 28, percentage: 22 },
    { category: "LIGHTING", count: 22, percentage: 17 },
    { category: "SECURITY", count: 18, percentage: 14 },
    { category: "UTILITIES", count: 15, percentage: 12 },
    { category: "ENVIRONMENT", count: 9, percentage: 7 },
  ];

  // Mock recent activities
  const recentActivities = [
    {
      id: "1",
      type: "NEW_REPORT",
      message: 'Laporan baru: "Jalan berlubang di RT 05"',
      user: "Budi Santoso",
      time: "2 jam lalu",
    },
    {
      id: "2",
      type: "STATUS_UPDATE",
      message: 'Status laporan "Lampu jalan mati" diubah ke "Dalam Proses"',
      user: "Pak RT",
      time: "4 jam lalu",
    },
    {
      id: "3",
      type: "NEW_COMMENT",
      message: 'Komentar baru pada laporan "Sampah menumpuk"',
      user: "Siti Aminah",
      time: "6 jam lalu",
    },
    {
      id: "4",
      type: "REPORT_RESOLVED",
      message: 'Laporan "Got tersumbat" ditandai selesai',
      user: "Pak RT",
      time: "1 hari lalu",
    },
  ];

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "PENDING", label: "Menunggu" },
    { value: "IN_PROGRESS", label: "Dalam Proses" },
    { value: "RESOLVED", label: "Selesai" },
    { value: "REJECTED", label: "Ditolak" },
  ];

  const periodOptions = [
    { value: "7", label: "7 Hari Terakhir" },
    { value: "30", label: "30 Hari Terakhir" },
    { value: "90", label: "3 Bulan Terakhir" },
    { value: "365", label: "1 Tahun Terakhir" },
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

  const getPriorityBadge = (priority: string) => {
    const variants = {
      HIGH: { variant: "danger" as const, label: "Tinggi" },
      MEDIUM: { variant: "warning" as const, label: "Sedang" },
      LOW: { variant: "default" as const, label: "Rendah" },
    };
    return variants[priority as keyof typeof variants] || variants.MEDIUM;
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

  const getActivityIcon = (type: string) => {
    const icons = {
      NEW_REPORT: FileText,
      STATUS_UPDATE: Edit,
      NEW_COMMENT: MessageCircle,
      REPORT_RESOLVED: CheckCircle,
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Admin RT
          </h1>
          <p className="text-gray-600 mt-1">
            Selamat datang, {user?.name}. Kelola laporan dan monitor aktivitas
            warga.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Select
            options={periodOptions}
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-48"
          />
          <Link to="/create-report">
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Buat Pengumuman
            </Button>
          </Link>
        </div>
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
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </p>
                    <div className="flex items-center">
                      <span
                        className={`text-sm font-medium ${
                          stat.changeType === "increase"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stat.changeType === "increase" ? "↗" : "↘"}{" "}
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">
                        dari bulan lalu
                      </span>
                    </div>
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports Needing Attention */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                  Laporan Perlu Perhatian
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Cari laporan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-48"
                    />
                  </div>
                  <Select
                    options={statusOptions}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-40"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingReports.map((report) => {
                  const statusInfo = getStatusBadge(report.status);
                  const priorityInfo = getPriorityBadge(report.priority);

                  return (
                    <div
                      key={report.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 mb-2">
                              {report.title}
                            </h4>
                            <div className="flex items-center space-x-2 ml-4">
                              <Badge variant={priorityInfo.variant} size="sm">
                                {priorityInfo.label}
                              </Badge>
                              <Badge variant={statusInfo.variant} size="sm">
                                {statusInfo.label}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center">
                              <MapPin className="mr-1 h-4 w-4" />
                              {report.location.address} (RT {report.location.rt}
                              )
                            </span>
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-4 w-4" />
                              {report.daysSinceReported} hari lalu
                            </span>
                            <span>oleh {report.user.name}</span>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <TrendingUp className="mr-1 h-4 w-4" />
                              {report.upvoteCount} dukungan
                            </span>
                            <span className="flex items-center">
                              <MessageCircle className="mr-1 h-4 w-4" />
                              {report.commentCount} komentar
                            </span>
                            <Badge variant="default" size="sm">
                              {getCategoryLabel(report.category)}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link to={`/reports/${report.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-1 h-4 w-4" />
                              Lihat
                            </Button>
                          </Link>
                          <Button size="sm">
                            <Edit className="mr-1 h-4 w-4" />
                            Tanggapi
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 text-center">
                <Link to="/reports">
                  <Button variant="outline">Lihat Semua Laporan</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Statistik Kategori
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryStats.map((item) => (
                  <div key={item.category}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {getCategoryLabel(item.category)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {item.count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Aktivitas Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);

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

              <div className="mt-4 text-center">
                <Button variant="ghost" size="sm">
                  Lihat Semua Aktivitas
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/create-report" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Buat Pengumuman
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Kelola Warga
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                Laporan Bulanan
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Broadcast Pesan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
