import React, { useState } from 'react';

interface ManpowerInsightsChartProps {
  planned: number;
  delivered: number;
  reserved: number;
}

export const ManpowerInsightsChart: React.FC<ManpowerInsightsChartProps> = ({
  planned,
  delivered,
  reserved,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'daily' | 'weekly'>('daily');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Daily timeline (last 7 days)
  const dailyData = [
    { label: 'Mon', planned: planned - 2, delivered: delivered - 1, reserved: reserved },
    { label: 'Tue', planned: planned - 1, delivered: delivered, reserved: reserved + 1 },
    { label: 'Wed', planned: planned + 1, delivered: delivered - 2, reserved: reserved },
    { label: 'Thu', planned: planned, delivered: delivered + 1, reserved: reserved - 1 },
    { label: 'Fri', planned: planned + 3, delivered: delivered + 2, reserved: reserved + 1 },
    { label: 'Sat', planned: planned + 2, delivered: delivered + 1, reserved: reserved },
    { label: 'Today', planned: Math.max(planned, 1), delivered: Math.max(delivered, 1), reserved: Math.max(reserved, 1) },
  ];

  // Weekly timeline (last 4 weeks)
  const weeklyData = [
    { label: 'Wk 41', planned: planned * 6 - 8, delivered: delivered * 6 - 12, reserved: reserved * 6 },
    { label: 'Wk 42', planned: planned * 6 - 3, delivered: delivered * 6 - 5, reserved: reserved * 6 + 2 },
    { label: 'Wk 43', planned: planned * 6 + 4, delivered: delivered * 6 + 1, reserved: reserved * 6 - 2 },
    { label: 'Current', planned: planned * 6, delivered: delivered * 6, reserved: reserved * 6 },
  ];

  const currentDataset = filterPeriod === 'daily' ? dailyData : weeklyData;
  const maxVal = Math.max(...currentDataset.map((d) => Math.max(d.planned, d.delivered, d.reserved)), 10);

  const chartHeight = 110;
  const chartWidth = 240;

  return (
    <div className="bg-[#1C1F24] border border-[#30343B] rounded-lg p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase font-semibold text-[#F5F5F5]">
          Manpower Insights
        </span>
        <div className="flex items-center p-0.5 bg-[#15171B] border border-[#30343B] rounded text-[10px]">
          <button
            onClick={() => setFilterPeriod('daily')}
            className={`px-2 py-0.5 rounded transition-colors ${
              filterPeriod === 'daily' ? 'bg-[#398BFF] text-white font-semibold' : 'text-[#A5A9B0] hover:text-[#F5F5F5]'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setFilterPeriod('weekly')}
            className={`px-2 py-0.5 rounded transition-colors ${
              filterPeriod === 'weekly' ? 'bg-[#398BFF] text-white font-semibold' : 'text-[#A5A9B0] hover:text-[#F5F5F5]'
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px] text-[#A5A9B0] font-mono">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-xs bg-[#398BFF]" />
          <span>Planned</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-xs bg-[#20C997]" />
          <span>Delivered</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-xs bg-[#9B5CFF]" />
          <span>Reserved</span>
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div className="relative pt-2">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-24 overflow-visible">
          {/* Subtle grid lines */}
          <line x1="0" y1="20" x2={chartWidth} y2="20" stroke="#30343B" strokeDasharray="2 3" opacity="0.6" />
          <line x1="0" y1="60" x2={chartWidth} y2="60" stroke="#30343B" strokeDasharray="2 3" opacity="0.6" />
          <line x1="0" y1="95" x2={chartWidth} y2="95" stroke="#30343B" strokeWidth="1" />

          {currentDataset.map((item, idx) => {
            const groupWidth = chartWidth / currentDataset.length;
            const barWidth = Math.max(groupWidth / 4.2, 4);
            const xBase = idx * groupWidth + groupWidth * 0.15;

            const plannedH = (item.planned / maxVal) * 80;
            const deliveredH = (item.delivered / maxVal) * 80;
            const reservedH = (item.reserved / maxVal) * 80;

            const isHovered = hoveredIndex === idx;

            return (
              <g
                key={item.label}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Planned bar (Blue) */}
                <rect
                  x={xBase}
                  y={95 - plannedH}
                  width={barWidth}
                  height={Math.max(plannedH, 2)}
                  fill="#398BFF"
                  rx="1"
                  opacity={isHovered ? 1 : 0.85}
                />
                {/* Delivered bar (Green) */}
                <rect
                  x={xBase + barWidth + 2}
                  y={95 - deliveredH}
                  width={barWidth}
                  height={Math.max(deliveredH, 2)}
                  fill="#20C997"
                  rx="1"
                  opacity={isHovered ? 1 : 0.85}
                />
                {/* Reserved bar (Purple) */}
                <rect
                  x={xBase + (barWidth + 2) * 2}
                  y={95 - reservedH}
                  width={barWidth}
                  height={Math.max(reservedH, 2)}
                  fill="#9B5CFF"
                  rx="1"
                  opacity={isHovered ? 1 : 0.85}
                />

                {/* X axis label */}
                <text
                  x={xBase + barWidth * 1.5}
                  y="108"
                  textAnchor="middle"
                  fill={isHovered ? '#F5F5F5' : '#A5A9B0'}
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIndex !== null && currentDataset[hoveredIndex] && (
          <div className="absolute top-0 right-0 bg-[#15171B] border border-[#30343B] rounded p-1.5 text-[10px] font-mono text-[#F5F5F5] shadow-lg pointer-events-none space-y-0.5">
            <div className="text-[#A5A9B0] font-bold">{currentDataset[hoveredIndex].label}</div>
            <div className="text-[#398BFF]">Plan: {currentDataset[hoveredIndex].planned}</div>
            <div className="text-[#20C997]">Deliv: {currentDataset[hoveredIndex].delivered}</div>
            <div className="text-[#9B5CFF]">Rsrv: {currentDataset[hoveredIndex].reserved}</div>
          </div>
        )}
      </div>
    </div>
  );
};
