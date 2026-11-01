/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Timeline:
 * Vertical timeline with:
 * - Line drawing stroke animation (600ms --e-draw)
 * - Steps fade in 120ms apart
 * - Current (most recent) step has slow ring pulse (4s loop, full tier)
 * - All times formatted in East Africa Time (EAT)
 */

import React from 'react';
import { formatEAT } from '@/src/api/clientPortalApi';
import { CheckCircle2, Clock } from 'lucide-react';

export interface TimelineStep {
  id: string;
  timestamp: string;
  title: string;
  status?: string;
  clientVisibleNotes?: string;
  actorRole?: string;
}

interface TimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ steps, className = '' }) => {
  const isFullTier = typeof document !== 'undefined' && document.documentElement.getAttribute('data-fx') === 'full';

  return (
    <div className={`relative pl-6 space-y-6 ${className}`}>
      {/* Vertical drawn line */}
      <div
        className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-[#003C35] via-[#C9A04A]/60 to-transparent"
        style={{
          animation: 'lineDraw 600ms var(--e-draw) both',
        }}
      />

      {steps.map((step, idx) => {
        const isCurrent = idx === steps.length - 1;
        const delay = idx * 120; // 120ms apart

        return (
          <div
            key={step.id || idx}
            className="relative flex items-start gap-4 transition-all"
            style={{
              animation: `fadeInStep 500ms var(--e-silk) ${delay}ms both`,
            }}
          >
            {/* Step node indicator */}
            <div className="relative -ml-[25px] flex items-center justify-center shrink-0">
              {isCurrent && isFullTier && (
                <div
                  className="absolute w-8 h-8 rounded-full border border-[#C9A04A]/70"
                  style={{
                    animation: 'slowRingPulse 4s cubic-bezier(0.22, 1, 0.36, 1) infinite',
                  }}
                  aria-hidden="true"
                />
              )}

              <div
                className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
                  isCurrent
                    ? 'bg-[#003C35] text-[#C9A04A] border-2 border-[#C9A04A]'
                    : 'bg-[var(--surface-card)] text-[#0B5247] dark:text-[#C9A04A] border-2 border-[var(--surface-border)]'
                }`}
              >
                {isCurrent ? (
                  <Clock className="w-3 h-3 text-[#C9A04A]" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-[#1E6B45]" />
                )}
              </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-lg p-3.5 shadow-sm space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-display font-semibold text-sm text-[var(--text-main)]">
                  {step.title}
                </span>
                <span className="font-mono-ref text-[11px] text-[#A47F2E]">
                  {formatEAT(step.timestamp)}
                </span>
              </div>

              {step.clientVisibleNotes && (
                <p className="text-xs text-[var(--text-sub)] leading-relaxed">
                  {step.clientVisibleNotes}
                </p>
              )}

              {step.actorRole && (
                <div className="pt-1 flex items-center gap-1.5 text-[10px] font-mono-ref uppercase tracking-wider text-[var(--text-sub)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A04A]" />
                  <span>Authority: {step.actorRole}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
