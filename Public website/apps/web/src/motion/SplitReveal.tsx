import React, { useEffect, useState } from 'react';
import { useInView } from './useInView.ts';

interface SplitRevealProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  staggerMs?: number;
  delayMs?: number;
}

export const SplitReveal: React.FC<SplitRevealProps> = ({
  text,
  className = '',
  as = 'h2',
  staggerMs = 70,
  delayMs = 0,
}) => {
  const [containerRef, inView] = useInView<HTMLElement>({ threshold: 0.15, triggerOnce: true });
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => {
        setAnimated(true);
      }, delayMs);
      return () => clearTimeout(timer);
    }
  }, [inView, delayMs]);

  const words = text.split(' ');
  const Tag = as;

  return (
    <Tag
      ref={containerRef as React.Ref<HTMLHeadingElement>}
      aria-label={text}
      className={`inline-block ${className}`}
    >
      {words.map((word, idx) => (
        <span
          key={`${word}-${idx}`}
          className="inline-block overflow-hidden align-baseline"
          style={{
            paddingTop: '0.22em',
            marginTop: '-0.22em',
            paddingBottom: '0.14em',
            marginRight: idx === words.length - 1 ? '0' : '0.28em',
          }}
          aria-hidden="true"
        >
          <span
            className="inline-block transition-transform duration-[1100ms] will-change-transform"
            style={{
              transitionTimingFunction: 'var(--e-silk)',
              transitionDelay: `${idx * staggerMs}ms`,
              transform: animated ? 'translateY(0%)' : 'translateY(115%)',
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </Tag>
  );
};
