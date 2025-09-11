import { Card, CardContent } from "../ui/Card";
import Skeleton from "../ui/Skeleton";

export default function AnnouncementListItemSkeleton() {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Main */}
          <div className="flex-1 space-y-3">
            {/* Title + badges */}
            <div className="space-y-2">
              {/* Title skeleton */}
              <Skeleton className="h-6 w-3/4" />

              {/* Badges skeleton */}
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>

            {/* Content snippet skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>

            {/* Meta information skeleton */}
            <div className="flex items-center gap-4">
              {/* Date skeleton */}
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>

              {/* Author skeleton */}
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
              </div>

              {/* Attachments skeleton */}
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
