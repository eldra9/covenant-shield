/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClientCaseDetailPage:
 * Case ticket detail view:
 * - ConversationThread (messages slide in, official response badge with seal, delivered tick)
 * - Reply box
 * - Milestone Timeline (drawing stroke, slow ring pulse)
 * - ReopenRing showing days left to reopen (within 7 days of closure), drains smoothly, turns --gold-600 under 48h, button disappears after expiry
 * - Deadlines shown as dates, not alarms
 * - RestrictedPostState 403 on foreign/tampered case ID
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { ClientCase } from '@/src/types/clientPortal';
import { ClientPageHeader } from '@/src/components/client/ClientPageHeader';
import { ClientStatusBadge } from '@/src/components/client/ClientStatusBadge';
import { ConversationThread } from '@/src/components/luxury/ConversationThread';
import { Timeline, TimelineStep } from '@/src/components/luxury/Timeline';
import { ReopenRing } from '@/src/components/luxury/ReopenRing';
import { RestrictedPostState } from '@/apps/web/src/features/client/components/RestrictedPostState';
import { SealStamp } from '@/src/components/luxury/SealStamp';
import { ClientReplyForm } from '../components/ClientReplyForm';
import { clientCasesApi } from '../api/clientCasesApi';
import { formatEAT } from '@/src/api/clientPortalApi';

interface ClientCaseDetailPageProps {
  caseId: string;
  onBack: () => void;
  onCaseUpdated?: () => void;
}

