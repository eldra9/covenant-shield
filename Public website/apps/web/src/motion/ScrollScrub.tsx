import React, { useRef, useState, useEffect } from 'react';
import { rafScheduler } from './scheduler.ts';

interface ScrollScrubProps {
  text: string;
  className?: string;
  as?: 'h2' | 'h3' | 'p' | 'div';
}

export const ScrollScrub: React.FC<ScrollScrubProps> = ({
  text,
  className = '',
  as = 'h2',
}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const words = text.split(' ');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleFrame = () => {
      const node = containerRef.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;

      // When rect.top goes from 0.85*vh down to 0.25*vh
      const start = vh * 0.85;
      const end = vh * 0.25;
      const current = rect.top;

      const progress = Math.max(0, Math.min(1, (start - current) / (start - end)));
      setScrollProgress(progress);
    };

    const unregister = rafScheduler.register(handleFrame);
    return unregister;
  }, []);

  const Tag = as;

  return (
    <Tag
      ref={containerRef as React.Ref<HTMLHeadingElement>}
      className={`font-display tracking-tight leading-snug ${className}`}
    >
      {words.map((word, idx) => {
        // Compute threshold for each word
        const step = 1 / words.length;
        const wordStart = idx * step;
        const wordProgress = Math.max(0, Math.min(1, (scrollProgress - wordStart) / step));
        const opacity = 0.18 + wordProgress * 0.82; // fades 0.18 to 1

        return (
          <span
            key={`${word}-${idx}`}
            className="inline-block transition-opacity duration-100 mr-[0.28em] will-change-[opacity]"
            style={{ opacity: opacity.toFixed(3) }}
          >
            {word}
          </span>
        );
      })}
    </Tag>
  );
};
