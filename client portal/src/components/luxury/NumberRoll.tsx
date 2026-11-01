/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NumberRoll:
 * Odometer-style roll for digits (translateY columns over 600ms).
 * Supports prefix/suffix and non-digit characters.
 */

import React, { useMemo } from 'react';

interface NumberRollProps {
  value: number | string;
  prefix?: string;
  suffix?: string;
  className?: string;
  digitClassName?: string;
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export const NumberRoll: React.FC<NumberRollProps> = ({
  value,
  prefix = '',
  suffix = '',
  className = '',
  digitClassName = '',
}) => {
  const chars = useMemo(() => String(value).split(''), [value]);

  return (
    <span className={`inline-flex items-center font-mono-ref tabular-nums ${className}`}>
      {prefix && <span className="mr-0.5">{prefix}</span>}
      {chars.map((char, index) => {
        const isDigit = !isNaN(parseInt(char, 10));
        if (!isDigit) {
          return (
            <span key={index} className="inline-block px-0.5">
              {char}
            </span>
          );
        }

        const digitVal = parseInt(char, 10);

        return (
          <span
            key={index}
            className="inline-block relative overflow-hidden h-[1.25em] leading-[1.25em] w-[0.62em] text-center"
          >
            <span
              className={`flex flex-col transition-transform duration-[600ms] ease-[var(--e-lux)] ${digitClassName}`}
              style={{
                transform: `translateY(-${digitVal * 10}%)`,
              }}
            >
              {DIGITS.map((d) => (
                <span key={d} className="h-[1.25em] leading-[1.25em] block">
                  {d}
                </span>
              ))}
            </span>
          </span>
        );
      })}
      {suffix && <span className="ml-0.5">{suffix}</span>}
    </span>
  );
};
