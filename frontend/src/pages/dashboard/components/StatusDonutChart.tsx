import React from "react";

interface StatusData {
  name: string;
  value: number;
  color: string;
  bgColor: string;
}

interface StatusDonutChartProps {
  data: StatusData[];
  className?: string;
}

const StatusDonutChart: React.FC<StatusDonutChartProps> = ({
  data,
  className = "",
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Handle empty state (no data)
  if (total === 0) {
    return (
      <div className={`${className}`}>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Empty Donut Chart */}
          <div className="flex-shrink-0">
            <div className="relative">
              <svg
                width="200"
                height="200"
                viewBox="0 0 100 100"
                className="transform -rotate-90"
              >
                {/* Gray circle for empty state */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="15"
                />
              </svg>

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">0</span>
                <span className="text-sm text-gray-400 dark:text-gray-500">Total</span>
              </div>
            </div>
          </div>

          {/* Legend with 0 values */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              {data.map((item, index) => (
                <div key={index} className="space-y-1 lg:text-left text-center">
                  <div className="flex items-center space-x-2 lg:justify-start justify-center">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 opacity-30"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-300 truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 lg:ml-5 lg:justify-start justify-center">
                    <span className="text-lg font-bold text-gray-400 dark:text-gray-300">0</span>
                    <span className="text-sm text-gray-400 dark:text-gray-300">(0%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate percentages for each segment
  let cumulativePercentage = 0;
  const segments = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const startAngle = cumulativePercentage * 3.6; // Convert to degrees
    const endAngle = (cumulativePercentage + percentage) * 3.6;
    cumulativePercentage += percentage;

    return {
      ...item,
      percentage,
      startAngle,
      endAngle,
    };
  });

  // Create SVG path for donut segment
  const createPath = (startAngle: number, endAngle: number) => {
    const centerX = 50;
    const centerY = 50;
    const outerRadius = 35;
    const innerRadius = 20;

    // Handle full circle case (360 degrees)
    if (Math.abs(endAngle - startAngle) >= 359.99) {
      // Draw two semi-circles to complete full donut
      const x1 = centerX + outerRadius;
      const y1 = centerY;
      const x2 = centerX - outerRadius;
      const y2 = centerY;

      const x3 = centerX - innerRadius;
      const y3 = centerY;
      const x4 = centerX + innerRadius;
      const y4 = centerY;

      return `
        M ${x1} ${y1}
        A ${outerRadius} ${outerRadius} 0 1 1 ${x2} ${y2}
        A ${outerRadius} ${outerRadius} 0 1 1 ${x1} ${y1}
        M ${x4} ${y4}
        A ${innerRadius} ${innerRadius} 0 1 0 ${x3} ${y3}
        A ${innerRadius} ${innerRadius} 0 1 0 ${x4} ${y4}
        Z
      `;
    }

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + outerRadius * Math.cos(startAngleRad);
    const y1 = centerY + outerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(endAngleRad);
    const y2 = centerY + outerRadius * Math.sin(endAngleRad);

    const x3 = centerX + innerRadius * Math.cos(endAngleRad);
    const y3 = centerY + innerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(startAngleRad);
    const y4 = centerY + innerRadius * Math.sin(startAngleRad);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  return (
    <div className={`${className}`}>
      {/* Chart and Legend - Stacked on small screens, side-by-side on larger screens */}
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Donut Chart */}
        <div className="flex-shrink-0">
          <div className="relative">
            <svg
              width="200"
              height="200"
              viewBox="0 0 100 100"
              className="transform -rotate-90"
            >
              {segments.map((segment, index) => (
                <path
                  key={index}
                  d={createPath(segment.startAngle, segment.endAngle)}
                  fill={segment.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{total}</span>
              <span className="text-sm text-gray-500 dark:text-gray-300">Total</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            {data.map((item, index) => (
              <div key={index} className="space-y-1 lg:text-left text-center">
                <div className="flex items-center space-x-2 lg:justify-start justify-center">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center space-x-1 lg:ml-5 lg:justify-start justify-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {item.value}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-300">
                    ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusDonutChart;
