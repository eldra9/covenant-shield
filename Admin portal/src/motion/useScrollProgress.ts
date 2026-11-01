import { useEffect, useState, RefObject } from 'react';
import { rafScheduler } from './scheduler';

export function useScrollProgress(containerRef?: RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      if (containerRef?.current) {
        const el = containerRef.current;
        const total = el.scrollHeight - el.clientHeight;
        const current = el.scrollTop;
        setProgress(total > 0 ? Math.min(Math.max(current / total, 0), 1) : 0);
      } else {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const current = window.scrollY;
        setProgress(total > 0 ? Math.min(Math.max(current / total, 0), 1) : 0);
      }
    };

    let needsUpdate = false;
    const handleScroll = () => {
      needsUpdate = true;
    };

    const target = containerRef?.current || window;
    target.addEventListener('scroll', handleScroll, { passive: true });

    const unsubscribe = rafScheduler.subscribe(() => {
      if (needsUpdate) {
        update();
        needsUpdate = false;
      }
    });

    update();

    return () => {
      target.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, [containerRef]);

  return progress;
}
