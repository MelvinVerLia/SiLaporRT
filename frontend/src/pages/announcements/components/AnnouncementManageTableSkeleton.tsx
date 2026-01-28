import Skeleton from "../../../components/ui/Skeleton";

export function AnnouncementManageTableSkeleton() {
  return (
    <>
      {/* Desktop Table View Skeleton */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full table-fixed">
          <colgroup>
            <col className="w-35/100" /> {/* Pengumuman - 35% */}
            <col className="w-1/10" /> {/* Jenis - 10% */}
            <col className="w-1/10" /> {/* Prioritas - 10% */}
            <col className="w-1/10" /> {/* Status - 10% */}
            <col className="w-2/10" /> {/* Tanggal - 20% */}
            <col className="w-15/100" /> {/* Aksi - 15% */}
          </colgroup>
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-4 pr-6 text-sm font-medium text-gray-600">
                Pengumuman
              </th>
              <th className="text-left py-4 pr-4 text-sm font-medium text-gray-600">
                Jenis
              </th>
              <th className="text-left py-4 pr-4 text-sm font-medium text-gray-600">
                Prioritas
              </th>
              <th className="text-left py-4 pr-4 text-sm font-medium text-gray-600">
                Status
              </th>
              <th className="text-left py-4 pr-4 text-sm font-medium text-gray-600">
                Tanggal
              </th>
              <th className="text-left py-4 text-sm font-medium text-gray-600">
                Aksi
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
                  <div className="flex items-start space-x-3">
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-full mb-1" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                </td>
                <td className="py-5 pr-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </td>
                <td className="py-5 pr-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </td>
                <td className="py-5 pr-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </td>
                <td className="py-5 pr-4">
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-24" />
                  </div>
                </td>
                <td className="py-5">
                  <div className="flex items-center space-x-1">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={`skeleton-card-${index}`}
            className="border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>

                <div className="space-y-1">
                  <Skeleton className="h-3 w-32" />
                </div>

                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-16 rounded" />
                    <Skeleton className="h-8 w-20 rounded" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default AnnouncementManageTableSkeleton;
