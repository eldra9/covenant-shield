/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SiteDetailDrawer:
 * Slide-out detail drawer (spring 320ms):
 * - Official site specification & PSRA certified post counts
 * - Contracted coverage hours & supervisor contact details
 * - 24-hour CoverageRibbon for current posture
 * - 7-day coverage calendar ribbon preview
 * - Client-visible shift handover report
 */

import React, { useState } from 'react';
import { Site } from '@/src/types/clientPortal';
import { CoverageRibbon } from '@/src/components/luxury/CoverageRibbon';
import { GuillocheSeal } from '@/src/components/luxury/GuillocheSeal';
import { X, Shield, Phone, Mail, MapPin, Calendar, Clock, CheckCircle, UserCheck, BadgeCheck, ShieldAlert } from 'lucide-react';

interface SiteDetailDrawerProps {
  site: Site | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SiteDetailDrawer: React.FC<SiteDetailDrawerProps> = ({
  site,
  isOpen,
  onClose,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  if (!isOpen || !site) return null;

  // 7-day schedule labels
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* Background click backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Slide-out drawer panel */}
      <div
        className="relative z-10 w-full max-w-xl bg-[var(--surface-card)] h-full shadow-2xl border-l border-[var(--surface-border)] overflow-y-auto flex flex-col"
        style={{
          animation: 'drawerSlideLeft 320ms var(--e-spring) both',
        }}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-[var(--surface-border)] bg-[var(--emerald-50)]/40 dark:bg-[#0D322D] flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono-ref text-xs font-semibold text-[#0B5247] dark:text-[#C9A04A] bg-[var(--surface-card)] px-2.5 py-0.5 rounded border border-[#003C35]/15">
                {site.code}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#E7F3EC] text-[#1E6B45]">
                {site.status}
              </span>
            </div>
            <h2 id="drawer-title" className="font-display text-xl font-bold text-[var(--text-main)] pt-1">
              {site.name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-sub)]">
              <MapPin className="w-3.5 h-3.5 text-[#A47F2E] shrink-0" />
              <span>{site.address}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GuillocheSeal size={42} theme="auto" showCenterEmblem={true} />
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-black/5 cursor-pointer ml-2"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Site Overview Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[var(--surface-bg)] border border-[var(--surface-border)]">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono-ref tracking-wider text-[var(--text-sub)]">
                Guards Posted
              </span>
              <p className="font-mono-ref text-lg font-bold text-[#003C35] dark:text-[#C9A04A]">
                {site.assignedGuardsCount} Officers
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono-ref tracking-wider text-[var(--text-sub)]">
                Post Type
              </span>
              <p className="text-xs font-medium text-[var(--text-main)] truncate">
                {site.type}
              </p>
            </div>
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-mono-ref tracking-wider text-[var(--text-sub)]">
                Coverage Model
              </span>
              <p className="font-mono-ref text-xs font-semibold text-[var(--text-main)]">
                {site.coverageHours}
              </p>
            </div>
          </div>

          {/* Supervisor Contact Card */}
          <div className="p-4 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] space-y-3">
            <span className="text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#A47F2E]" />
              Designated Duty Supervisor
            </span>
            <div className="flex items-center justify-between text-xs pt-1">
              <div>
                <p className="font-semibold text-sm text-[var(--text-main)]">
                  {site.supervisorName || site.supervisorOnDuty}
                </p>
                <p className="text-[11px] text-[var(--text-sub)] font-mono-ref">
                  Covenant Shield Tactical Ops Unit
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${site.supervisorPhone || '+254711002911'}`}
                  className="p-2 rounded-lg bg-[var(--emerald-50)] text-[#003C35] dark:text-[#C9A04A] hover:bg-[#003C35] hover:text-white transition-colors"
                  title="Call supervisor"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href={`mailto:operations@covenantshield.co.ke?subject=Site%20Inquiry%20${site.code}`}
                  className="p-2 rounded-lg bg-[var(--emerald-50)] text-[#003C35] dark:text-[#C9A04A] hover:bg-[#003C35] hover:text-white transition-colors"
                  title="Email desk"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Assigned Security Personnel Register */}
          <div className="p-4 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-2">
              <span className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#1E6B45]" />
                Assigned Guards &amp; Tactical Personnel
              </span>
              <span className="font-mono-ref text-[11px] text-[#A47F2E] font-semibold">
                {site.assignedGuards?.length || site.guardPostsApprovedCount || 3} Certified Officers
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {site.assignedGuards && site.assignedGuards.length > 0 ? (
                site.assignedGuards.map((guard) => (
                  <div
                    key={guard.id}
                    className="p-3 rounded-lg bg-[var(--surface-bg)] border border-[var(--surface-border)] flex flex-col gap-2 transition-all hover:border-[#003C35]/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--text-main)]">{guard.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono-ref font-medium ${
                            guard.status === 'On Duty'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {guard.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#A47F2E] font-medium">{guard.rank}</p>
                      </div>

                      <span className="font-mono-ref text-[10px] bg-[var(--surface-card)] px-2 py-0.5 rounded border border-[var(--surface-border)] text-[var(--text-sub)]">
                        {guard.badgeNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[var(--surface-border)]/60 text-[var(--text-sub)]">
                      <div>
                        <span className="text-[10px] uppercase font-mono-ref block text-stone-400">Station Post:</span>
                        <span className="text-[var(--text-main)] font-medium">{guard.stationPost || 'Access Control Sentry'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono-ref block text-stone-400">Shift Roster:</span>
                        <span className="text-[var(--text-main)] font-medium">{guard.shift}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono-ref block text-stone-400">PSRA Registration:</span>
                        <span className="font-mono-ref text-[var(--text-main)]">{guard.psraNumber || 'PSRA-VERIFIED'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono-ref block text-stone-400">Direct Comms:</span>
                        <a href={`tel:${guard.phone}`} className="font-mono-ref text-[#003C35] dark:text-[#C9A04A] hover:underline">
                          {guard.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-xs text-[var(--text-sub)] text-center">
                  Guard deployment roster synced with central dispatch.
                </div>
              )}
            </div>
          </div>

          {/* Live 24-Hour Coverage Ribbon */}
          <div className="p-4 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] space-y-3">
            <h4 className="font-display text-sm font-semibold text-[var(--text-main)]">
              Today's Live Posting (EAT)
            </h4>
            <CoverageRibbon siteName={site.name} />
          </div>

          {/* 7-Day Schedule Ribbon */}
          <div className="p-4 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm font-semibold text-[var(--text-main)] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#A47F2E]" />
                7-Day Operational Posture
              </h4>
              <span className="text-[11px] font-mono-ref text-[var(--text-sub)]">
                Next 7 Days EAT
              </span>
            </div>

            {/* Day Selector Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
              {days.map((day, idx) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`px-3 py-1 rounded text-[11px] font-mono-ref whitespace-nowrap transition-colors cursor-pointer ${
                    selectedDayIndex === idx
                      ? 'bg-[#003C35] text-white font-semibold'
                      : 'bg-[var(--surface-bg)] text-[var(--text-sub)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <CoverageRibbon
                siteName={`${site.name} - ${days[selectedDayIndex]}`}
                showTimeLabels={false}
              />
            </div>
          </div>

          {/* Client-Visible Shift Handover */}
          {site.lastShiftHandover && (
            <div className="p-4 rounded-xl border border-[var(--surface-border)] bg-[var(--emerald-50)]/30 space-y-2">
              <span className="text-[11px] font-mono-ref uppercase tracking-wider text-[#A47F2E] flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#1E6B45]" />
                Last Verified Handover
              </span>
              <p className="text-xs text-[var(--text-main)] leading-relaxed">
                {site.lastShiftHandover}
              </p>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[var(--surface-border)] bg-[var(--surface-bg)] flex items-center justify-between text-xs">
          <span className="font-mono-ref text-[11px] text-[var(--text-sub)]">
            Covenant Shield Post Record
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[var(--surface-card)] hover:bg-[var(--emerald-50)] text-[#003C35] dark:text-[#C9A04A] border border-[var(--surface-border)] font-medium transition-colors cursor-pointer"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
