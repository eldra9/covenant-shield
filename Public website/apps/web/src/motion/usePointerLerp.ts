import { useEffect, useState, useRef } from 'react';
import { rafScheduler } from './scheduler.ts';

export interface PointerLerpOptions {
  tauMs?: number; // Time constant tau in ms (e.g. 120ms or 90ms)
  disabled?: boolean;
}

export function usePointerLerp(options: PointerLerpOptions = {}) {
  const { tauMs = 120, disabled = false } = options;
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (disabled || typeof window === 'undefined') return;

    // Check if fine pointer
    const isFine = window.matchMedia('(pointer: fine)').matches;
    if (!isFine) return;

    const onPointerMove = (e: MouseEvent) => {
      targetPos.current.x = e.clientX;
      targetPos.current.y = e.clientY;
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });

    const unregister = rafScheduler.register((deltaMs) => {
      const alpha = 1 - Math.exp(-deltaMs / tauMs);
      const dx = (targetPos.current.x - currentPos.current.x) * alpha;
      const dy = (targetPos.current.y - currentPos.current.y) * alpha;

      currentPos.current.x += dx;
      currentPos.current.y += dy;

      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
        setPosition({ x: currentPos.current.x, y: currentPos.current.y });
      }
    });

    return () => {
      window.removeEventListener('mousemove', onPointerMove);
      unregister();
    };
  }, [tauMs, disabled]);

  return position;
}
