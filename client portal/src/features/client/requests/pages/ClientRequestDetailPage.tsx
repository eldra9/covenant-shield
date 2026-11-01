/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ClientRequestDetailPage:
 * Service Request Detail view:
 * - Ticket summary & operational scope
 * - Timeline of client-visible history (drawing stroke, ring pulse)
 * - Formal quotation inspection & PDF download
 * - Binding quotation approval confirmation
 * - Modification & cancellation request workflow
 * - "Message us" button linking directly to case desk
 * - RestrictedPostState 403 on foreign/tampered request ID
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Download,
  Shield,
  Calendar,
  AlertOctagon,
  MessageSquare,
} from 'lucide-react';
import { ServiceRequest } from '@/src/types/clientPortal';
import { ClientPageHeader } from '@/src/components/client/ClientPageHeader';
import { ClientStatusBadge } from '@/src/components/client/ClientStatusBadge';
import { Timeline, TimelineStep } from '@/src/components/luxury/Timeline';
import { DispatchTicket } from '@/src/components/luxury/DispatchTicket';
import { RestrictedPostState } from '@/apps/web/src/features/client/components/RestrictedPostState';
import { GuillocheSeal } from '@/src/components/luxury/GuillocheSeal';
import { clientRequestsApi } from '../api/clientRequestsApi';
import { formatEAT, formatKES } from '@/src/api/clientPortalApi';

interface ClientRequestDetailPageProps {
  requestId: string;
  onBack: () => void;
  onRequestUpdated?: () => void;
  onMessageUs?: (requestId: string, reference: string) => void;
}

