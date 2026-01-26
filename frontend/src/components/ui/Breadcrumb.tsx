import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  maxLabelLength?: number;
}

export default function Breadcrumb({
  items,
  className = "",
  maxLabelLength = 25,
}: BreadcrumbProps) {
  const truncateText = (label: string, maxLength: number) => {
    if (label.length <= maxLength) return label;
    return label.substring(0, maxLength) + "...";
  };
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          )}

          {item.href && index < items.length - 1 ? (
            <Link
              to={item.href}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              title={item.label} // Show full label on hover
            >
              {truncateText(item.label, maxLabelLength)}
            </Link>
          ) : (
            <span
              className={
                index === items.length - 1
                  ? "text-gray-900 dark:text-gray-100 font-medium"
                  : "text-gray-500 dark:text-gray-400"
              }
              title={item.label} // Show full label on hover
            >
              {truncateText(item.label, maxLabelLength)}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
