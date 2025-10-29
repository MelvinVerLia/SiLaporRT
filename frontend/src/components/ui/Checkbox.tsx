import React from "react";
import { cn } from "../../utils/cn";

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
  error?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-2">
        <div className="flex items-start space-x-3">
          <input
            id={checkboxId}
            type="checkbox"
            className={cn(
              "h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-500 focus:ring-red-500",
              className
            )}
            ref={ref}
            {...props}
          />
          {label && (
            <div className="flex-1 min-w-0">
              <label
                htmlFor={checkboxId}
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                {label}
              </label>
              {description && (
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              )}
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-600 ml-7">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
export default Checkbox;
