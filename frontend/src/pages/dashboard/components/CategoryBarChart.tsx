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
  const maxCount = Math.max(...data.map((item) => item.count));

  return (
    <div className={`space-y-3 ${className}`}>
      {data.map((item, index) => {
        const percentage = (item.count / maxCount) * 100;
        const barColor = item.color || "#3b82f6";

        return (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 truncate">
                {item.name}
              </span>
              <span className="text-sm font-bold text-gray-900 ml-2">
                {item.count}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: barColor,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryBarChart;
