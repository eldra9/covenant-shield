/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * GuillocheSeal:
 * Mathematical SVG rosette generated in code and memoized:
 * Two roulettes: r(t) = R + a * sin(k * t)
 * k1 = 12, k2 = 18, a = 0.045 * R, 720 points each.
 * 0.6px stroke (gold 28% on dark, emerald 14% on light).
 * 1px outer and inner concentric retention rings.
 */

import React, { useMemo } from 'react';

interface GuillocheSealProps {
  size?: number; // default 64px
  className?: string;
  theme?: 'light' | 'dark' | 'gold' | 'auto';
  showCenterEmblem?: boolean;
}

export const GuillocheSeal: React.FC<GuillocheSealProps> = React.memo(({
  size = 64,
  className = '',
  theme = 'auto',
  showCenterEmblem = true,
}) => {
  const points = 720;
  const R = size / 2 - 4; // leave margin for outer ring
  const a = 0.045 * R;
  const cx = size / 2;
  const cy = size / 2;

  // Generate roulette 1 (k1 = 12)
  const path1 = useMemo(() => {
    const k1 = 12;
    let d = '';
    for (let i = 0; i <= points; i++) {
      const t = (i / points) * Math.PI * 2;
      const r = R + a * Math.sin(k1 * t);
      const x = cx + r * Math.cos(t);
      const y = cy + r * Math.sin(t);
      d += i === 0 ? `M ${x.toFixed(2)},${y.toFixed(2)}` : ` L ${x.toFixed(2)},${y.toFixed(2)}`;
    }
    return d + ' Z';
  }, [cx, cy, R, a, points]);

  // Generate roulette 2 (k2 = 18)
  const path2 = useMemo(() => {
    const k2 = 18;
    let d = '';
    for (let i = 0; i <= points; i++) {
      const t = (i / points) * Math.PI * 2;
      const r = R + a * Math.sin(k2 * t);
      const x = cx + r * Math.cos(t);
      const y = cy + r * Math.sin(t);
      d += i === 0 ? `M ${x.toFixed(2)},${y.toFixed(2)}` : ` L ${x.toFixed(2)},${y.toFixed(2)}`;
    }
    return d + ' Z';
  }, [cx, cy, R, a, points]);

  // Determine stroke color
  const strokeColor =
    theme === 'dark'
      ? 'rgba(201, 160, 74, 0.45)'
      : theme === 'gold'
      ? 'rgba(201, 160, 74, 0.7)'
      : 'rgba(0, 60, 53, 0.22)';

  const ringColor =
    theme === 'dark' || theme === 'gold'
      ? 'rgba(201, 160, 74, 0.6)'
      : 'rgba(0, 60, 53, 0.35)';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Outer concentric retention ring (1px) */}
        <circle
          cx={cx}
          cy={cy}
          r={R + 2}
          stroke={ringColor}
          strokeWidth="1"
          strokeDasharray="2 1"
        />

        {/* Primary roulette rosette 1 (k=12) */}
        <path
          d={path1}
          stroke={strokeColor}
          strokeWidth="0.6"
          fill="none"
        />

        {/* Secondary roulette rosette 2 (k=18) */}
        <path
          d={path2}
          stroke={strokeColor}
          strokeWidth="0.6"
          fill="none"
        />

        {/* Inner concentric ring (1px) */}
        <circle
          cx={cx}
          cy={cy}
          r={R * 0.45}
          stroke={ringColor}
          strokeWidth="1"
        />

        {/* Center emblem mark */}
        {showCenterEmblem && (
          <g transform={`translate(${cx - 7}, ${cy - 8}) scale(0.65)`}>
            <path
              d="M11 2L2 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z"
              fill={theme === 'dark' || theme === 'gold' ? '#C9A04A' : '#003C35'}
              opacity="0.9"
            />
          </g>
        )}
      </svg>
    </div>
  );
});
