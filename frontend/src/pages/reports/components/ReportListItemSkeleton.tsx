import React from "react";
import { Card, CardContent } from "../../../components/ui/Card";

const ReportListItemSkeleton: React.FC = () => {
  return (
    <Card className="animate-pulse hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Main Content */}
          <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
            {/* Title */}
            <div className="space-y-2">
              <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded sm:block"></div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>

            {/* Stats (upvote, comment, attachment) */}
            <div className="flex items-center gap-x-3 sm:gap-x-4">
              {/* Upvote count */}
              <div className="flex items-center gap-1">
                <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 sm:h-4 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>

              {/* Comment count */}
              <div className="flex items-center gap-1">
                <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 sm:h-4 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>

              {/* Attachment - hidden on mobile */}
              <div className="hidden sm:flex items-center gap-1">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>

            {/* Bottom row: Author and Time */}
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              {/* Author */}
              <div className="flex items-center gap-1">
                <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-1">
                <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 sm:h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportListItemSkeleton;
