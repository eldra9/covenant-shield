/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Lightweight useInView hook.
 * Triggers when element enters viewport.
 * If html[data-fx="off"], immediately resolves to true.
 */

import { useState, useEffect, useRef } from 'react';

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useInView<T extends HTMLElement = HTMLDivElement>(options: UseInViewOptions = {}) {
  const { threshold = 0.1, rootMargin = '0px', once = true } = options;
  const [inView, setInView] = useState(false);
  const ref = useRef<T | null>(null);

  useEffect(() => {
    // If data-fx is 'off', or reduced-motion is requested, show immediately
    if (typeof document !== 'undefined') {
      const fx = document.documentElement.getAttribute('data-fx');
      if (fx === 'off') {
        setInView(true);
        return;
      }
    }

    const node = ref.current;
    if (!node) return;

    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}
