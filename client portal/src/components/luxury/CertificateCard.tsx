/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CertificateCard:
 * Authorized site card featuring:
 * - Foil double hairline
 * - Guilloche seal in the corner
 * - Site name in Fraunces
 * - Address & contracted supervisor
 * - Coverage hours
 * - Live status ("On post now" or "Next shift 18:00 EAT")
 * - Full tier: 3D tilt on pointer (perspective 900px, max 4deg, eased 1-e^(-dt/120ms)) with soft specular sheen
 * - Lite tier: no tilt, 2px lift on hover
 */

import React from 'react';
import { usePointerLerp } from '@/apps/web/src/motion/usePointerLerp';
import { GuillocheSeal } from './GuillocheSeal';
import { Site } from '@/src/types/clientPortal';
import { ShieldCheck, UserCheck, Clock, MapPin, ArrowRight } from 'lucide-react';

interface CertificateCardProps {
  site: Site;
  onClick?: () => void;
  className?: string;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  site,
  onClick,
  className = '',
}) => {
  const { ref, state, handlers } = usePointerLerp<HTMLDivElement>();

  // Determine live status
  const isOnPost = site.status === 'Active' && (site.assignedGuardsCount ?? 0) > 0;
  const liveStatusText = isOnPost ? 'On post now' : 'Next shift 18:00 EAT';

  // Check effect tier
  const isFullTier = typeof document !== 'undefined' && document.documentElement.getAttribute('data-fx') === 'full';

  return (
    <div
      ref={ref}
      onClick={onClick}
      {...handlers}
      className={`relative group bg-[var(--surface-card)] rounded-xl p-6 transition-all duration-300 cursor-pointer overflow-hidden ${className}`}
      style={{
        perspective: isFullTier ? '900px' : undefined,
        transform: isFullTier
          ? `perspective(900px) rotateX(${state.rotateX}deg) rotateY(${state.rotateY}deg)`
          : undefined,
        transformStyle: isFullTier ? 'preserve-3d' : undefined,
        boxShadow: state.isHovered
          ? '0 12px 32px -8px rgba(0, 60, 53, 0.12), 0 4px 12px -2px rgba(201, 160, 74, 0.08)'
          : '0 2px 10px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Outer foil double hairline border */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none p-[1px]"
        style={{
          background: 'var(--foil)',
          opacity: state.isHovered ? 0.9 : 0.45,
          transition: 'opacity 300ms ease',
        }}
      >
        <div className="w-full h-full rounded-[11px] bg-[var(--surface-card)] p-[2px]">
          <div className="w-full h-full rounded-[9px] border border-[#C9A04A]/30" />
        </div>
      </div>

      {/* Specular sheen (Full tier only) */}
      {isFullTier && (
        <div
          className="absolute inset-0 pointer-events-none rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 280px at ${state.sheenX}% ${state.sheenY}%, rgba(201, 160, 74, 0.12), transparent 70%)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Card Header with Corner Seal */}
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono-ref text-[11px] font-semibold text-[#0B5247] dark:text-[#C9A04A] bg-[var(--emerald-50)] px-2.5 py-0.5 rounded border border-[#003C35]/10">
              {site.code}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${
                isOnPost
                  ? 'bg-[#E7F3EC] text-[#1E6B45]'
                  : 'bg-[#FFF4DB] text-[#8A5A00]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOnPost ? 'bg-[#1E6B45]' : 'bg-[#8A5A00]'
                }`}
              />
              {liveStatusText}
            </span>
          </div>

          <h3 className="font-display text-xl font-semibold text-[var(--text-main)] pt-2 group-hover:text-[#0B5247] dark:group-hover:text-[#C9A04A] transition-colors leading-snug">
            {site.name}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-[var(--text-sub)]">
            <MapPin className="w-3.5 h-3.5 text-[#A47F2E] shrink-0" />
            <span className="truncate">{site.address}</span>
          </div>
        </div>

        {/* Guilloche Corner Seal */}
        <div className="shrink-0 transition-transform duration-500 group-hover:scale-105">
          <GuillocheSeal size={48} theme="auto" showCenterEmblem={true} />
        </div>
      </div>

      {/* Card Details Grid */}
      <div className="relative z-10 mt-6 grid grid-cols-2 gap-3 pt-4 border-t border-[var(--surface-border)] text-xs">
        <div className="space-y-1">
          <span className="flex items-center gap-1 text-[10px] uppercase font-mono-ref tracking-wider text-[var(--text-sub)]">
            <UserCheck className="w-3 h-3 text-[#A47F2E]" />
            Site Supervisor
          </span>
          <p className="font-medium text-[var(--text-main)] truncate">
            {site.supervisorName}
          </p>
        </div>

        <div className="space-y-1">
          <span className="flex items-center gap-1 text-[10px] uppercase font-mono-ref tracking-wider text-[var(--text-sub)]">
            <Clock className="w-3 h-3 text-[#A47F2E]" />
            Coverage Window
          </span>
          <p className="font-mono-ref font-medium text-[var(--text-main)]">
            {site.coverageHours}
          </p>
        </div>
      </div>

      {/* Footer link CTA */}
      <div className="relative z-10 mt-5 pt-3 border-t border-[var(--surface-border)]/60 flex items-center justify-between text-xs font-medium text-[#0B5247] dark:text-[#C9A04A]">
        <span className="flex items-center gap-1.5 font-mono-ref text-[11px] text-[var(--text-sub)]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#1E6B45]" />
          {site.assignedGuardsCount} Certified Officers Posted
        </span>
        <span className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
          Inspection Protocol
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
