import React, { useRef } from 'react';
import { usePointerLerp } from '@/motion';

interface SpotlightContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const SpotlightContainer: React.FC<SpotlightContainerProps> = ({
  children,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { x, y, isHovered } = usePointerLerp(containerRef, { tauMs: 120 });

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Hardware-accelerated Spotlight element */}
      <div
        className="pointer-events-none absolute -top-[200px] -left-[200px] w-[400px] h-[400px] rounded-full z-10 transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(circle 200px at center, rgba(201, 160, 74, 0.09), transparent 70%)',
          transform: `translate3d(${x}px, ${y}px, 0)`,
          opacity: isHovered ? 1 : 0,
          willChange: 'transform, opacity',
        }}
        aria-hidden="true"
      />

      {children}
    </div>
  );
};
