import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import { ChevronDown } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface DropdownProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  options: Option[];
  label: string;
  name: string;
  error?: string | null;
  value?: string;
  onChange: (e: { target: { label: string; value: string } }) => void;
  placeholder?: string;
  disabled?: boolean;
}

const Dropdown = ({
  options,
  value,
  onChange,
  error,
  className,
  label,
  disabled,
  placeholder = "Pilih",
}: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => String(o.value) === String(value));

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
          <button
            type="button"
            onClick={() => !disabled && setOpen((v) => !v)}
            onKeyDown={(e) => {
              if (disabled) return;
              if (e.key === "Escape") setOpen(false);
              if (e.key === "Enter" || e.key === " ") setOpen((v) => !v);
            }}
            aria-haspopup="listbox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              className,
            )}
          >
            <span
              className={cn(
                !selectedOption && "text-gray-400 dark:text-gray-500",
              )}
            >
              {selectedOption?.label ?? placeholder}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {open && (
        <ul
          role="listbox"
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 border-gray-300 bg-white shadow"
        >
          {options.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-500">No results</li>
          )}

          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={String(opt.value) === String(value)}
              onClick={() => {
                onChange({
                  target: { label: opt.label, value: String(opt.value) },
                });
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

Dropdown.displayName = "Dropdown";
export default Dropdown;
