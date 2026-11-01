import React, { useEffect, useState } from 'react';
import { GuillocheSeal } from './GuillocheSeal.tsx';

const SESSION_KEY = 'cs_curtain_dismissed_v1';

export const Curtain: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<'drawing' | 'sliding' | 'done'>('drawing');

  useEffect(() => {
    try {
      // Skip if data-fx is off
      const fx = document.documentElement.getAttribute('data-fx');
      if (fx === 'off') {
        return;
      }

      // Skip on deep links with a hash
      if (window.location.hash) {
        return;
      }

      // Skip on repeat visits in this session
      const alreadySeen = sessionStorage.getItem(SESSION_KEY);
      if (alreadySeen) {
        return;
      }

      // Mark session as seen
      sessionStorage.setItem(SESSION_KEY, 'true');
      setVisible(true);

      // If lite tier, just do a fast 0.5s fade out
      if (fx === 'lite') {
        const timer = setTimeout(() => {
          setVisible(false);
        }, 500);
        return () => clearTimeout(timer);
      }

      // Timeline:
      // 0.0s: seal draws (1.4s)
      // 1.0s: foil line grows (0.5s)
      // 1.5s: halves slide out up and down (1.1s)
      // 2.6s: node removed
      const slideTimer = setTimeout(() => {
        setPhase('sliding');
      }, 1500);

      const doneTimer = setTimeout(() => {
        setPhase('done');
        setVisible(false);
      }, 2600);

      // Escape key or click skips immediately
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setVisible(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(slideTimer);
        clearTimeout(doneTimer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    } catch {
      setVisible(false);
    }
  }, []);

  if (!visible || phase === 'done') return null;

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-auto cursor-pointer select-none overflow-hidden"
      onClick={() => setVisible(false)}
      aria-hidden="true"
    >
      {/* Top Forest Half */}
      <div
        className="absolute top-0 left-0 right-0 h-1/2 bg-[#092824] transition-transform duration-[1100ms] will-change-transform"
        style={{
          transitionTimingFunction: 'var(--e-silk)',
          transform: phase === 'sliding' ? 'translateY(-100%)' : 'translateY(0%)',
        }}
      />

      {/* Bottom Forest Half */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#092824] transition-transform duration-[1100ms] will-change-transform"
        style={{
          transitionTimingFunction: 'var(--e-silk)',
          transform: phase === 'sliding' ? 'translateY(100%)' : 'translateY(0%)',
        }}
      />

      {/* Center 1px Foil Line */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[1px] bg-[var(--foil)] transition-all duration-500 ease-out"
        style={{
          width: phase === 'sliding' ? '100vw' : '90vw',
          opacity: phase === 'sliding' ? 0 : 0.85,
        }}
      />

      {/* Center 160px GuillocheSeal */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
        style={{
          opacity: phase === 'sliding' ? 0 : 1,
        }}
      >
        <GuillocheSeal size={160} variant="gold" strokeColor="#C9A04A" />
      </div>

      {/* Subtle Skip Label at bottom right */}
      <div className="absolute bottom-6 right-8 text-[11px] font-mono uppercase tracking-widest text-[#C9A04A]/60">
        Press Esc or click to enter
      </div>
    </div>
  );
};
