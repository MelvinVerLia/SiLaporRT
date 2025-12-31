import React from "react";
import { cn } from "../../utils/cn";
import { ChevronDown } from "lucide-react";

interface Option {
  label: string;
  value: string | number;
}

interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string | null;
  options: Option[];
}

const Dropdown = React.forwardRef<HTMLSelectElement, DropdownProps>(
  (
    { className, label, error, options, id, value, defaultValue, ...props },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <div className="relative w-full">
            <select
              id={selectId}
              ref={ref}
              value={value}
              defaultValue={defaultValue}
              className={cn(
                "flex h-10 w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50",
                error &&
                  "border-red-500 focus:border-red-500 focus:ring-red-500",
                className
              )}
              {...props}
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Dropdown.displayName = "Dropdown";
export default Dropdown;
