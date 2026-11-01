/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * DispatchTicket:
 * Reference ticket with:
 * - 16px corner radius
 * - Semi-circle side notches at 62% height
 * - Dashed tear line
 * - IBM Plex Mono reference badge
 * - Corner Guilloche seal
 * - Prints in: translateY 28px, 700ms --e-silk
 */

import React from 'react';
import { GuillocheSeal } from './GuillocheSeal';

interface DispatchTicketProps {
  reference: string;
  title: string;
  subtitle?: string;
  statusBadge?: React.ReactNode;
  dateLabel?: string;
  metadata?: { label: string; value: string }[];
  footerAction?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  isPrinting?: boolean;
}

export const DispatchTicket: React.FC<DispatchTicketProps> = ({
  reference,
  title,
  subtitle,
  statusBadge,
  dateLabel,
  metadata = [],
  footerAction,
  onClick,
  className = '',
  isPrinting = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative group bg-[var(--surface-card)] rounded-[16px] border border-[var(--surface-border)] overflow-hidden transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:border-[var(--line-gold)] hover:shadow-md' : ''
      } ${isPrinting ? 'anim-ticket-print' : ''} ${className}`}
      style={{
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Top section (0% to ~62% height) */}
      <div className="p-5 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono-ref text-xs tracking-wider font-semibold text-[#0B5247] dark:text-[#C9A04A] bg-[var(--emerald-50)] px-2.5 py-0.5 rounded border border-[var(--emerald)]/10">
                {reference}
              </span>
              {statusBadge}
            </div>
            <h4 className="font-display text-base font-semibold text-[var(--text-main)] group-hover:text-[#0B5247] dark:group-hover:text-[#C9A04A] transition-colors pt-1">
              {title}
            </h4>
            {subtitle && (
              <p className="text-xs text-[var(--text-sub)] line-clamp-1">
                {subtitle}
              </p>
            )}
          </div>

          {/* Corner Guilloche seal */}
          <div className="shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
            <GuillocheSeal size={38} theme="auto" showCenterEmblem={true} />
          </div>
        </div>

        {metadata.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-[var(--surface-border)]/60 text-xs">
            {metadata.map((item, i) => (
              <div key={i} className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-sub)]">
                  {item.label}
                </span>
                <p className="font-medium text-[var(--text-main)] truncate font-mono-ref text-xs">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notch divider zone at 62% height */}
      <div className="relative flex items-center h-4 my-[-8px]">
        {/* Left side notch cutout */}
        <div
          className="absolute -left-2.5 w-5 h-5 rounded-full bg-[var(--surface-bg)] border border-[var(--surface-border)] z-10"
          style={{ clipPath: 'inset(0 0 0 50%)' }}
          aria-hidden="true"
        />

        {/* Dashed tear line across */}
        <div className="w-full border-t border-dashed border-[var(--surface-border)] mx-4 opacity-75" />

        {/* Right side notch cutout */}
        <div
          className="absolute -right-2.5 w-5 h-5 rounded-full bg-[var(--surface-bg)] border border-[var(--surface-border)] z-10"
          style={{ clipPath: 'inset(0 50% 0 0)' }}
          aria-hidden="true"
        />
      </div>

      {/* Bottom stub section */}
      <div className="p-4 pt-4 bg-[var(--emerald-50)]/30 dark:bg-[#0D322D]/40 flex items-center justify-between text-xs">
        {dateLabel ? (
          <span className="text-[11px] font-mono-ref text-[var(--text-sub)]">
            {dateLabel}
          </span>
        ) : (
          <span className="text-[11px] font-mono-ref text-[#A47F2E]">
            COVENANT DISPATCH VOUCHER
          </span>
        )}

        {footerAction && <div>{footerAction}</div>}
      </div>
    </div>
  );
};
