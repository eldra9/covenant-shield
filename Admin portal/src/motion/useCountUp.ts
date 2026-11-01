import { useEffect, useState } from 'react';
import { rafScheduler } from './scheduler';

interface UseCountUpOptions {
  duration?: number;
  start?: number;
  decimals?: number;
}

export function useCountUp(target: number, options: UseCountUpOptions = {}) {
  const { duration = 600, start = 0, decimals = 0 } = options;
  const [value, setValue] = useState(start);

  useEffect(() => {
    // If effects tier is off or lite, render final target immediately
    const fx = document.documentElement.getAttribute('data-fx');
    if (fx === 'off' || fx === 'lite') {
      setValue(target);
      return;
    }

    let startTime: number | null = null;
    const initialVal = value;
    const diff = target - initialVal;

    if (diff === 0) return;

    const unsubscribe = rafScheduler.subscribe((_, timestamp) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = initialVal + diff * eased;

      setValue(decimals === 0 ? Math.round(current) : parseFloat(current.toFixed(decimals)));

      if (progress >= 1) {
        unsubscribe();
      }
    });

    return () => unsubscribe();
  }, [target, duration, decimals]);

  return value;
}
