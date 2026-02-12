import Skeleton from "../../../components/ui/Skeleton";

export default function TextBoxSkeleton() {
  return (
    <div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Skeleton className="w-full h-10" />
          <Skeleton className="px-3 h-10 w-10" />
        </div>
      </div>
    </div>
  );
}
