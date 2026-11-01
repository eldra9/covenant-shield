/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * useScrollProgress hook: tracks scroll position from 0 to 1.
 * Uses rafScheduler to throttle updates and respect background tab pause.
 */

import { useState, useEffect, useRef } from 'react';
import { rafScheduler } from './rafScheduler';

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const targetProgress = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) {
        targetProgress.current = 0;
      } else {
        targetProgress.current = Math.min(Math.max(window.scrollY / totalScroll, 0), 1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const unsubscribe = rafScheduler.subscribe(() => {
      setProgress((prev) => {
        const diff = targetProgress.current - prev;
        if (Math.abs(diff) < 0.001) return targetProgress.current;
        return prev + diff * 0.15;
      });
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  return progress;
}
