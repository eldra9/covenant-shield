import React, { useEffect, useState } from 'react';
import { useInView } from './useInView';

interface SplitRevealProps {
  children: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  className?: string;
  staggerMs?: number;
  durationMs?: number;
}

export const SplitReveal: React.FC<SplitRevealProps> = ({
  children,
  as: Component = 'span',
  className = '',
  staggerMs = 30,
  durationMs = 600,
}) => {
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.1 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fx = document.documentElement.getAttribute('data-fx');
    if (fx === 'off') {
      setReady(true);
      return;
    }

    if (document.documentElement.classList.contains('go')) {
      setReady(true);
    } else {
      const checkGo = () => {
        if (document.documentElement.classList.contains('go')) {
          setReady(true);
        } else {
          requestAnimationFrame(checkGo);
        }
      };
      const id = requestAnimationFrame(checkGo);
      return () => cancelAnimationFrame(id);
    }
  }, []);

  const words = children.split(' ');

  return (
    // @ts-expect-error dynamic component tag
    <Component ref={ref} className={`inline-block ${className}`}>
      {words.map((word, wordIdx) => {
        const isRevealed = isInView && ready;
        const delay = wordIdx * staggerMs;

        return (
          <span key={wordIdx} className="inline-block overflow-hidden mr-[0.25em]">
            <span
              className="inline-block transition-all"
              style={{
                transitionDuration: `${durationMs}ms`,
                transitionDelay: `${delay}ms`,
                transitionTimingFunction: 'var(--e-silk)',
                transform: isRevealed ? 'translateY(0)' : 'translateY(110%)',
                opacity: isRevealed ? 1 : 0,
              }}
            >
              {word}
            </span>
          </span>
        );
      })}
    </Component>
  );
};
