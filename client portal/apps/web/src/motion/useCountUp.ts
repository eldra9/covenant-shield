/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * useCountUp hook:
 * Smoothly interpolates numeric values from start to target over duration.
 * Respects effects tiers (instant if data-fx="off").
 */

import { useState, useEffect, useRef } from 'react';
import { rafScheduler } from './rafScheduler';

interface UseCountUpOptions {
  duration?: number; // ms, default 600ms
  start?: number;
}

export function useCountUp(target: number, options: UseCountUpOptions = {}) {
  const { duration = 600, start = 0 } = options;
  const [current, setCurrent] = useState(start);
  const startTimeRef = useRef<number | null>(null);
  const startValRef = useRef(start);
  const targetValRef = useRef(target);

  useEffect(() => {
    targetValRef.current = target;
    startValRef.current = current;
    startTimeRef.current = null;

    const fx = typeof document !== 'undefined' ? document.documentElement.getAttribute('data-fx') : 'full';
    if (fx === 'off') {
      setCurrent(target);
      return;
    }

    const unsubscribe = rafScheduler.subscribe((_, timestamp) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // cubic-bezier(.22, 1, .36, 1) approximation
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextVal = Math.round(startValRef.current + (targetValRef.current - startValRef.current) * easedProgress);

      setCurrent(nextVal);

      if (progress >= 1) {
        unsubscribe();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [target, duration]);

  return current;
}
