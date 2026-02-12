import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";

interface Option {
  label: string;
  value: string;
}

interface SearchableDropdownProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  options: Option[];
  label: string;
  name: string;
  search: string;
  error?: string | null;
  value?: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const SearchableDropdown = ({
  options,
  value,
  onChange,
  name,
  error,
  search,
  onSearchChange,
  className,
  label,
  disabled,
  placeholder = "Pilih RT",
}: SearchableDropdownProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}

        <div className="relative">
          <input
            type="text"
            value={open ? search : (selectedOption?.label ?? "")}
            placeholder={placeholder}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setOpen(true);
              onSearchChange(e.target.value);
            }}
            className={cn(
              "flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              className,
            )}
            disabled={disabled}
          />

          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      {open && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 border-gray-300 bg-white shadow">
          {options.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-500">No results</li>
          )}

          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => {
                onChange({ target: { name, value: opt.value } });
                setOpen(false);
              }}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchableDropdown;