export const ClientCaseDetailPage: React.FC<ClientCaseDetailPageProps> = ({
  caseId,
  onBack,
  onCaseUpdated,
}) => {
  const [caseItem, setCaseItem] = useState<ClientCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenedStamp, setShowReopenedStamp] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await clientCasesApi.getCaseById(caseId);
      setCaseItem(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load case');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [caseId]);

  const handleSendReply = async (content: string, attachments?: File[]) => {
    if (!caseItem) return;
    const updated = await clientCasesApi.addReply(caseItem.id, content, attachments);
    setCaseItem(updated);
    if (onCaseUpdated) onCaseUpdated();
  };

  const handleCloseCase = async () => {
    if (!caseItem) return;
    setClosing(true);
    try {
      const updated = await clientCasesApi.closeCase(caseItem.id);
      setCaseItem(updated);
      if (onCaseUpdated) onCaseUpdated();
    } catch (err: any) {
      alert(`Error closing ticket: ${err.message}`);
    } finally {
      setClosing(false);
    }
  };

  const handleReopenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseItem || !reopenReason.trim()) return;

    try {
      const updated = await clientCasesApi.reopenCase(caseItem.id, reopenReason);
      setCaseItem(updated);
      setIsReopenModalOpen(false);
      setReopenReason('');
      setShowReopenedStamp(true);
      setTimeout(() => setShowReopenedStamp(false), 2400);
      if (onCaseUpdated) onCaseUpdated();
    } catch (err: any) {
      alert(`Error reopening ticket: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-5xl mx-auto">
        <div className="h-8 bg-stone-200 dark:bg-stone-800 rounded w-1/3" />
        <div className="h-44 bg-stone-200 dark:bg-stone-800 rounded-xl" />
        <div className="h-72 bg-stone-200 dark:bg-stone-800 rounded-xl" />
      </div>
    );
  }

  // 403 or Unauthorized ID Handling
  if (error || !caseItem) {
    return (
      <RestrictedPostState
        title="Unauthorized Inquiry Ticket"
        onBack={onBack}
      />
    );
  }

  const isClosed = caseItem.status === 'Closed';

  const timelineSteps: TimelineStep[] = caseItem.timeline.map((t, idx) => ({
    id: t.id || `tl-${idx}`,
    timestamp: t.timestamp,
    title: t.title,
    status: t.status,
    clientVisibleNotes: t.note,
    actorRole: 'Operations Duty Officer',
  }));

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Reopened Stamp Splash */}
      {showReopenedStamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none">
          <SealStamp size={96} theme="gold" label="TICKET REOPENED" />
        </div>
      )}

      {/* Page Header */}
      <ClientPageHeader
        breadcrumbs={[
          { label: 'Cases & Feedback', onClick: onBack },
          { label: caseItem.reference, active: true },
        ]}
        title={caseItem.subject}
        description={`Ticket: ${caseItem.reference} · Category: ${caseItem.category} · Priority: ${caseItem.priority}`}
        action={
          <div className="flex items-center gap-3">
            {!isClosed ? (
              <button
                type="button"
                onClick={handleCloseCase}
                disabled={closing}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--surface-card)] hover:bg-[var(--emerald-50)] text-[#1E6B45] text-xs font-semibold rounded-lg border border-[var(--surface-border)] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-[#1E6B45]" />
                <span>{closing ? 'Recording...' : 'Confirm Resolution & Close'}</span>
              </button>
            ) : (
              /* ReopenRing with 7-day countdown */
              <ReopenRing
                closedAt={caseItem.updatedAt}
                onReopenClick={() => setIsReopenModalOpen(true)}
              />
            )}
          </div>
        }
      />

      {/* Ticket Header Voucher Card */}
      <div className="bg-[var(--surface-card)] rounded-xl border border-[var(--surface-border)] p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--surface-border)]">
          <div className="flex items-center gap-2.5">
            <span className="font-mono-ref text-xs font-bold text-[#003C35] dark:text-[#C9A04A] bg-[var(--emerald-50)] px-2.5 py-1 rounded border border-[#003C35]/10">
              {caseItem.reference}
            </span>
            <ClientStatusBadge status={caseItem.status} />
            <span className="text-xs font-medium text-[var(--text-main)]">
              {caseItem.category}
            </span>
          </div>

          <div className="text-xs text-[var(--text-sub)] font-mono-ref">
            Logged: {formatEAT(caseItem.createdAt)}
          </div>
        </div>

        {caseItem.siteName && (
          <div className="mt-3 text-xs text-[var(--text-sub)] flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#003C35] dark:text-[#C9A04A]" />
            <span>Associated Facility: <strong className="text-[var(--text-main)]">{caseItem.siteName}</strong></span>
          </div>
        )}
      </div>

      {/* Two Columns: Conversation Thread & Milestone Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Messages Thread Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--surface-card)] rounded-xl border border-[var(--surface-border)] p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--surface-border)]">
              <h3 className="font-display text-base font-bold text-[var(--text-main)]">
                Concierge Dispatch Thread
              </h3>
              <span className="text-xs font-mono-ref text-[var(--text-sub)]">
                {caseItem.messages.length} official communications
              </span>
            </div>

            {/* Conversation Messages */}
            <ConversationThread messages={caseItem.messages} />

            {/* Client Reply Form or Closed State */}
            {!isClosed ? (
              <div className="pt-4 border-t border-[var(--surface-border)]">
                <ClientReplyForm
                  isClosed={isClosed}
                  onSendReply={handleSendReply}
                />
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[var(--surface-bg)] border border-[var(--surface-border)] text-center text-xs text-[var(--text-sub)] space-y-1">
                <p className="font-medium text-[var(--text-main)]">This case has been resolved and closed.</p>
                <p>Use the reopen ring above within 7 days if further inspection is needed.</p>
              </div>
            )}
          </div>
        </div>

        {/* Milestone Timeline Column */}
        <div className="space-y-4">
          <div className="bg-[var(--surface-card)] rounded-xl border border-[var(--surface-border)] p-5 shadow-xs space-y-4">
            <h3 className="font-display text-sm font-bold text-[var(--text-main)]">
              Resolution Progress
            </h3>
            <Timeline steps={timelineSteps} />
          </div>
        </div>
      </div>

      {/* Reopen Modal */}
      {isReopenModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-[var(--surface-card)] rounded-xl border border-[var(--surface-border)] p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-lg font-bold text-[var(--text-main)]">
              Reopen Support Ticket
            </h3>
            <p className="text-xs text-[var(--text-sub)] leading-relaxed">
              Please describe what remains unresolved. Reopening is permitted within the 7-day concierge review window.
            </p>
            <form onSubmit={handleReopenSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                value={reopenReason}
                onChange={e => setReopenReason(e.target.value)}
                placeholder="State reason for reopening ticket..."
                className="w-full text-xs p-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-bg)] text-[var(--text-main)]"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReopenModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[var(--text-sub)] hover:text-[var(--text-main)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#003C35] hover:bg-[#0B5247] text-white shadow-sm cursor-pointer"
                >
                  Confirm Reopen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
