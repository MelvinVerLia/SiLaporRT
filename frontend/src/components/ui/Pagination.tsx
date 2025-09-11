import Button from "./Button";
import Select from "./Select";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: { value: string; label: string }[];
  showPageSizeSelector?: boolean;
  className?: string;
}

const defaultPageSizeOptions = [
  { value: "5", label: "Tampilkan 5" },
  { value: "10", label: "Tampilkan 10" },
  { value: "20", label: "Tampilkan 20" },
  { value: "50", label: "Tampilkan 50" },
  { value: "100", label: "Tampilkan 100" },
];

export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = defaultPageSizeOptions,
  showPageSizeSelector = true,
  className = "",
}: PaginationProps) {
  const handlePageSizeChange = (newPageSize: string) => {
    onPageSizeChange(Number(newPageSize));
  };

  // Calculate current range
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between pt-6 border-t border-gray-200 gap-4 ${className}`}
    >
      {/* Page Size Selector */}
      {showPageSizeSelector && (
        <div className="flex items-center gap-3">
          <Select
            value={pageSize.toString()}
            onChange={(e) => handlePageSizeChange(e.target.value)}
            options={pageSizeOptions}
            className="w-auto min-w-[140px]"
          />
          <span className="text-sm text-gray-600">
            {totalItems > 0
              ? `${startItem}-${endItem} dari ${totalItems} item`
              : "0 item"}
          </span>
        </div>
      )}

      {/* Simple pagination info when no page size selector */}
      {!showPageSizeSelector && totalPages > 1 && (
        <div className="text-sm text-gray-600">
          Halaman {currentPage} dari {totalPages}
        </div>
      )}

      {/* Navigation */}
      {totalPages > 1 && (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Sebelumnya
          </Button>

          <span className="px-3 py-2 text-sm text-gray-600">
            Halaman {currentPage} dari {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Selanjutnya
          </Button>
        </div>
      )}
    </div>
  );
}