export const ClientRequestDetailPage: React.FC<ClientRequestDetailPageProps> = ({
  requestId,
  onBack,
  onRequestUpdated,
  onMessageUs,
}) => {
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [isConfirmApproveOpen, setIsConfirmApproveOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await clientRequestsApi.getRequestById(requestId);
      setRequest(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [requestId]);

  const handleApproveQuotation = async () => {
    if (!request) return;
    setApproving(true);
    try {
      const updated = await clientRequestsApi.approveQuotation(request.id);
      setRequest(updated);
      setIsConfirmApproveOpen(false);
      if (onRequestUpdated) onRequestUpdated();
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setApproving(false);
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request || !cancelReason.trim()) return;

    setCancelling(true);
    try {
      const updated = await clientRequestsApi.requestCancellation(request.id, cancelReason);
      setRequest(updated);
      setIsCancelModalOpen(false);
      setCancelReason('');
      if (onRequestUpdated) onRequestUpdated();
    } catch (err: any) {
      alert(`Cancellation request error: ${err.message}`);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-5xl mx-auto">
        <div className="h-8 bg-stone-200 dark:bg-stone-800 rounded w-1/3" />
        <div className="h-44 bg-stone-200 dark:bg-stone-800 rounded-xl" />
        <div className="h-64 bg-stone-200 dark:bg-stone-800 rounded-xl" />
      </div>
    );
  }

  // 403 or Unauthorized ID Handling
  if (error || !request) {
    return (
      <RestrictedPostState
        title="Unauthorized Service Request"
        onBack={onBack}
      />
    );
  }

  const timelineSteps: TimelineStep[] = request.timeline.map((t, idx) => ({
    id: t.id || `tl-${idx}`,
    timestamp: t.timestamp,
    title: t.title,
    status: t.status,
    clientVisibleNotes: t.clientVisibleNotes,
    actorRole: t.actorRole || 'Operations Controller',
  }));

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <ClientPageHeader
        breadcrumbs={[
          { label: 'Service Requests', onClick: onBack },
          { label: request.reference, active: true },
        ]}
        title={request.serviceType}
        description={`Reference: ${request.reference} · Site: ${request.siteName} · Registered: ${formatEAT(request.createdAt)}`}
        action={
          <div className="flex items-center gap-2.5">
            {onMessageUs && (
              <button
                type="button"
                onClick={() => onMessageUs(request.id, request.reference)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface-card)] hover:bg-[var(--emerald-50)] text-[var(--text-main)] text-xs font-medium rounded-lg border border-[var(--surface-border)] shadow-xs transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#A47F2E]" />
                <span>Message Desk</span>
              </button>
            )}

            {request.status !== 'Completed' && request.status !== 'Cancelled' && (
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                className="px-3 py-1.5 bg-[var(--surface-card)] hover:bg-stone-100 text-stone-600 text-xs font-medium rounded-lg border border-[var(--surface-border)] transition-colors cursor-pointer"
              >
                Request Modification
              </button>
            )}
          </div>
        }
      />

      {/* Ticket Voucher Overview */}
      <div className="bg-[var(--surface-card)] rounded-xl border border-[var(--surface-border)] p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--surface-border)]">
          <div className="flex items-center gap-3">
            <span className="font-mono-ref text-xs font-bold text-[#003C35] dark:text-[#C9A04A] bg-[var(--emerald-50)] px-2.5 py-1 rounded border border-[#003C35]/10">
              {request.reference}
            </span>
            <ClientStatusBadge status={request.status} />
            <ClientStatusBadge status={request.priority} />
          </div>

          <div className="text-xs text-[var(--text-sub)] font-mono-ref">
            Deployment: {formatEAT(request.requestedStartDate)}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-sub)] font-mono-ref">
            Deployment Scope & Objectives
          </h4>
          <p className="text-xs text-[var(--text-main)] leading-relaxed">
            {request.description}
          </p>
        </div>
      </div>

      {/* Formal Quotation Section (When Sent or Approved) */}
      {request.quotation && (
        <div className="bg-[var(--surface-card)] rounded-xl border border-[#C9A04A]/40 p-6 shadow-sm space-y-4 relative overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono-ref uppercase tracking-wider text-[#A47F2E] flex items-center gap-1.5">
                <GuillocheSeal size={18} theme="gold" showCenterEmblem={false} />
                Contract Quotation #{request.quotation.quoteNumber}
              </span>
              <h3 className="font-display text-lg font-bold text-[var(--text-main)]">
                Mobilization Commitment: {formatKES(request.quotation.amountKes)}
              </h3>
              <p className="text-xs text-[var(--text-sub)]">
                Valid through {formatEAT(request.quotation.validUntil)} • Issued by Covenant Shield Finance Desk
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-mono-ref font-semibold ${
                request.quotation.status === 'Accepted'
                  ? 'bg-[#E7F3EC] text-[#1E6B45]'
                  : 'bg-[#FFF4DB] text-[#8A5A00]'
              }`}
            >
              {request.quotation.status}
            </span>
          </div>

          {/* Action and Download row */}
          <div className="pt-3 border-t border-[var(--surface-border)] flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                const dummy = document.createElement('a');
                dummy.href = `data:text/plain;charset=utf-8,COVENANT SHIELD OFFICIAL QUOTATION %23${request.quotation?.quoteNumber}%0ATotal Amount: ${formatKES(request.quotation?.amountKes || 0)}%0AClient: Apex Logistics Ltd`;
                dummy.download = `Covenant_Shield_Quotation_${request.quotation?.quoteNumber}.pdf`;
                dummy.click();
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-[var(--surface-border)] hover:bg-[var(--emerald-50)] text-xs font-mono-ref text-[#0B5247] dark:text-[#C9A04A] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Authorized Quotation (PDF)</span>
            </button>

            {request.quotation.status === 'Pending Review' && (
              <button
                type="button"
                onClick={() => setIsConfirmApproveOpen(true)}
                className="px-5 py-2 rounded-lg bg-[#003C35] hover:bg-[#0B5247] text-white text-xs font-semibold tracking-wide shadow-sm transition-all cursor-pointer"
              >
                Accept & Authorize Mobilization
              </button>
            )}
          </div>
        </div>
      )}

      {/* Progress Timeline Section */}
      <div className="bg-[var(--surface-card)] rounded-xl border border-[var(--surface-border)] p-6 shadow-xs space-y-6">
        <h3 className="font-display text-base font-bold text-[var(--text-main)]">
          Deployment Milestones & Timeline
        </h3>
        <Timeline steps={timelineSteps} />
      </div>

      {/* Approval Confirmation Dialog */}
      {isConfirmApproveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[var(--surface-card)] rounded-xl border border-[var(--surface-border)] p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-lg font-bold text-[var(--text-main)]">
              Confirm Quotation Authorization
            </h3>
            <p className="text-xs text-[var(--text-sub)] leading-relaxed">
              By authorizing quotation #{request.quotation?.quoteNumber} ({formatKES(request.quotation?.amountKes || 0)}), you confirm commissioning of Covenant Shield personnel to your site.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmApproveOpen(false)}
                className="px-4 py-2 text-xs text-[var(--text-sub)] hover:text-[var(--text-main)] cursor-pointer"
              >
                Review Further
              </button>
              <button
                type="button"
                onClick={handleApproveQuotation}
                disabled={approving}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#003C35] hover:bg-[#0B5247] text-white shadow-sm cursor-pointer"
              >
                {approving ? 'Authorizing...' : 'Confirm Authorization'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Dialog */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[var(--surface-card)] rounded-xl border border-[var(--surface-border)] p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-lg font-bold text-[var(--text-main)]">
              Request Modification or Cancellation
            </h3>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="State rationale for cancellation or schedule amendment..."
              className="w-full text-xs p-3 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-bg)] text-[var(--text-main)]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 text-xs text-[var(--text-sub)] hover:text-[var(--text-main)] cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleCancelSubmit}
                disabled={cancelling}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#A12B2B] text-white shadow-sm cursor-pointer"
              >
                {cancelling ? 'Transmitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
