import React, { useMemo } from 'react';

interface GuillocheSealProps {
  size?: number;
  className?: string;
  theme?: 'dark' | 'light';
  caption?: string;
}

export const GuillocheSeal: React.FC<GuillocheSealProps> = ({
  size = 140,
  className = '',
  theme = 'dark',
  caption,
}) => {
  const { path1, path2, R, cx, cy, innerR, outerR } = useMemo(() => {
    const cx = size / 2;
    const cy = size / 2;
    const R = size * 0.38;
    const a = 0.045 * R;
    const pointsCount = 720;

    // Roulette 1: k1 = 12
    const pts1: string[] = [];
    for (let i = 0; i <= pointsCount; i++) {
      const t = (i / pointsCount) * Math.PI * 2;
      const r = R + a * Math.sin(12 * t);
      const x = (cx + r * Math.cos(t)).toFixed(2);
      const y = (cy + r * Math.sin(t)).toFixed(2);
      pts1.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    pts1.push('Z');

    // Roulette 2: k2 = 18
    const pts2: string[] = [];
    for (let i = 0; i <= pointsCount; i++) {
      const t = (i / pointsCount) * Math.PI * 2;
      const r = R + a * Math.sin(18 * t);
      const x = (cx + r * Math.cos(t)).toFixed(2);
      const y = (cy + r * Math.sin(t)).toFixed(2);
      pts2.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    pts2.push('Z');

    return {
      path1: pts1.join(' '),
      path2: pts2.join(' '),
      R,
      cx,
      cy,
      innerR: R - a - 6,
      outerR: R + a + 6,
    };
  }, [size]);

  const strokeColor =
    theme === 'dark' ? 'rgba(201, 160, 74, 0.28)' : 'rgba(0, 60, 53, 0.16)';
  const ringColor =
    theme === 'dark' ? 'rgba(201, 160, 74, 0.38)' : 'rgba(0, 60, 53, 0.28)';

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="select-none pointer-events-none"
        aria-hidden="true"
      >
        {/* Outer Ring (1px) */}
        <circle
          cx={cx}
          cy={cy}
          r={outerR}
          stroke={ringColor}
          strokeWidth="1"
          strokeDasharray="4 2"
        />

        {/* Roulette 1 (0.6px) */}
        <path d={path1} stroke={strokeColor} strokeWidth="0.6" />

        {/* Roulette 2 (0.6px) */}
        <path d={path2} stroke={strokeColor} strokeWidth="0.6" />

        {/* Inner Ring (1px) */}
        <circle cx={cx} cy={cy} r={innerR} stroke={ringColor} strokeWidth="1" />

        {/* Center Emblem Details */}
        <circle
          cx={cx}
          cy={cy}
          r={innerR * 0.65}
          fill={theme === 'dark' ? 'rgba(13, 50, 45, 0.6)' : 'rgba(230, 239, 236, 0.6)'}
          stroke={strokeColor}
          strokeWidth="0.8"
        />

        {/* Shield Icon Silhouette inside rosette */}
        <path
          d={`M ${cx} ${cy - 12} L ${cx + 10} ${cy - 7} L ${cx + 10} ${cy + 4} C ${cx + 10} ${cy + 11} ${cx} ${cy + 15} ${cx} ${cy + 15} C ${cx} ${cy + 15} ${cx - 10} ${cy + 11} ${cx - 10} ${cy + 4} L ${cx - 10} ${cy - 7} Z`}
          fill="none"
          stroke={theme === 'dark' ? '#C9A04A' : '#003C35'}
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path
          d={`M ${cx} ${cy - 8} L ${cx} ${cy + 12}`}
          stroke={theme === 'dark' ? '#C9A04A' : '#003C35'}
          strokeWidth="0.8"
        />
        <path
          d={`M ${cx - 6} ${cy - 2} L ${cx + 6} ${cy - 2}`}
          stroke={theme === 'dark' ? '#C9A04A' : '#003C35'}
          strokeWidth="0.8"
        />
      </svg>
      {caption && (
        <span className="mt-2 text-xs font-mono tracking-widest uppercase text-[#A0B2AC]">
          {caption}
        </span>
      )}
    </div>
  );
};
