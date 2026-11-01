import React, { useRef, useState, useEffect } from 'react';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'outline' | 'ghost';
  children: React.ReactNode;
  className?: string;
  maxShift?: number; // max 6px
  reachRadius?: number; // 120px
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  variant = 'gold',
  children,
  className = '',
  maxShift = 6,
  reachRadius = 120,
  ...rest
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Check fine pointer & full tier
    const isFine = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;
    const fx = document.documentElement.getAttribute('data-fx');
    if (!isFine || fx === 'off') return;

    const handleMouseMove = (e: MouseEvent) => {
      const node = buttonRef.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

      if (dist < reachRadius) {
        const factor = (1 - dist / reachRadius) * maxShift;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        setOffset({
          x: Math.cos(angle) * factor,
          y: Math.sin(angle) * factor,
        });
      } else {
        setOffset({ x: 0, y: 0 });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [maxShift, reachRadius]);

  const baseStyle =
    variant === 'gold'
      ? 'bg-[#C9A04A] text-[#003C35] hover:bg-[#B38C3B] font-semibold border border-[#C9A04A]'
      : variant === 'outline'
      ? 'border border-white/40 text-white hover:border-[#C9A04A] hover:text-[#C9A04A] bg-transparent'
      : 'text-white/80 hover:text-white bg-transparent';

  return (
    <button
      ref={buttonRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setOffset({ x: 0, y: 0 });
      }}
      className={`relative inline-flex items-center justify-center px-6 py-3 rounded text-sm tracking-wide transition-all duration-200 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A04A] ${
        isHovered ? 'ring-pulse-hover' : ''
      } ${baseStyle} ${className}`}
      style={{
        transform: `translate3d(${offset.x.toFixed(1)}px, ${offset.y.toFixed(1)}px, 0)`,
        transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease, color 0.2s ease',
      }}
      {...rest}
    >
      {children}
    </button>
  );
};
