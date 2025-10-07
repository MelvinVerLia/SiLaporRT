import { useState, useRef, useEffect } from "react";
import { Filter, X, RotateCcw } from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Input from "../ui/Input";
import Select from "../ui/Select";

export type FilterField = {
  name: string;
  label: string;
  type: "select" | "date" | "daterange" | "text";
  options?: { value: string; label: string }[];
  placeholder?: string;
  value?: string | { from?: string; to?: string };
  onChange?: (value: string | { from?: string; to?: string }) => void;
};

export type AdvancedFilterProps = {
  fields: FilterField[];
  onApply?: () => void;
  onReset?: () => void;
  activeFilterCount?: number;
  className?: string;
};

export default function AdvancedFilter({
  fields,
  onApply,
  onReset,
  activeFilterCount = 0,
  className = "",
}: AdvancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleApply = () => {
    onApply?.();
    setIsOpen(false);
  };

  const handleReset = () => {
    onReset?.();
    // Don't close dropdown after reset, let user continue filtering
  };

  const renderField = (field: FilterField) => {
    switch (field.type) {
      case "select":
        return (
          <Select
            key={field.name}
            value={field.value as string}
            onChange={(e) => field.onChange?.(e.target.value)}
            options={field.options || []}
            className="w-full"
          />
        );

      case "date":
        return (
          <Input
            key={field.name}
            type="date"
            value={field.value as string}
            onChange={(e) => field.onChange?.(e.target.value)}
            placeholder={field.placeholder}
            className="w-full"
          />
        );

      case "daterange": {
        const dateRangeValue = field.value as { from?: string; to?: string };
        return (
          <div key={field.name} className="space-y-2">
            <Input
              type="date"
              value={dateRangeValue?.from || ""}
              onChange={(e) =>
                field.onChange?.({ ...dateRangeValue, from: e.target.value })
              }
              placeholder="Dari tanggal"
              className="w-full"
            />
            <Input
              type="date"
              value={dateRangeValue?.to || ""}
              onChange={(e) =>
                field.onChange?.({ ...dateRangeValue, to: e.target.value })
              }
              placeholder="Sampai tanggal"
              className="w-full"
            />
          </div>
        );
      }

      case "text":
        return (
          <Input
            key={field.name}
            type="text"
            value={field.value as string}
            onChange={(e) => field.onChange?.(e.target.value)}
            placeholder={field.placeholder}
            className="w-full"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Filter Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filter
        {activeFilterCount > 0 && (
          <Badge
            variant="info"
            size="sm"
            className="ml-2 px-1.5 py-0.5 text-xs"
          >
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filter Lanjutan</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Filter Fields */}
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                  </label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex-1"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
            <Button size="sm" onClick={handleApply} className="flex-1">
              Terapkan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
