import React from "react";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card";

const ReportDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center space-x-2">
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
        <div className="h-4 w-2 bg-gray-200 rounded"></div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>

      {/* Report Header Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                <div className="h-6 w-14 bg-gray-200 rounded-full"></div>
              </div>

              {/* Title */}
              <div className="space-y-2 mb-4">
                <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-8 w-1/2 bg-gray-200 rounded"></div>
              </div>

              {/* Meta info */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-40 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-16 bg-gray-200 rounded"></div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments Card */}
          <Card>
            <CardHeader>
              <div className="h-6 w-20 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="aspect-video bg-gray-200 rounded-lg"></div>
                <div className="aspect-video bg-gray-200 rounded-lg"></div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Card */}
          <Card>
            <CardHeader>
              <div className="h-6 w-36 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              {/* Comment Form */}
              <div className="mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="flex justify-end">
                      <div className="h-8 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded-full"></div>
                        <div className="h-4 w-20 bg-gray-200 rounded"></div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Report Info Card */}
          <Card>
            <CardHeader>
              <div className="h-6 w-24 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index}>
                  <div className="h-4 w-16 bg-gray-200 rounded mb-1"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <div className="h-6 w-20 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-8 w-full bg-gray-200 rounded"></div>
              <div className="h-8 w-full bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailSkeleton;
