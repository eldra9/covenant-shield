import { useEffect, useRef, useState, RefObject } from 'react';
import { rafScheduler } from './scheduler';

interface PointerLerpOptions {
  tauMs?: number; // Smoothing factor in milliseconds (default: 120ms)
}

export function usePointerLerp(
  containerRef: RefObject<HTMLElement | null>,
  options: PointerLerpOptions = {}
) {
  const { tauMs = 120 } = options;
  const [pos, setPos] = useState({ x: -999, y: -999 });
  const [isHovered, setIsHovered] = useState(false);

  const targetRef = useRef({ x: -999, y: -999 });
  const currentRef = useRef({ x: -999, y: -999 });
  const isHoveredRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Check tier
    const fx = document.documentElement.getAttribute('data-fx');
    if (fx === 'off' || fx === 'lite') {
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      targetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      if (!isHoveredRef.current) {
        isHoveredRef.current = true;
        setIsHovered(true);
        // snap initially to avoid swooping from far away
        currentRef.current = { ...targetRef.current };
      }
    };

    const onMouseLeave = () => {
      isHoveredRef.current = false;
      setIsHovered(false);
    };

    el.addEventListener('mousemove', onMouseMove, { passive: true });
    el.addEventListener('mouseleave', onMouseLeave);

    const unsubscribe = rafScheduler.subscribe((delta) => {
      if (!isHoveredRef.current) return;

      const alpha = 1 - Math.exp(-delta / tauMs);
      const curr = currentRef.current;
      const target = targetRef.current;

      curr.x += (target.x - curr.x) * alpha;
      curr.y += (target.y - curr.y) * alpha;

      setPos({ x: Math.round(curr.x), y: Math.round(curr.y) });
    });

    return () => {
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
      unsubscribe();
    };
  }, [containerRef, tauMs]);

  return { ...pos, isHovered };
}
