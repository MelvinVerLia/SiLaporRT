import React from "react";

interface CategoryData {
  name: string;
  count: number;
  color?: string;
}

interface CategoryBarChartProps {
  data: CategoryData[];
  className?: string;
}

const CategoryBarChart: React.FC<CategoryBarChartProps> = ({
  data,
  className = "",
}) => {
  // Define all possible categories with their labels and colors
  const allCategories = [
    { key: "INFRASTRUCTURE", label: "Infrastruktur", color: "#3b82f6" },
    { key: "CLEANLINESS", label: "Kebersihan", color: "#10b981" },
    { key: "LIGHTING", label: "Penerangan", color: "#f59e0b" },
    { key: "SECURITY", label: "Keamanan", color: "#ef4444" },
    { key: "UTILITIES", label: "Utilitas", color: "#8b5cf6" },
    { key: "ENVIRONMENT", label: "Lingkungan", color: "#06b6d4" },
    { key: "SUGGESTION", label: "Saran", color: "#f97316" },
    { key: "OTHER", label: "Lainnya", color: "#6b7280" },
  ];

  // Merge data with all categories, filling in 0 for missing ones
  const completeData = allCategories.map((category) => {
    const existingData = data.find((item) => item.name === category.label);
    return {
      name: category.label,
      count: existingData ? existingData.count : 0,
      color: category.color,
    };
  });

  const maxCount = Math.max(...completeData.map((item) => item.count), 1); // At least 1 to avoid division by 0

  return (
    <div className={`${className}`}>
      {/* Mobile: 1 column, Desktop (XL): 2 columns (4-4) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-6 gap-y-3">
        {completeData.map((item, index) => {
          const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          const barColor = item.color || "#3b82f6";

          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                  {item.name}
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100 ml-2">
                  {item.count}
                </span>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.count === 0 ? "#e5e7eb" : barColor,
                    opacity: item.count === 0 ? 0.5 : 1,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBarChart;
