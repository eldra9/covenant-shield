/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ReopenRing:
 * SVG circular progress countdown showing remaining window to reopen a closed case.
 * - Allowed only within 7 days (168 hours) of closure.
 * - Drains smoothly.
 * - Turns --gold-600 (#A47F2E) when under 48 hours remaining.
 * - Button disappears after expiry (7 days).
 */

import React, { useMemo } from 'react';
import { RotateCcw } from 'lucide-react';

interface ReopenRingProps {
  closedAt: string; // ISO date
  onReopenClick: () => void;
  size?: number;
  className?: string;
}

export const ReopenRing: React.FC<ReopenRingProps> = ({
  closedAt,
  onReopenClick,
  size = 48,
  className = '',
}) => {
  const { isExpired, hoursLeft, daysLeft, progress, isUrgent } = useMemo(() => {
    const closedTime = new Date(closedAt).getTime();
    const now = Date.now();
    const totalWindowMs = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
    const elapsedMs = now - closedTime;
    const remainingMs = totalWindowMs - elapsedMs;

    if (remainingMs <= 0) {
      return { isExpired: true, hoursLeft: 0, daysLeft: 0, progress: 0, isUrgent: false };
    }

    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const days = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
    const pct = Math.max(0, Math.min(1, remainingMs / totalWindowMs));

    return {
      isExpired: false,
      hoursLeft: hours,
      daysLeft: days,
      progress: pct,
      isUrgent: hours < 48,
    };
  }, [closedAt]);

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 text-xs font-mono-ref text-[var(--text-sub)]">
        <span className="w-2 h-2 rounded-full bg-gray-400" />
        <span>Reopen window expired (7-day policy limit)</span>
      </div>
    );
  }

  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const ringColor = isUrgent ? '#A47F2E' : '#003C35';

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Animated SVG Ring */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-[var(--surface-border)]"
          />

          {/* Draining progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-[var(--e-lux)]"
          />
        </svg>

        {/* Center days counter */}
        <div className="absolute inset-0 flex flex-col items-center justify-center font-mono-ref text-center leading-none">
          <span className={`text-xs font-bold ${isUrgent ? 'text-[#A47F2E]' : 'text-[#003C35] dark:text-[#C9A04A]'}`}>
            {daysLeft}d
          </span>
        </div>
      </div>

      {/* Label and Action Button */}
      <div className="space-y-1">
        <p className="text-xs text-[var(--text-main)] font-medium">
          {isUrgent ? (
            <span className="text-[#A47F2E] font-semibold">
              {hoursLeft} hours remaining to reopen
            </span>
          ) : (
            <span>{daysLeft} days remaining in review window</span>
          )}
        </p>
        <button
          type="button"
          onClick={onReopenClick}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md bg-[var(--surface-card)] hover:bg-[var(--emerald-50)] text-[#0B5247] dark:text-[#C9A04A] border border-[var(--surface-border)] hover:border-[#003C35]/30 transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <RotateCcw className="w-3 h-3 text-[#A47F2E]" />
          Reopen Case
        </button>
      </div>
    </div>
  );
};
