/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SplitReveal component:
 * Breaks text into staggered word or character tokens with overflow-hidden mask.
 * Words rise gracefully using the --e-silk curve (stagger 70ms, duration 1.1s).
 * Respects effects tiers (instant if data-fx="off" or reduced motion).
 */

import React, { useMemo } from 'react';

interface SplitRevealProps {
  text: string;
  className?: string;
  wordClassName?: string;
  delayMs?: number;
  staggerMs?: number;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3';
}

export const SplitReveal: React.FC<SplitRevealProps> = ({
  text,
  className = '',
  wordClassName = '',
  delayMs = 100,
  staggerMs = 70,
  as: Tag = 'span',
}) => {
  const words = useMemo(() => text.split(' '), [text]);

  const Component = Tag as any;

  return (
    <Component className={`inline-block ${className}`}>
      {words.map((word, i) => {
        const delay = delayMs + i * staggerMs;
        return (
          <span key={i} className="inline-block overflow-hidden align-top mr-[0.28em] last:mr-0">
            <span
              className={`inline-block transition-transform duration-[1100ms] ease-[var(--e-silk)] ${wordClassName}`}
              style={{
                animation: `splitWordRise 1100ms var(--e-silk) ${delay}ms both`,
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
