import { useEffect, useState } from 'react';
import { rafScheduler } from './scheduler.ts';

export function useCountUp(target: number, durationMs = 1200, startNow = false): number {
  const [value, setValue] = useState(startNow ? target : 0);

  useEffect(() => {
    if (!startNow) return;

    let elapsed = 0;
    const startVal = 0;

    const unregister = rafScheduler.register((deltaMs) => {
      elapsed += deltaMs;
      const progress = Math.min(1, elapsed / durationMs);
      // Silk easing: cubic-bezier(.16,1,.3,1)
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (target - startVal) * ease);
      setValue(current);

      if (progress >= 1) {
        unregister();
      }
    });

    return unregister;
  }, [target, durationMs, startNow]);

  return value;
}
