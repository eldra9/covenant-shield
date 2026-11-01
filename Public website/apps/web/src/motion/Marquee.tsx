import React from 'react';
import { GuillocheSeal } from './GuillocheSeal.tsx';

interface MarqueeProps {
  items: string[];
  className?: string;
}

export const Marquee: React.FC<MarqueeProps> = ({ items, className = '' }) => {
  return (
    <div
      className={`relative w-full overflow-hidden py-4 border-y border-[#D9E0DC] bg-[#F4F6F4] group select-none ${className}`}
      tabIndex={0}
      aria-label="Covenant Shield core security services ticker"
    >
      <style>{`
        @keyframes csMarqueeRoll {
          from { transform: translateX(0%); }
          to { transform: translateX(-50%); }
        }
        .cs-marquee-track {
          display: flex;
          width: max-content;
          animation: csMarqueeRoll 60s linear infinite;
        }
        .group:hover .cs-marquee-track,
        .group:focus .cs-marquee-track,
        .group:focus-within .cs-marquee-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .cs-marquee-track {
            animation: none;
          }
        }
      `}</style>

      <div className="cs-marquee-track flex items-center">
        {/* First original copy */}
        <div className="flex items-center gap-10 pr-10">
          {items.map((service, idx) => (
            <React.Fragment key={`orig-${idx}`}>
              <span className="font-display italic text-lg md:text-xl text-[#003C35] whitespace-nowrap">
                {service}
              </span>
              <GuillocheSeal size={14} variant="gold" strokeColor="#C9A04A" />
            </React.Fragment>
          ))}
        </div>

        {/* Duplicated copy (aria-hidden) */}
        <div className="flex items-center gap-10 pr-10" aria-hidden="true">
          {items.map((service, idx) => (
            <React.Fragment key={`dup-${idx}`}>
              <span className="font-display italic text-lg md:text-xl text-[#003C35] whitespace-nowrap">
                {service}
              </span>
              <GuillocheSeal size={14} variant="gold" strokeColor="#C9A04A" />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
