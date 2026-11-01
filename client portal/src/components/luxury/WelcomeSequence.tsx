/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * WelcomeSequence:
 * First load welcome sequence after sign-in:
 * - Once per session (sessionStorage wrapped in try/catch)
 * - Full-screen forest background (#092824)
 * - SealStamp at centre (0.9s)
 * - Greeting by SplitReveal in Fraunces "Good morning, {first name}." (computed in EAT)
 * - Foil line draws under it
 * - Screen dissolves upward (clip-path, 900ms, --e-silk) into the Overview
 * - Max 2.2s duration
 * - Click or Escape skips immediately
 * - Skipped in lite (0.4s fade) and off
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SealStamp } from './SealStamp';
import { SplitReveal } from '@/apps/web/src/motion/SplitReveal';

interface WelcomeSequenceProps {
  userName: string;
  onComplete: () => void;
}

export const WelcomeSequence: React.FC<WelcomeSequenceProps> = ({
  userName,
  onComplete,
}) => {
  const [isDismissing, setIsDismissing] = useState(false);

  // Compute greeting in EAT (UTC+3)
  const greeting = useMemo(() => {
    const now = new Date();
    const eatHours = (now.getUTCHours() + 3) % 24;
    const firstName = userName.split(' ')[0] || 'Client';

    let salutation = 'Good morning';
    if (eatHours >= 12 && eatHours < 17) {
      salutation = 'Good afternoon';
    } else if (eatHours >= 17 && eatHours < 22) {
      salutation = 'Good evening';
    } else if (eatHours >= 22 || eatHours < 5) {
      salutation = 'Good night';
    }

    return `${salutation}, ${firstName}.`;
  }, [userName]);

  const handleFinish = useCallback(() => {
    setIsDismissing(true);
    setTimeout(() => {
      onComplete();
    }, 850);
  }, [onComplete]);

  // Keyboard and click listener to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        handleFinish();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Auto complete timer (max 2.2s)
    const timer = setTimeout(() => {
      handleFinish();
    }, 2200);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [handleFinish]);

  return (
    <div
      onClick={handleFinish}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome greeting"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#092824] text-[#F4F6F4] cursor-pointer select-none transition-all duration-700 ${
        isDismissing ? 'anim-welcome-dissolve pointer-events-none' : ''
      }`}
    >
      <div className="flex flex-col items-center text-center px-6 max-w-lg space-y-6">
        {/* Seal stamp in centre */}
        <div className="transform scale-110">
          <SealStamp size={96} theme="gold" label="COVENANT SHIELD" />
        </div>

        {/* Greeting in Fraunces */}
        <div className="space-y-3">
          <h1 className="font-display text-3xl sm:text-4xl text-[#F4F6F4] tracking-tight leading-snug">
            <SplitReveal text={greeting} delayMs={100} staggerMs={70} />
          </h1>

          {/* Drawing foil line */}
          <div
            className="w-32 h-[1.5px] mx-auto rounded-full"
            style={{
              background: 'var(--foil)',
              animation: 'lineDraw 800ms var(--e-draw) 400ms both',
              boxShadow: '0 0 10px rgba(201,160,74,0.6)',
            }}
          />

          <p className="text-xs font-mono-ref uppercase tracking-widest text-[#C9A04A]/80 pt-1">
            Private Concierge Session Initialized • EAT
          </p>
        </div>

        <span className="text-[10px] font-mono-ref text-[var(--text-sub)] opacity-60">
          Press Escape or click anywhere to continue
        </span>
      </div>
    </div>
  );
};
