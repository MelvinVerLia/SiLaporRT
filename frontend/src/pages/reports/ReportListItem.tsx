import { Link } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { Report } from "../../types/report.types";
import { Clock, MapPin, MessageCircle, ThumbsUp } from "lucide-react";
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
    <Link to={`/reports/${r.id}`}>
      <Card key={r.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            {/* Main Content */}
            <div className="flex-1 space-y-3">
              {/* Title and Badges */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
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

              {/* Description */}
              <p className="text-gray-600 text-sm line-clamp-2">
                {r.description}
              </p>

              {/* Location */}
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="mr-1 h-4 w-4" />
                <span>{r.location.address}</span>
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <ThumbsUp className="mr-1 h-4 w-4" />
                    {r.upvoteCount}
                  </span>
                  <span className="flex items-center">
                    <MessageCircle className="mr-1 h-4 w-4" />
                    {r.commentCount}
                  </span>
                  {r.attachments.length > 0 && (
                    <span>📎 {r.attachments.length} file</span>
                  )}
                </div>

                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>
                    {formatDistanceToNow(new Date(r.createdAt), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </span>
                </div>
              </div>

              {/* Author */}
              <div className="text-sm text-gray-500">
                Dilaporkan oleh: {r.isAnonymous ? "Anonim" : r.user?.name}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ReportListItem;
