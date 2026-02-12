import Skeleton from "../../../components/ui/Skeleton";

interface ReportBoxSkeletonProps {
  count?: number;
}

export default function ReportBoxSkeleton({
  count = 5,
}: ReportBoxSkeletonProps) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => {
        return (
          <div
            key={i}
            className="w-full rounded-lg border border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-800 p-3"
          >
            <Skeleton className="h-20 w-full" />
          </div>
        );
      })}
    </div>
  );
}
