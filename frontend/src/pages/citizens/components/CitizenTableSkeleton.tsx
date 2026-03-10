import Skeleton from "../../../components/ui/Skeleton";

export default function CitizenTableSkeleton() {
  return (
    <>
      {/* Desktop Table View Skeleton */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full table-fixed">
          <colgroup>
            <col className="w-[30%]" />
            <col className="w-[20%]" />
            <col className="w-[20%]" />
            <col className="w-[15%]" />
            <col className="w-[15%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-4 pr-6 text-sm font-medium text-gray-600 dark:text-gray-300">
                Warga
              </th>
              <th className="text-left py-4 pr-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                Kontak
              </th>
              <th className="text-left py-4 pr-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                Alamat
              </th>
              <th className="text-left py-4 pr-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                Status
              </th>
              <th className="text-left py-4 pr-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, index) => (
              <tr
                key={`skeleton-row-${index}`}
                className="border-b border-gray-100 dark:border-gray-700"
              >
                <td className="py-5 pr-6">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </td>
                <td className="py-5 pr-4">
                  <Skeleton className="h-3 w-36 mb-1" />
                  <Skeleton className="h-3 w-28" />
                </td>
                <td className="py-5 pr-4">
                  <Skeleton className="h-3 w-40" />
                </td>
                <td className="py-5 pr-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </td>
                <td className="py-5 pr-4">
                  <Skeleton className="h-8 w-24 rounded" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View Skeleton */}
      <div className="lg:hidden space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`skeleton-card-${index}`}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-3"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-3 w-48" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-8 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
