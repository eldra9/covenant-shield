import React, { useEffect, useState } from 'react';
import { usePointerLerp } from './usePointerLerp.ts';

export const CursorFollower: React.FC = () => {
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const pos = usePointerLerp({ tauMs: 90, disabled: !enabled });

  useEffect(() => {
    // Only on full tier and fine pointer
    const fx = document.documentElement.getAttribute('data-fx');
    const isFine = window.matchMedia('(pointer: fine)').matches;
    const isForcedColors = window.matchMedia('(forced-colors: active)').matches;

    if (fx === 'full' && isFine && !isForcedColors) {
      setEnabled(true);
    } else {
      setEnabled(false);
      return;
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('[data-cursor]');
      if (target) {
        const val = target.getAttribute('data-cursor');
        setCursorLabel(val);
      } else {
        setCursorLabel(null);
      }
    };

    window.addEventListener('mouseover', handleMouseOver);
    return () => window.removeEventListener('mouseover', handleMouseOver);
  }, []);

  if (!enabled || (pos.x === 0 && pos.y === 0)) return null;

  const isEnlarged = Boolean(cursorLabel);
  const size = isEnlarged ? 64 : 36;

  return (
    <div
      className="fixed pointer-events-none z-[999] rounded-full border border-[#C9A04A]/60 flex items-center justify-center transition-[width,height,background-color] duration-200"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${size}px`,
        height: `${size}px`,
        transform: 'translate(-50%, -50%)',
        backgroundColor: isEnlarged ? 'rgba(0, 60, 53, 0.85)' : 'rgba(201, 160, 74, 0.04)',
        backdropFilter: isEnlarged ? 'blur(4px)' : 'none',
      }}
      aria-hidden="true"
    >
      {cursorLabel && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A04A] select-none">
          {cursorLabel}
        </span>
      )}
    </div>
  );
};
