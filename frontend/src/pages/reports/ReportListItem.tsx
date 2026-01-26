import { Link } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { Report } from "../../types/report.types";
import {
  Clock,
  MapPin,
  MessageCircle,
  Paperclip,
  ThumbsUp,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

const ReportListItem = ({ r }: { r: Report }) => {
  const getCategoryLabel = (category: string) => {
    const labels = {
      INFRASTRUCTURE: "Infrastruktur",
      LIGHTING: "Penerangan",
      CLEANLINESS: "Kebersihan",
      SECURITY: "Keamanan",
      UTILITIES: "Utilitas",
      ENVIRONMENT: "Lingkungan",
      OTHER: "Lainnya",
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { variant: "warning" as const, label: "Menunggu" },
      IN_PROGRESS: { variant: "info" as const, label: "Proses" },
      RESOLVED: { variant: "success" as const, label: "Selesai" },
      REJECTED: { variant: "danger" as const, label: "Ditolak" },
    };
    return variants[status as keyof typeof variants] || variants.PENDING;
  };

  const statusInfo = getStatusBadge(r.status);
  return (
    <Card className="hover:shadow-md transition-shadow">
      <Link to={`/reports/${r.id}`}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-100 whitespace-pre-wrap break-words line-clamp-1">
                  {r.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default" size="sm">
                    {getCategoryLabel(r.category)}
                  </Badge>
                  <Badge variant={statusInfo.variant} size="sm">
                    {statusInfo.label}
                  </Badge>
                  {r.isAnonymous && (
                    <Badge variant="default" size="sm">
                      Anonim
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 sm:line-clamp-3 break-words">
                {r.description}
              </p>

              <div
                className="flex items-center text-sm text-gray-500 dark:text-gray-300"
                title={r.location.address}
              >
                <MapPin className="mr-1 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{r.location.address}</span>
              </div>

              <div className="flex items-center gap-x-3 sm:gap-x-4 text-xs sm:text-sm text-gray-500 dark:text-gray-300">
                <span className="flex items-center">
                  <ThumbsUp className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {r.upvoteCount}
                </span>
                <span className="flex items-center">
                  <MessageCircle className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {r.commentCount}
                </span>
                {r.attachments.length > 0 && (
                  <span className="hidden sm:flex items-center">
                    <Paperclip className="mr-1 h-4 w-4" />
                    {r.attachments.length} file
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-500 dark:text-gray-300">
                <span className="flex items-center">
                  <User className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">
                    {r.isAnonymous
                      ? "Anonim"
                      : r.user?.isDeleted
                        ? "Pengguna Terhapus"
                        : r.user?.name}
                  </span>
                </span>
                <span className="flex items-center">
                  <Clock className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    {formatDistanceToNow(new Date(r.createdAt), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default ReportListItem;
