import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Lock,
  MapPin,
  MessageSquare,
  Shield,
  ShieldAlert,
  User,
  Users,
  Send,
  RotateCcw,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  addClientMessageToCase,
  getCaseById,
  getCurrentUser,
  hasPermission,
  updateCaseStatus,
  VALID_CASE_TRANSITIONS,
  getAllUsers,
} from '@/services/store';
import { CaseStatus } from '@/types';
import { formatEAT, formatEATDate, nowUTC } from '@/utils/date';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { InternalNoteEditor } from '../components/InternalNoteEditor';
import { showToast } from '@/components/admin/ToastSystem';

interface CaseDetailPageProps {
  caseId: string;
  onBack: () => void;
  onSelectSite?: (siteId: string) => void;
}

export const CaseDetailPage: React.FC<CaseDetailPageProps> = ({
  caseId,
  onBack,
  onSelectSite,
}) => {
  const [, setTick] = useState(0);
  const reload = () => setTick((t) => t + 1);

  const currentCase = getCaseById(caseId);
  const currentUser = getCurrentUser();
  const allUsers = getAllUsers();
  const investigators = allUsers.filter(
    (u) => u.role === 'operations_staff' || u.role === 'super_admin' || u.role === 'supervisor' || (u.role as string) === 'field_supervisor'
  );

  const canResolve = hasPermission('cases.resolve', currentUser);

  const [clientMsgText, setClientMsgText] = useState('');
  const [countdownText, setCountdownText] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);

  // Transition form modal
  const [activeActionModal, setActiveActionModal] = useState<
    'assign' | 'start' | 'propose' | 'close' | 'reopen' | null
  >(null);
  const [actionReason, setActionReason] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [selectedInvestigator, setSelectedInvestigator] = useState('');

  // Live countdown calculation
  useEffect(() => {
    if (!currentCase) return;

    const computeCountdown = () => {
      const deadlineStr = currentCase.resolutionDeadline || currentCase.dueDate;
      const deadline = new Date(deadlineStr).getTime();
      const now = new Date().getTime();
      const diffMs = deadline - now;

      if (diffMs <= 0) {
        setIsOverdue(true);
        const overMs = Math.abs(diffMs);
        const hours = Math.floor(overMs / (1000 * 60 * 60));
        const minutes = Math.floor((overMs % (1000 * 60 * 60)) / (1000 * 60));
        setCountdownText(`OVERDUE BY ${hours}h ${minutes}m`);
      } else {
        setIsOverdue(false);
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        setCountdownText(`${hours}h ${minutes}m remaining`);
      }
    };

    computeCountdown();
    const timer = setInterval(computeCountdown, 10000);
    return () => clearInterval(timer);
  }, [currentCase]);

  if (!currentCase) {
    return (
      <div className="p-8 text-center bg-[#0D322D] border border-[#C9A04A]/25 rounded-xl max-w-lg mx-auto space-y-3">
        <h3 className="text-base font-bold text-[#F4F6F4]">Case Record Inaccessible</h3>
        <p className="text-xs text-[#A0B2AC]">
          This case does not exist or falls outside your authorized organization scope.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold bg-[#003C35] text-[#F4F6F4] rounded-md hover:bg-[#0B5247]"
        >
          Return to Incident Cases
        </button>
      </div>
    );
  }

  const handleSendClientMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientMsgText.trim()) return;
    const ok = addClientMessageToCase(currentCase.id, clientMsgText.trim());
    if (ok) {
      setClientMsgText('');
      showToast({
        type: 'info',
        title: 'Client Communication Posted',
        message: 'Message delivered to client portal contact.',
      });
      reload();
    }
  };

  const executeAction = (newStatus: CaseStatus) => {
    if (!actionReason.trim()) {
      showToast({
        type: 'warning',
        title: 'Rationale Required',
        message: 'Please document an operational rationale for this transition.',
      });
      return;
    }

    const res = updateCaseStatus(
      currentCase.id,
      newStatus,
      actionReason.trim(),
      resolutionSummary.trim() || undefined
    );

    if (res.success) {
      showToast({
        type: 'success',
        title: 'Case Transitioned',
        message: `Case status updated to ${newStatus.replace(/_/g, ' ')}.`,
      });
      setActiveActionModal(null);
      setActionReason('');
      setResolutionSummary('');
      reload();
    } else {
      showToast({
        type: 'danger',
        title: 'Action Failed',
        message: res.error || 'Unable to update case.',
        shake: true,
      });
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header Card */}
      <div className="bg-[#0D322D] border border-[#C9A04A]/25 rounded-xl p-5 emboss-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#003C35] pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 text-[#A0B2AC] hover:text-[#FFFFFF] hover:bg-[#071F1C] rounded-md transition-colors"
              aria-label="Back to cases"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-mono font-bold text-[#E6CB8A]">
                  {currentCase.caseCode || currentCase.caseNumber}
                </span>
                <h1 className="text-lg font-display font-bold text-[#F4F6F4]">
                  {currentCase.title}
                </h1>
                <StatusBadge status={currentCase.status} />

                {/* Severity Badge */}
                <span
                  className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                    currentCase.severity === 'critical'
                      ? 'bg-[#A12B2B]/20 text-[#FBE9E9] border border-[#A12B2B]/40'
                      : currentCase.severity === 'high'
                      ? 'bg-[#8A5A00]/20 text-[#FFF4DB] border border-[#8A5A00]/40'
                      : 'bg-[#071F1C] text-[#A0B2AC] border border-[#003C35]'
                  }`}
                >
                  {currentCase.severity} Severity
                </span>
              </div>
              <p className="text-xs text-[#A0B2AC] mt-0.5">
                Facility: <span className="text-[#F4F6F4] font-medium">{currentCase.siteName}</span> · Logged {formatEAT(currentCase.createdAt)}
              </p>
            </div>
          </div>

          {/* Live Countdown & Overdue Timer */}
          <div className="flex items-center gap-2">
            <div
              className={`px-3 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-2 ${
                isOverdue
                  ? 'bg-[#A12B2B]/20 border-[#A12B2B]/60 text-[#FBE9E9] animate-pulse'
                  : 'bg-[#071F1C] border-[#003C35] text-[#E6CB8A]'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${isOverdue ? 'text-[#A12B2B]' : 'text-[#C9A04A]'}`} />
              <div>
                <span className="text-[10px] text-[#A0B2AC] block leading-none">Target SLA Due</span>
                <span className="font-bold">{countdownText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-mono text-[#A0B2AC] text-[11px] mr-1">Case Actions:</span>

          {currentCase.status === 'submitted' && (
            <>
              <button
                onClick={() => setActiveActionModal('assign')}
                className="px-3 py-1.5 font-semibold text-[#092824] bg-[#C9A04A] hover:bg-[#E6CB8A] rounded transition-colors"
              >
                Assign Investigator
              </button>
              <button
                onClick={() => setActiveActionModal('start')}
                className="px-3 py-1.5 font-semibold text-[#FFFFFF] bg-[#003C35] hover:bg-[#0B5247] border border-[#C9A04A]/30 rounded transition-colors"
              >
                Start Investigation
              </button>
            </>
          )}

          {currentCase.status === 'assigned' && (
            <button
              onClick={() => setActiveActionModal('start')}
              className="px-3 py-1.5 font-semibold text-[#092824] bg-[#C9A04A] hover:bg-[#E6CB8A] rounded transition-colors"
            >
              Start Investigation
            </button>
          )}

          {currentCase.status === 'in_progress' && (
            <button
              onClick={() => setActiveActionModal('propose')}
              className="px-3 py-1.5 font-semibold text-[#092824] bg-[#C9A04A] hover:bg-[#E6CB8A] rounded transition-colors"
            >
              Propose Resolution
            </button>
          )}

          {(currentCase.status === 'resolution_proposed' || currentCase.status === 'in_progress') && (
            <button
              onClick={() => setActiveActionModal('close')}
              className="px-3 py-1.5 font-semibold text-[#FFFFFF] bg-[#1E6B45] hover:bg-[#0B5247] rounded transition-colors"
            >
              Close & Conclude
            </button>
          )}

          {currentCase.status === 'closed' && (
            <button
              onClick={() => setActiveActionModal('reopen')}
              className="px-3 py-1.5 font-semibold text-[#092824] bg-[#C9A04A] hover:bg-[#E6CB8A] rounded transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reopen Case</span>
            </button>
          )}
        </div>
      </div>

      {/* Incident Narrative Details */}
      <div className="bg-[#0D322D] border border-[#C9A04A]/25 rounded-xl p-5 emboss-card space-y-3 text-xs">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#C9A04A] border-b border-[#003C35] pb-2">
          Incident Narrative & Evidence Dossier
        </h3>
        <p className="text-[#F4F6F4] text-sm leading-relaxed bg-[#071F1C] p-3 rounded border border-[#003C35]">
          {currentCase.description}
        </p>

        {currentCase.proposedResolution && (
          <div className="p-3 bg-[#1E6B45]/10 border border-[#1E6B45]/30 rounded text-xs space-y-1">
            <span className="font-mono text-[#1E6B45] font-bold uppercase text-[10px]">
              Proposed Resolution Strategy
            </span>
            <p className="text-[#E7F3EC]">{currentCase.proposedResolution}</p>
          </div>
        )}
      </div>

      {/* TWO SEPARATE PANES: Messages to Client AND Internal Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pane 1: Messages to Client (Plain Panel) */}
        <div className="bg-[#0D322D] border border-[#003C35] rounded-xl p-5 emboss-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#003C35] pb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#1D4E89]" />
              <h4 className="text-xs font-bold text-[#F4F6F4] uppercase font-mono tracking-wider">
                Messages to Client Portal
              </h4>
            </div>
            <span className="text-[10px] font-mono uppercase bg-[#1D4E89]/20 text-[#E8F0FA] px-2 py-0.5 rounded border border-[#1D4E89]/30">
              Customer Safe
            </span>
          </div>

          <form onSubmit={handleSendClientMessage} className="space-y-2">
            <textarea
              rows={2}
              value={clientMsgText}
              onChange={(e) => setClientMsgText(e.target.value)}
              placeholder="Send official update or report findings directly to customer..."
              className="w-full bg-[#071F1C] border border-[#003C35] rounded p-2.5 text-xs text-[#F4F6F4] placeholder-[#52625D] focus:outline-none focus:border-[#C9A04A]"
            />
            <button
              type="submit"
              disabled={!clientMsgText.trim()}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#C9A04A] hover:bg-[#E6CB8A] text-[#092824] rounded transition-colors disabled:opacity-40"
            >
              Send Customer Dispatch
            </button>
          </form>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto divide-y divide-[#003C35]">
            {currentCase.clientMessages.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#52625D]">
                No customer messages published yet.
              </div>
            ) : (
              currentCase.clientMessages.map((msg) => (
                <div key={msg.id} className="pt-2 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-[#F4F6F4] font-semibold">{msg.senderName} ({msg.senderRole})</span>
                    <span className="text-[#52625D]">{formatEAT(msg.createdAt)}</span>
                  </div>
                  <p className="text-xs text-[#F4F6F4] bg-[#071F1C] p-2.5 rounded border border-[#003C35]">
                    {msg.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pane 2: Internal Notes (Hatched, Lock Icon, Amber Badge) */}
        <div className="border border-[#C9A04A]/35 rounded-xl p-5 hatched-internal space-y-4">
          <div className="flex items-center justify-between border-b border-[#C9A04A]/25 pb-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#C9A04A]" />
              <h4 className="text-xs font-bold text-[#F4F6F4] uppercase font-mono tracking-wider">
                Internal Operations Notes
              </h4>
            </div>
            <span className="text-[10px] font-mono uppercase bg-[#C9A04A]/20 text-[#E6CB8A] px-2 py-0.5 rounded border border-[#C9A04A]/40 font-bold">
              Internal Only · Never Visible to Client
            </span>
          </div>

          <InternalNoteEditor
            caseId={currentCase.id}
            onNoteAdded={reload}
          />

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto divide-y divide-[#003C35]">
            {currentCase.internalNotes.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#52625D]">
                No private operations notes documented yet.
              </div>
            ) : (
              currentCase.internalNotes.map((note) => (
                <div key={note.id} className="pt-2 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-[#E6CB8A] font-semibold">{note.authorName} ({note.authorRole})</span>
                    <span className="text-[#52625D]">{formatEAT(note.createdAt)}</span>
                  </div>
                  <p className="text-xs text-[#F4F6F4] bg-[#071F1C]/80 p-2.5 rounded border border-[#003C35]">
                    {note.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Audit Timeline */}
      <div className="bg-[#0D322D] border border-[#C9A04A]/25 rounded-xl p-5 emboss-card space-y-3">
        <h4 className="text-xs font-bold text-[#C9A04A] uppercase font-mono tracking-wider border-b border-[#003C35] pb-2">
          Investigation Lifecycle Audit History
        </h4>
        <div className="space-y-2.5">
          {currentCase.statusHistory.map((h, idx) => (
            <div key={h.id || idx} className="border-l-2 border-[#C9A04A] pl-3 py-1 space-y-0.5 text-xs">
              <div className="flex items-center justify-between font-mono">
                <span className="text-[#E6CB8A] font-semibold capitalize">
                  {h.fromStatus.replace(/_/g, ' ')} → {h.toStatus.replace(/_/g, ' ')}
                </span>
                <span className="text-[#52625D] text-[10px]">{formatEAT(h.timestamp)}</span>
              </div>
              <p className="text-[#A0B2AC]">{h.reason}</p>
              <div className="text-[10px] text-[#52625D] font-mono">
                Actor: {h.actorName} ({h.actorRole})
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Dialog Modals */}
      {activeActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#0D322D] border border-[#C9A04A]/40 rounded-xl p-6 max-w-md w-full space-y-4 text-xs emboss-card">
            <h3 className="text-sm font-bold text-[#F4F6F4] font-sans">
              {activeActionModal === 'assign' && 'Assign Case Lead Investigator'}
              {activeActionModal === 'start' && 'Begin Active Field Investigation'}
              {activeActionModal === 'propose' && 'Propose Corrective Resolution'}
              {activeActionModal === 'close' && 'Conclude & Close Incident Case'}
              {activeActionModal === 'reopen' && 'Reopen Incident Investigation'}
            </h3>

            {activeActionModal === 'assign' && (
              <div className="space-y-1">
                <label className="text-[11px] text-[#A0B2AC] block font-mono">Select Assigned Officer</label>
                <select
                  value={selectedInvestigator}
                  onChange={(e) => setSelectedInvestigator(e.target.value)}
                  className="w-full bg-[#071F1C] border border-[#003C35] rounded p-2 text-xs text-[#F4F6F4]"
                >
                  <option value="">Select Investigator...</option>
                  {investigators.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} ({inv.role.replace(/_/g, ' ')})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeActionModal === 'propose' && (
              <div className="space-y-1">
                <label className="text-[11px] text-[#A0B2AC] block font-mono">Corrective Resolution Summary</label>
                <textarea
                  rows={2}
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                  placeholder="Outline corrective action taken and guard disciplinary review..."
                  className="w-full bg-[#071F1C] border border-[#003C35] rounded p-2 text-xs text-[#F4F6F4]"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] text-[#A0B2AC] block font-mono">Documented Operational Rationale</label>
              <textarea
                rows={2}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Reason for lifecycle transition..."
                className="w-full bg-[#071F1C] border border-[#003C35] rounded p-2 text-xs text-[#F4F6F4]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#003C35]">
              <button
                onClick={() => setActiveActionModal(null)}
                className="px-3 py-1.5 text-xs text-[#A0B2AC] hover:text-[#FFFFFF]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (activeActionModal === 'assign') executeAction('assigned');
                  if (activeActionModal === 'start') executeAction('in_progress');
                  if (activeActionModal === 'propose') executeAction('resolution_proposed');
                  if (activeActionModal === 'close') executeAction('closed');
                  if (activeActionModal === 'reopen') executeAction('reopened');
                }}
                className="px-3.5 py-1.5 text-xs font-semibold bg-[#C9A04A] hover:bg-[#E6CB8A] text-[#092824] rounded"
              >
                Confirm Transition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
