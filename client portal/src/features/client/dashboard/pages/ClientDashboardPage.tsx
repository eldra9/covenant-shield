/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClientDashboardPage:
 * Overview screen featuring:
 * - Serif greeting in Fraunces computed in EAT with SplitReveal words
 * - KPI metric cards with NumberRoll odometer counts
 * - "Your coverage today" with one CoverageRibbon card per authorized site
 * - "Open requests" and "Open cases" as DispatchTicket rows (stagger 60ms)
 * - Empty state with GuillocheSeal illustration and one calm sentence when clear
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  FileText,
  MessageSquareWarning,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  ClientOrganization,
  ClientUser,
  DashboardMetrics,
  ServiceRequest,
  ClientCase,
  Site,
} from '@/src/types/clientPortal';
import { clientPortalApi, formatEAT } from '@/src/api/clientPortalApi';
import { PortalRoute } from '@/src/components/client/ClientSidebar';
import { NumberRoll } from '@/src/components/luxury/NumberRoll';
import { CoverageRibbon } from '@/src/components/luxury/CoverageRibbon';
import { DispatchTicket } from '@/src/components/luxury/DispatchTicket';
import { GuillocheSeal } from '@/src/components/luxury/GuillocheSeal';
import { SplitReveal } from '@/apps/web/src/motion/SplitReveal';

interface ClientDashboardPageProps {
  client: ClientOrganization;
  user: ClientUser;
  onNavigate: (route: PortalRoute, id?: string) => void;
  onNewRequest: () => void;
  onNewCase: () => void;
}

