import React, { useState } from 'react';
import {
  RequestStatus,
  ServiceRequest,
} from '@/types';
import {
  VALID_REQUEST_TRANSITIONS,
  assignRequestOwner,
  getAllUsers,
  getCurrentUser,
  hasPermission,
  scheduleRequestAssessment,
  setRequestQuotation,
  updateServiceRequestStatus,
} from '@/services/store';
import {
  Calendar,
  DollarSign,
  UserCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { ConfirmActionDialog } from '@/components/admin/ConfirmActionDialog';

interface RequestStatusActionsProps {
  request: ServiceRequest;
  onUpdated: () => void;
}

export const RequestStatusActions: React.FC<RequestStatusActionsProps> = ({
  request,
  onUpdated,
}) => {
  const currentUser = getCurrentUser();
  const canUpdate = hasPermission('requests.update', currentUser);
  const users = getAllUsers();
  const opsStaff = users.filter((u) => u.role === 'operations_staff' || u.role === 'super_admin');

  // Local state for actions
  const [selectedOwner, setSelectedOwner] = useState(request.assignedOwnerId || '');
  const [assessmentDate, setAssessmentDate] = useState(request.assessmentScheduledDate || '');
  const [assessmentNotes, setAssessmentNotes] = useState(request.assessmentNotes || '');
  const [quoteAmount, setQuoteAmount] = useState<string>(
    request.quotationAmountKES ? String(request.quotationAmountKES) : ''
  );
  const [quoteDetails, setQuoteDetails] = useState(request.quotationDetails || '');

  // Transition modal state
  const [targetTransition, setTargetTransition] = useState<RequestStatus | null>(null);
  const [transitionReason, setTransitionReason] = useState('');
  const [transitionError, setTransitionError] = useState<string | null>(null);

  const allowedTransitions = VALID_REQUEST_TRANSITIONS[request.status] || [];

  const handleOwnerAssign = () => {
    if (!selectedOwner) return;
    const ok = assignRequestOwner(request.id, selectedOwner);
    if (ok) onUpdated();
  };

  const handleScheduleAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentDate) return;
    const ok = scheduleRequestAssessment(request.id, assessmentDate, assessmentNotes);
    if (ok) {
      // Auto move status to site_assessment_scheduled if allowed
      if (allowedTransitions.includes('site_assessment_scheduled')) {
        updateServiceRequestStatus(
          request.id,
          'site_assessment_scheduled',
          `Assessment scheduled on ${assessmentDate}`
        );
      }
      onUpdated();
    }
  };

  const handleSaveQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(quoteAmount);
    if (isNaN(amount) || amount <= 0) return;
    const ok = setRequestQuotation(request.id, amount, quoteDetails);
    if (ok) {
      if (allowedTransitions.includes('quotation_sent')) {
        updateServiceRequestStatus(
          request.id,
          'quotation_sent',
          `Quotation dispatched for KES ${amount.toLocaleString()}`
        );
      }
      onUpdated();
    }
  };

  const executeStatusTransition = () => {
    if (!targetTransition) return;
    if (!transitionReason.trim()) {
      setTransitionError('A documented rationale is mandatory for every status transition.');
      return;
    }
    const res = updateServiceRequestStatus(request.id, targetTransition, transitionReason.trim());
    if (res.success) {
      setTargetTransition(null);
      setTransitionReason('');
      setTransitionError(null);
      onUpdated();
    } else {
      setTransitionError(res.error || 'Transition failed');
    }
  };

  if (!canUpdate) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-xs text-slate-400">
        You have read-only visibility for this request under your current role permissions.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Transition Action Buttons */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-slate-200 uppercase font-mono tracking-wider mb-3">
          Lifecycle Transitions
        </h4>

        {allowedTransitions.length === 0 ? (
          <div className="text-xs text-slate-500">
            Request is in terminal state <span className="font-mono">{request.status}</span>. No further transitions permitted.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allowedTransitions.map((status) => {
              const isReject = status === 'rejected' || status === 'cancelled';
              return (
                <button
                  key={status}
                  onClick={() => {
                    setTargetTransition(status);
                    setTransitionReason('');
                    setTransitionError(null);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                    isReject
                      ? 'bg-rose-950/40 text-rose-300 border border-rose-800/60 hover:bg-rose-900/40'
                      : 'bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-750 hover:border-amber-500/50'
                  }`}
                >
                  Transition to {status.replace(/_/g, ' ')}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Owner Assignment */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-slate-200 uppercase font-mono tracking-wider mb-2 flex items-center gap-2">
          <UserCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Assign Operations Owner</span>
        </h4>
        <div className="flex items-center gap-2 mt-2">
          <select
            value={selectedOwner}
            aria-label="Assign operations owner"
            onChange={(e) => setSelectedOwner(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
          >
            <option value="">Select Operations Officer...</option>
            {opsStaff.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role.replace('_', ' ')})
              </option>
            ))}
          </select>
          <button
            onClick={handleOwnerAssign}
            disabled={!selectedOwner || selectedOwner === request.assignedOwnerId}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700"
          >
            Assign
          </button>
        </div>
      </div>

      {/* Site Assessment Scheduling */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-slate-200 uppercase font-mono tracking-wider mb-2 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>Physical Site Assessment</span>
        </h4>
        <form onSubmit={handleScheduleAssessment} className="space-y-2 mt-2">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Assessment Date (EAT)</label>
            <input
              type="date"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Inspector Notes / Scope</label>
            <textarea
              rows={2}
              value={assessmentNotes}
              onChange={(e) => setAssessmentNotes(e.target.value)}
              placeholder="e.g. Inspect perimeter fencing, power backup, CCTV blindspots..."
              className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500 placeholder-slate-600"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Save Assessment Schedule
          </button>
        </form>
      </div>

      {/* Quotation Management */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-slate-200 uppercase font-mono tracking-wider mb-2 flex items-center gap-2">
          <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          <span>Quotation Preparation</span>
        </h4>
        <form onSubmit={handleSaveQuotation} className="space-y-2 mt-2">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              Monthly Contract Sum (KES)
            </label>
            <input
              type="number"
              value={quoteAmount}
              onChange={(e) => setQuoteAmount(e.target.value)}
              placeholder="e.g. 450000"
              className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              Scope of Supply & Inclusions
            </label>
            <textarea
              rows={2}
              value={quoteDetails}
              onChange={(e) => setQuoteDetails(e.target.value)}
              placeholder="e.g. 4 Armed officers (12h rotations), 1 K9 unit, panic buttons..."
              className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500 placeholder-slate-600"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold transition-colors"
          >
            Dispatch / Update Quotation
          </button>
        </form>
      </div>

      {/* Transition Rationale Modal */}
      {targetTransition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5 text-slate-100 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100">
              Confirm Status Transition: <span className="capitalize text-amber-400">{targetTransition.replace(/_/g, ' ')}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Covenant Shield audit compliance requires every state change to include an operational rationale.
            </p>

            <div className="mt-3">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Reason / Action Justification <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                value={transitionReason}
                onChange={(e) => setTransitionReason(e.target.value)}
                placeholder="State the operational reason for this transition..."
                className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            {transitionError && (
              <div className="text-xs text-rose-400 mt-2 bg-rose-950/40 p-2 rounded border border-rose-800/40">
                {transitionError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setTargetTransition(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeStatusTransition}
                className="px-3 py-1.5 text-xs font-medium bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-md font-semibold"
              >
                Confirm & Log Transition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
