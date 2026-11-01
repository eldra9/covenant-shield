/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CoverageRibbon:
 * 24-hour coverage timeline in East Africa Time (EAT - UTC+3).
 * Status colours:
 * - emerald (#003C35) = covered
 * - gold (#C9A04A) = partial
 * - danger (#A12B2B) = gap
 * 
 * "Now" marker: vertical gold indicator line gliding to position on load (900ms)
 * and moving every minute (1s ease).
 * Segments grow in left to right (700ms, stagger 40ms).
 * Text alternative provided as an accessible table.
 * Supports overnight shifts crossing midnight in EAT.
 */

import React, { useState, useEffect, useMemo } from 'react';

export interface CoverageSegment {
  startHour: number; // 0..24 (e.g. 18 for 18:00)
  endHour: number;   // 0..24 (e.g. 6 for 06:00 next day, or 24)
  status: 'covered' | 'partial' | 'gap';
  label: string;
}

interface CoverageRibbonProps {
  siteName: string;
  segments?: CoverageSegment[];
  className?: string;
  showTimeLabels?: boolean;
}

// Compute current minute of day in EAT (UTC+3)
function getNowEATMinutes(): number {
  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const eatHours = (utcHours + 3) % 24;
  return eatHours * 60 + utcMinutes;
}

export const CoverageRibbon: React.FC<CoverageRibbonProps> = ({
  siteName,
  segments: customSegments,
  className = '',
  showTimeLabels = true,
}) => {
  const [nowMinutes, setNowMinutes] = useState<number>(getNowEATMinutes());
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [showTextTable, setShowTextTable] = useState<boolean>(false);

  // Update "now" marker every minute
  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setNowMinutes(getNowEATMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Standard 24h schedule with overnight coverage support
  const segments: CoverageSegment[] = useMemo(() => {
    if (customSegments && customSegments.length > 0) return customSegments;
    return [
      { startHour: 0, endHour: 6, status: 'covered', label: 'Overnight Shift 00:00 - 06:00 EAT' },
      { startHour: 6, endHour: 8, status: 'partial', label: 'Shift Handover & Briefing 06:00 - 08:00 EAT' },
      { startHour: 8, endHour: 18, status: 'covered', label: 'Day Tactical Posting 08:00 - 18:00 EAT' },
      { startHour: 18, endHour: 24, status: 'covered', label: 'Night Guard Patrol 18:00 - 24:00 EAT' },
    ];
  }, [customSegments]);

  // Calculate now percentage (0% to 100%)
  const nowPercent = useMemo(() => {
    return Math.min(Math.max((nowMinutes / 1440) * 100, 0), 100);
  }, [nowMinutes]);

  const currentEATFormatted = useMemo(() => {
    const hours = Math.floor(nowMinutes / 60);
    const mins = nowMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')} EAT`;
  }, [nowMinutes]);

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[var(--text-main)]">
            24-Hour Coverage Profile
          </span>
          <span className="font-mono-ref text-[11px] text-[#A47F2E]">
            {currentEATFormatted}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowTextTable(!showTextTable)}
          className="text-[11px] font-mono-ref text-[var(--text-sub)] hover:text-[#0B5247] dark:hover:text-[#C9A04A] underline underline-offset-2 transition-colors cursor-pointer"
        >
          {showTextTable ? 'Show Ribbon View' : 'Accessible Table'}
        </button>
      </div>

      {!showTextTable ? (
        <div className="relative pt-1 pb-4">
          {/* Ribbon bar container */}
          <div className="relative h-6 w-full rounded-md overflow-hidden bg-gray-200 dark:bg-gray-800 flex shadow-inner">
            {segments.map((seg, idx) => {
              const widthPct = ((seg.endHour - seg.startHour) / 24) * 100;
              const bgColor =
                seg.status === 'covered'
                  ? 'bg-[#003C35]'
                  : seg.status === 'partial'
                  ? 'bg-[#C9A04A]'
                  : 'bg-[#A12B2B]';

              return (
                <div
                  key={idx}
                  title={`${seg.label} (${seg.status.toUpperCase()})`}
                  style={{
                    width: `${widthPct}%`,
                    animation: isLoaded ? `ribbonGrow 700ms var(--e-silk) ${idx * 40}ms both` : undefined,
                  }}
                  className={`h-full ${bgColor} border-r border-white/20 relative group transition-all duration-300 hover:brightness-110`}
                >
                  <span className="sr-only">
                    {seg.label}: {seg.status}
                  </span>
                </div>
              );
            })}

            {/* "Now" gliding marker */}
            <div
              className="absolute top-0 bottom-0 z-20 pointer-events-none transition-all duration-[1000ms] ease-[var(--e-lux)]"
              style={{
                left: `${nowPercent}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {/* Vertical line */}
              <div className="w-[2px] h-full bg-[#C9A04A] shadow-[0_0_8px_rgba(201,160,74,0.9)]" />

              {/* Marker pin tip */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#C9A04A]" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#C9A04A]" />
            </div>
          </div>

          {/* Time scale ruler */}
          {showTimeLabels && (
            <div className="flex justify-between text-[10px] font-mono-ref text-[var(--text-sub)] mt-1.5 px-0.5">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>24:00 EAT</span>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 text-[10px] font-mono-ref text-[var(--text-sub)] mt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#003C35] inline-block" />
              Active Post
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#C9A04A] inline-block" />
              Handover / Patrol
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#A12B2B] inline-block" />
              Unmanned Window
            </span>
            <span className="flex items-center gap-1.5 ml-auto text-[#A47F2E]">
              <span className="w-2 h-0.5 bg-[#C9A04A] inline-block" />
              Live EAT
            </span>
          </div>
        </div>
      ) : (
        /* Accessible table text alternative */
        <div className="rounded border border-[var(--surface-border)] overflow-hidden text-xs">
          <table className="w-full text-left font-mono-ref">
            <caption className="sr-only">
              24-Hour Coverage Schedule for {siteName} in East Africa Time
            </caption>
            <thead className="bg-[var(--emerald-50)] dark:bg-[#0D322D] text-[10px] uppercase text-[var(--text-sub)]">
              <tr>
                <th className="p-2">Window (EAT)</th>
                <th className="p-2">Posture Status</th>
                <th className="p-2">Deployment Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-border)] bg-[var(--surface-card)]">
              {segments.map((s, i) => (
                <tr key={i}>
                  <td className="p-2 whitespace-nowrap">
                    {String(s.startHour).padStart(2, '0')}:00 – {String(s.endHour).padStart(2, '0')}:00
                  </td>
                  <td className="p-2 capitalize font-semibold">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${
                        s.status === 'covered'
                          ? 'bg-[#E7F3EC] text-[#1E6B45]'
                          : s.status === 'partial'
                          ? 'bg-[#FFF4DB] text-[#8A5A00]'
                          : 'bg-[#FBE9E9] text-[#A12B2B]'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="p-2 text-[var(--text-sub)]">{s.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
