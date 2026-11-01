import React, { useMemo } from 'react';

export interface GuillocheSealProps {
  size?: number; // pixel diameter
  variant?: 'gold' | 'emerald' | 'custom';
  strokeColor?: string;
  className?: string;
  isAnimated?: boolean;
}

export const GuillocheSeal: React.FC<GuillocheSealProps> = ({
  size = 160,
  variant = 'gold',
  strokeColor,
  className = '',
  isAnimated = false,
}) => {
  // Memoize path generation for zero CPU recalculations
  const { path1, path2, radius } = useMemo(() => {
    const R = 100; // coordinate scale inside 220x220 viewBox
    const a = 0.045 * R;
    const k1 = 12;
    const k2 = 18;
    const steps = 720;
    const cx = 110;
    const cy = 110;

    let d1 = '';
    let d2 = '';

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;

      // Roulette 1
      const r1 = R + a * Math.sin(k1 * t);
      const x1 = cx + r1 * Math.cos(t);
      const y1 = cy + r1 * Math.sin(t);
      d1 += (i === 0 ? 'M' : 'L') + `${x1.toFixed(2)},${y1.toFixed(2)}`;

      // Roulette 2
      const r2 = R + a * Math.sin(k2 * t);
      const x2 = cx + r2 * Math.cos(t);
      const y2 = cy + r2 * Math.sin(t);
      d2 += (i === 0 ? 'M' : 'L') + `${x2.toFixed(2)},${y2.toFixed(2)}`;
    }

    return { path1: d1, path2: d2, radius: R };
  }, []);

  const stroke =
    strokeColor ||
    (variant === 'gold' ? 'rgba(201, 160, 74, 0.28)' : 'rgba(0, 60, 53, 0.14)');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Outer 1px Ring */}
      <circle
        cx="110"
        cy="110"
        r={radius + 6}
        stroke={stroke}
        strokeWidth="1"
        className={isAnimated ? 'animate-[drawStroke_1.4s_var(--e-draw)_forwards]' : ''}
      />

      {/* Roulette 1 (k1=12, a=0.045R, 0.6px stroke) */}
      <path
        d={path1}
        stroke={stroke}
        strokeWidth="0.6"
        strokeLinejoin="round"
        className={isAnimated ? 'animate-[drawStroke_1.4s_var(--e-draw)_forwards]' : ''}
      />

      {/* Roulette 2 (k2=18, a=0.045R, 0.6px stroke) */}
      <path
        d={path2}
        stroke={stroke}
        strokeWidth="0.6"
        strokeLinejoin="round"
        className={isAnimated ? 'animate-[drawStroke_1.4s_var(--e-draw)_forwards]' : ''}
      />

      {/* Inner 1px Ring */}
      <circle
        cx="110"
        cy="110"
        r={radius - 8}
        stroke={stroke}
        strokeWidth="1"
        className={isAnimated ? 'animate-[drawStroke_1.4s_var(--e-draw)_forwards]' : ''}
      />

      {/* Central Star Emblem / Focal Core */}
      <path
        d="M110 96 L113 107 L124 110 L113 113 L110 124 L107 113 L96 110 L107 107 Z"
        fill={stroke}
        opacity="0.8"
      />
    </svg>
  );
};
