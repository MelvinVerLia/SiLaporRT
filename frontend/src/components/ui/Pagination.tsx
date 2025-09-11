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
  { value: "5", label: "5 per halaman" },
  { value: "10", label: "10 per halaman" },
  { value: "20", label: "20 per halaman" },
  { value: "50", label: "50 per halaman" },
  { value: "100", label: "100 per halaman" },
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
          <span className="text-sm text-gray-600">dari {totalItems} item</span>
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
