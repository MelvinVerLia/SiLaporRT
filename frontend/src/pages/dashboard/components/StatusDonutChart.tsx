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
      {/* Chart and Legend Side by Side */}
      <div className="flex items-center gap-6">
        {/* Donut Chart */}
        <div className="flex-shrink-0">
          <div className="relative">
            <svg
              width="220"
              height="220"
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
              <span className="text-2xl font-bold text-gray-900">{total}</span>
              <span className="text-sm text-gray-500">Total</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            {data.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center space-x-1 ml-5">
                  <span className="text-lg font-bold text-gray-900">
                    {item.value}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({Math.round((item.value / total) * 100)}%)
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
