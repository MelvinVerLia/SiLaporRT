import React from "react";
import { Card, CardContent } from "../../../components/ui/Card";

const ReportListItemSkeleton: React.FC = () => {
  return (
    <Card className="animate-pulse hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Main Content */}
          <div className="flex-1 space-y-3">
            {/* Title */}
            <div className="space-y-2">
              <div className="h-6 w-3/4 bg-gray-200 rounded"></div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                <div className="h-6 w-14 bg-gray-200 rounded-full"></div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
              <div className="h-4 w-48 bg-gray-200 rounded"></div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Upvote count */}
                <div className="flex items-center gap-1">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-6 bg-gray-200 rounded"></div>
                </div>

                {/* Comment count */}
                <div className="flex items-center gap-1">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-6 bg-gray-200 rounded"></div>
                </div>

                {/* Attachment */}
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>

              {/* Created at */}
              <div className="flex items-center gap-1">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Author */}
            <div className="h-4 w-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportListItemSkeleton;
