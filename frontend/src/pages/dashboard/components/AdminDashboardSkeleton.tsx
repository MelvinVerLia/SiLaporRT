import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import Skeleton from "../../../components/ui/Skeleton";

export default function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Statistics cards skeleton - same grid as real dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  {/* Title skeleton */}
                  <Skeleton className="h-4 w-24 mb-1" />
                  {/* Value skeleton */}
                  <Skeleton className="h-8 w-12 mb-1" />
                </div>
                <div className="p-3 rounded-full bg-gray-100">
                  <Skeleton className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Overview - same grid as real dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Status Chart skeleton */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Skeleton className="h-5 w-5 mr-2" />
              <Skeleton className="h-6 w-32" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Donut chart placeholder */}
            <div className="flex items-center justify-center h-64">
              <Skeleton className="h-48 w-48 rounded-full" />
            </div>
          </CardContent>
        </Card>

        {/* Category Chart skeleton */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Skeleton className="h-5 w-5 mr-2" />
              <Skeleton className="h-6 w-40" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Bar chart placeholder */}
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => {
                const widths = ['w-3/4', 'w-1/2', 'w-2/3', 'w-4/5'];
                return (
                  <div key={index} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-16" />
                    <div className="flex-1">
                      <Skeleton className={`h-6 ${widths[index % widths.length]}`} />
                    </div>
                    <Skeleton className="h-4 w-8" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities skeleton */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Skeleton className="h-5 w-5 mr-2" />
              <Skeleton className="h-6 w-36" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-3/4 mb-1" />
                    <div className="flex items-center text-xs gap-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Button skeleton */}
            <div className="mt-4 pt-2 border-t border-gray-100">
              <Skeleton className="h-9 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}