export const ClientDashboardPage: React.FC<ClientDashboardPageProps> = ({
  client,
  user,
  onNavigate,
  onNewRequest,
  onNewCase,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [openRequests, setOpenRequests] = useState<ServiceRequest[]>([]);
  const [openCases, setOpenCases] = useState<ClientCase[]>([]);
  const [loading, setLoading] = useState(true);

  // Compute greeting in EAT
  const greeting = useMemo(() => {
    const now = new Date();
    const eatHours = (now.getUTCHours() + 3) % 24;
    const firstName = user.fullName.split(' ')[0] || 'Client';

    let salutation = 'Good morning';
    if (eatHours >= 12 && eatHours < 17) {
      salutation = 'Good afternoon';
    } else if (eatHours >= 17 && eatHours < 22) {
      salutation = 'Good evening';
    } else if (eatHours >= 22 || eatHours < 5) {
      salutation = 'Good night';
    }

    return `${salutation}, ${firstName}.`;
  }, [user.fullName]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [m, s, r, c] = await Promise.all([
          clientPortalApi.getDashboardMetrics(),
          clientPortalApi.getSites(),
          clientPortalApi.getRequests(),
          clientPortalApi.getCases(),
        ]);

        if (isMounted) {
          setMetrics(m);
          setSites(s);
          setOpenRequests(r.filter(req => req.status !== 'Completed' && req.status !== 'Cancelled'));
          setOpenCases(c.filter(cs => cs.status !== 'Closed'));
        }
      } catch (err) {
        console.error('Failed to load dashboard overview', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [client.id]);

  if (loading || !metrics) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 bg-stone-200 dark:bg-stone-800 rounded-lg w-1/3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-28 bg-stone-200 dark:bg-stone-800 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-stone-200 dark:bg-stone-800 rounded-xl" />
      </div>
    );
  }

  const totalGuardsPosted = sites.reduce((sum, s) => sum + (s.assignedGuardsCount || 0), 0);

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Serif Greeting & Action CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[var(--surface-border)]">
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono-ref uppercase tracking-widest text-[#A47F2E]">
            Executive Briefing • East Africa Time (UTC+3)
          </span>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-main)] tracking-tight">
            <SplitReveal text={greeting} delayMs={100} staggerMs={70} />
          </h1>
          <p className="text-xs text-[var(--text-sub)]">
            Account posture for <span className="font-semibold text-[var(--text-main)]">{client.name}</span> ({client.contractTier} tier).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onNewCase}
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-[var(--surface-border)] hover:bg-[var(--emerald-50)]/40 text-[var(--text-main)] transition-colors cursor-pointer"
          >
            Report Issue
          </button>
        </div>
      </div>

      {/* KPI Stats Grid with NumberRoll */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sites */}
        <div
          onClick={() => onNavigate('sites')}
          className="p-5 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs hover:border-[#003C35]/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-[var(--text-sub)]">
            <span className="uppercase font-mono-ref tracking-wider text-[10px]">
              Authorized Sites
            </span>
            <Shield className="w-4 h-4 text-[#003C35] dark:text-[#C9A04A]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-[var(--text-main)]">
              <NumberRoll value={metrics.activeSitesCount} />
            </span>
            <span className="text-[11px] font-mono-ref text-[var(--text-sub)]">posts</span>
          </div>
        </div>

        {/* Certified Officers On Post */}
        <div className="p-5 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--text-sub)]">
            <span className="uppercase font-mono-ref tracking-wider text-[10px]">
              Guards on Duty
            </span>
            <ShieldCheck className="w-4 h-4 text-[#1E6B45]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-[var(--text-main)]">
              <NumberRoll value={totalGuardsPosted} />
            </span>
            <span className="text-[11px] font-mono-ref text-[#1E6B45]">active</span>
          </div>
        </div>

        {/* Open Requests */}
        <div
          onClick={() => onNavigate('requests')}
          className="p-5 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs hover:border-[#003C35]/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-[var(--text-sub)]">
            <span className="uppercase font-mono-ref tracking-wider text-[10px]">
              Open Requests
            </span>
            <FileText className="w-4 h-4 text-[#A47F2E]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-[var(--text-main)]">
              <NumberRoll value={metrics.openRequestsCount} />
            </span>
            {metrics.requestsAwaitingActionCount > 0 && (
              <span className="text-[10px] font-mono-ref font-semibold text-[#8A5A00] bg-[#FFF4DB] px-1.5 py-0.5 rounded">
                Action Req
              </span>
            )}
          </div>
        </div>

        {/* Open Support Cases */}
        <div
          onClick={() => onNavigate('cases')}
          className="p-5 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs hover:border-[#003C35]/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-[var(--text-sub)]">
            <span className="uppercase font-mono-ref tracking-wider text-[10px]">
              Open Cases
            </span>
            <MessageSquareWarning className="w-4 h-4 text-[#1D4E89]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-[var(--text-main)]">
              <NumberRoll value={metrics.openCasesCount} />
            </span>
            <span className="text-[11px] font-mono-ref text-[var(--text-sub)]">tickets</span>
          </div>
        </div>
      </div>

      {/* SECTION: Your Coverage Today */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="font-display text-lg font-bold text-[var(--text-main)]">
              Your coverage today
            </h2>
            <p className="text-xs text-[var(--text-sub)]">
              Real-time 24-hour tactical deployment timeline across contracted locations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('sites')}
            className="text-xs font-mono-ref font-medium text-[#0B5247] dark:text-[#C9A04A] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>All Sites ({sites.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {sites.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sites.map((site, index) => (
              <div
                key={site.id}
                className="p-5 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs space-y-3"
                style={{
                  animation: `fadeInStep 700ms var(--e-silk) ${450 + index * 120}ms both`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-sm font-semibold text-[var(--text-main)]">
                      {site.name}
                    </h3>
                    <p className="text-[11px] text-[var(--text-sub)]">
                      {site.address} • Supervisor: {site.supervisorName}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono-ref font-medium bg-[#E7F3EC] text-[#1E6B45]">
                    {site.status}
                  </span>
                </div>

                <CoverageRibbon siteName={site.name} />
              </div>
            ))}
          </div>
        ) : (
          /* Empty state with seal illustration and one helpful sentence */
          <div className="p-8 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center space-y-3">
            <div className="flex justify-center opacity-70">
              <GuillocheSeal size={64} theme="auto" showCenterEmblem={true} />
            </div>
            <p className="text-xs text-[var(--text-sub)] max-w-md mx-auto">
              No service sites are currently assigned to this account context.
            </p>
          </div>
        )}
      </section>

      {/* SECTION: Open Requests & Open Cases (DispatchTicket Rows) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Open Requests Column */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[var(--text-main)]">
              Open requests
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('requests')}
              className="text-xs font-mono-ref text-[var(--text-sub)] hover:text-[var(--text-main)] cursor-pointer"
            >
              View registry
            </button>
          </div>

          {openRequests.length > 0 ? (
            <div className="space-y-3">
              {openRequests.slice(0, 3).map((req, idx) => (
                <div
                  key={req.id}
                  style={{
                    animation: `fadeInStep 700ms var(--e-silk) ${700 + idx * 60}ms both`,
                  }}
                >
                  <DispatchTicket
                    reference={req.reference}
                    title={req.serviceType}
                    subtitle={`Site: ${req.siteName}`}
                    dateLabel={`Logged: ${formatEAT(req.createdAt)}`}
                    onClick={() => onNavigate('request-detail', req.id)}
                    statusBadge={
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface-bg)] text-[var(--text-main)] border border-[var(--surface-border)]">
                        {req.status}
                      </span>
                    }
                    metadata={[
                      { label: 'Priority', value: req.priority },
                      { label: 'Start Date', value: req.requestedStartDate },
                    ]}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center space-y-2">
              <div className="flex justify-center opacity-60">
                <GuillocheSeal size={48} theme="auto" showCenterEmblem={false} />
              </div>
              <p className="text-xs text-[var(--text-sub)]">
                All requests are resolved or no pending deployment vouchers exist.
              </p>
            </div>
          )}
        </section>

        {/* Open Cases Column */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[var(--text-main)]">
              Open cases
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('cases')}
              className="text-xs font-mono-ref text-[var(--text-sub)] hover:text-[var(--text-main)] cursor-pointer"
            >
              View inquiries
            </button>
          </div>

          {openCases.length > 0 ? (
            <div className="space-y-3">
              {openCases.slice(0, 3).map((cs, idx) => (
                <div
                  key={cs.id}
                  style={{
                    animation: `fadeInStep 700ms var(--e-silk) ${700 + idx * 60}ms both`,
                  }}
                >
                  <DispatchTicket
                    reference={cs.reference}
                    title={cs.subject}
                    subtitle={cs.siteName ? `Location: ${cs.siteName}` : 'General Inquiry'}
                    dateLabel={`Opened: ${formatEAT(cs.createdAt)}`}
                    onClick={() => onNavigate('case-detail', cs.id)}
                    statusBadge={
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#FFF4DB] text-[#8A5A00]">
                        {cs.status}
                      </span>
                    }
                    metadata={[
                      { label: 'Category', value: cs.category },
                      { label: 'Messages', value: `${cs.messages.length} notes` },
                    ]}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center space-y-2">
              <div className="flex justify-center opacity-60">
                <GuillocheSeal size={48} theme="auto" showCenterEmblem={false} />
              </div>
              <p className="text-xs text-[var(--text-sub)]">
                All client tickets are currently clear and in normal operational standing.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
