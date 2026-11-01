/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SealStamp:
 * Animated ceremonial stamp with scale 1.4 -> 1.0 using --e-spring over 700ms,
 * with an expanding ripple ring.
 */

import React from 'react';
import { GuillocheSeal } from './GuillocheSeal';

interface SealStampProps {
  size?: number;
  label?: string;
  className?: string;
  theme?: 'dark' | 'gold' | 'light';
}

export const SealStamp: React.FC<SealStampProps> = ({
  size = 80,
  label,
  className = '',
  theme = 'gold',
}) => {
  return (
    <div className={`relative inline-flex flex-col items-center justify-center ${className}`}>
      {/* Ripple ring */}
      <div
        className="absolute rounded-full border border-[#C9A04A]/60 pointer-events-none"
        style={{
          width: size * 1.3,
          height: size * 1.3,
          animation: 'rippleRing 1200ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
        aria-hidden="true"
      />

      {/* Main stamped seal */}
      <div
        className="anim-seal-stamp relative flex items-center justify-center p-1 rounded-full"
        style={{
          background: theme === 'dark' ? 'radial-gradient(circle, rgba(13,50,45,0.9) 0%, rgba(9,40,36,0.95) 100%)' : 'rgba(255,255,255,0.9)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(201,160,74,0.3)',
        }}
      >
        <GuillocheSeal size={size} theme={theme} showCenterEmblem={true} />
      </div>

      {label && (
        <span className="mt-2 text-[10px] font-mono-ref tracking-widest uppercase text-[#A47F2E] font-medium">
          {label}
        </span>
      )}
    </div>
  );
};
