import Skeleton from "../../../components/ui/Skeleton";

export function ReportManageTableSkeleton() {
  return (
    <>
      {/* Desktop Table View Skeleton */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full table-fixed">
          <colgroup>
            <col className="w-35/100" /> {/* Laporan - 35% */}
            <col className="w-1/10" /> {/* Kategori - 10% */}
            <col className="w-1/10" /> {/* Prioritas - 10% */}
            <col className="w-1/10" /> {/* Visibilitas - 10% */}
            <col className="w-2/10" /> {/* Tanggal - 20% */}
            <col className="w-15/100" /> {/* Status - 15% */}
          </colgroup>
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-4 pr-6 text-sm font-medium text-gray-600">
                Laporan
              </th>
              <th className="text-left py-4 pr-4 text-sm font-medium text-gray-600">
                Kategori
              </th>
              <th className="text-left py-4 pr-4 text-sm font-medium text-gray-600">
                Prioritas
              </th>
              <th className="text-left py-4 pr-4 text-sm font-medium text-gray-600">
                Visibilitas
              </th>
              <th className="text-left py-4 text-sm font-medium text-gray-600">
                Tanggal
              </th>
              <th className="text-left py-4 pr-4 text-sm font-medium text-gray-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, index) => (
              <tr
                key={`skeleton-row-${index}`}
                className="border-b border-gray-100"
              >
                <td className="py-5 pr-6">
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full mb-2" />
                    <div className="flex items-center mt-2">
                      <Skeleton className="h-3 w-3 rounded-full mr-1" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                </td>
                <td className="py-5 pr-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </td>
                <td className="py-5 pr-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </td>
                <td className="py-5 pr-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </td>
                <td className="py-5">
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </td>
                <td className="py-5 pr-4">
                  <Skeleton className="h-8 w-28 rounded" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View Skeleton */}
      <div className="lg:hidden space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={`skeleton-card-${index}`}
            className="border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="min-w-0">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-5/6" />
                </div>

                {/* Location */}
                <div className="flex items-center">
                  <Skeleton className="h-3 w-3 rounded-full mr-1" />
                  <Skeleton className="h-3 w-2/3" />
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>

                {/* Stats */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <Skeleton className="h-3 w-3 rounded-full mr-1" />
                      <Skeleton className="h-3 w-6" />
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="h-3 w-3 rounded-full mr-1" />
                      <Skeleton className="h-3 w-6" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>

                {/* Status Update */}
                <div className="pt-2 border-t border-gray-100">
                  <Skeleton className="h-10 w-full rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default ReportManageTableSkeleton;
