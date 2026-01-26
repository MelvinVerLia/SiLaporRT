import Skeleton from "../../../components/ui/Skeleton";

type MessageBoxSkeletonProps = {
  count?: number;
};

export default function MessageBoxSkeleton({
  count = 4,
}: MessageBoxSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => {
        const isOwn = i % 2 === 1;

        return (
          <div
            key={i}
            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex ${
                isOwn ? "flex-row-reverse" : "flex-row"
              } items-start gap-2 max-w-[85%] sm:max-w-[70%]`}
            >
              <div className="flex-shrink-0">
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>

              <div className="flex-1">
                <div className="rounded-lg p-3 bg-gray-100">
                  <Skeleton className="h-3 w-20" />

                  <div className="mt-2 space-y-2">
                    <Skeleton
                      className={i % 3 === 0 ? "h-4 w-56" : "h-4 w-44"}
                    />
                    <Skeleton
                      className={i % 3 === 0 ? "h-4 w-36" : "h-4 w-28"}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
