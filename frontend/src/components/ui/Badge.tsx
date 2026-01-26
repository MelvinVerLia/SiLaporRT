import React from "react";
import { cn } from "../../utils/cn";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const variants = {
      default: "bg-gray-100 dark:bg-gray-700/60 text-gray-800 dark:text-gray-100",
      success: "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400",
      warning: "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400",
      danger: "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400",
      info: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400",
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
          className,
        )}
        {...props}
      />
    );
  },
);

Badge.displayName = "Badge";
export default Badge;
