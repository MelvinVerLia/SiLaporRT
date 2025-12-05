import React from "react";
import { cn } from "../../utils/cn";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const variants = {
      default: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
      success: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      warning: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
      danger: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
      info: "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-0.5 text-sm",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full font-medium",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
export default Badge;
