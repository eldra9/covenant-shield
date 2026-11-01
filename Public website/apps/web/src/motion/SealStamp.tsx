import React, { useEffect, useState } from 'react';
import { GuillocheSeal } from './GuillocheSeal.tsx';

interface SealStampProps {
  size?: number;
  className?: string;
  label?: string;
}

export const SealStamp: React.FC<SealStampProps> = ({
  size = 72,
  className = '',
  label = 'OFFICIAL SEAL',
}) => {
  const [stamped, setStamped] = useState(false);
  const [showBurst, setShowBurst] = useState(false);

  useEffect(() => {
    // Stamp trigger on mount
    const timer = setTimeout(() => {
      setStamped(true);
      const fx = document.documentElement.getAttribute('data-fx');
      if (fx === 'full') {
        setShowBurst(true);
        setTimeout(() => setShowBurst(false), 900);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Bursting 18 gold particles in full tier */}
      {showBurst && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, i) => {
            const angle = (i / 18) * Math.PI * 2;
            const dist = 32 + Math.random() * 24;
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist;
            return (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-[#C9A04A]"
                style={{
                  transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px)`,
                  opacity: 0,
                  transition: 'transform 0.9s var(--e-silk), opacity 0.9s ease-out',
                }}
              />
            );
          })}
        </div>
      )}

      {/* Ring Ripple */}
      {stamped && (
        <span
          className="absolute inset-0 rounded-full border border-[#C9A04A] animate-[ringPulse_1.2s_var(--e-lux)_forwards]"
          aria-hidden="true"
        />
      )}

      {/* Stamped Seal Emblem */}
      <div
        className="relative transition-transform duration-700 ease-out will-change-transform flex flex-col items-center justify-center p-1 rounded-full border border-[#C9A04A]/40 bg-[#003C35]/10 backdrop-blur-xs"
        style={{
          transitionTimingFunction: 'var(--e-spring)',
          transform: stamped ? 'scale(1)' : 'scale(1.4)',
        }}
      >
        <GuillocheSeal size={size} variant="gold" strokeColor="#C9A04A" />
        {label && (
          <span className="absolute text-[8px] font-mono uppercase tracking-widest text-[#C9A04A] font-bold">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};
