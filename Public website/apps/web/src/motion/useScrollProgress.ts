import { useEffect, useState, useRef, RefObject } from 'react';
import { rafScheduler } from './scheduler.ts';

export function useScrollProgress<T extends HTMLElement = HTMLElement>(): [
  RefObject<T | null>,
  number
] {
  const ref = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleFrame = () => {
      const node = ref.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Progress goes 0 when top enters bottom of viewport, to 1 when bottom leaves top
      const totalDistance = rect.height + viewportHeight;
      const current = viewportHeight - rect.top;
      const val = Math.max(0, Math.min(1, current / totalDistance));

      setProgress((prev) => (Math.abs(prev - val) > 0.002 ? val : prev));
    };

    const unregister = rafScheduler.register(handleFrame);
    return unregister;
  }, []);

  return [ref, progress];
}
