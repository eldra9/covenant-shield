import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Shield,
  User,
  Users,
  Send,
  FileText,
  Upload,
  Download,
  Building,
  CheckCircle2,
  AlertTriangle,
  History,
  FileSpreadsheet,
  Check,
  UserPlus,
} from 'lucide-react';
import { RequestAssignmentModal } from '../components/RequestAssignmentModal';
import {
  addClientMessageToRequest,
  addInternalNoteToRequest,
  convertRequestToClientAndSite,
  getCurrentUser,
  getServiceRequestById,
  updateServiceRequestStatus,
  VALID_REQUEST_TRANSITIONS,
} from '@/services/store';
import { formatEAT, formatEATDate } from '@/utils/date';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { StatusStepper } from '@/components/admin/StatusStepper';
import { showToast } from '@/components/admin/ToastSystem';
import { RequestStatus } from '@/types';

interface RequestDetailPageProps {
  requestId: string;
  onBack: () => void;
  onSelectSite?: (siteId: string) => void;
  onSelectClient?: (clientId: string) => void;
}

export const RequestDetailPage: React.FC<RequestDetailPageProps> = ({
  requestId,
  onBack,
  onSelectSite,
  onSelectClient,
}) => {
  const [, setTick] = useState(0);
  const reload = () => setTick((t) => t + 1);

  const request = getServiceRequestById(requestId);
  const currentUser = getCurrentUser();

  const [activeTab, setActiveTab] = useState<'history' | 'notes' | 'files'>('notes');
  const [internalNoteText, setInternalNoteText] = useState('');
  const [clientMessageText, setClientMessageText] = useState('');
  const [quotationAmountInput, setQuotationAmountInput] = useState(
    request?.quotationAmountKES ? String(request.quotationAmountKES) : '185000'
  );
  const [isUploadingQuote, setIsUploadingQuote] = useState(false);
  const [quoteUploaded, setQuoteUploaded] = useState(!!request?.quotationAmountKES);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  if (!request) {
    return (
      <div className="p-8 text-center bg-[#0D322D] border border-[#C9A04A]/25 rounded-xl max-w-lg mx-auto space-y-3">
        <h3 className="text-base font-bold text-[#F4F6F4]">Service Request Not Found</h3>
        <p className="text-xs text-[#A0B2AC]">
          The requested record could not be found or your role does not possess authorization to view this intake record.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold bg-[#003C35] text-[#F4F6F4] rounded-md hover:bg-[#0B5247]"
        >
          Return to Request List
        </button>
      </div>
    );
  }

  const allowedTransitions = VALID_REQUEST_TRANSITIONS[request.status] || [];
  const isAccepted = request.status === 'accepted' || request.status === 'contract_active';

  const pipelineSteps = [
    { id: 'new', label: 'New Inbound' },
    { id: 'under_review', label: 'Under Review' },
    { id: 'site_assessment_scheduled', label: 'Survey Scheduled' },
    { id: 'quotation_sent', label: 'Quotation Dispatched' },
    { id: 'accepted', label: 'Accepted by Client' },
    { id: 'contract_active', label: 'Contract Active' },
  ];

  const handleAddInternalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNoteText.trim()) return;
    const ok = addInternalNoteToRequest(request.id, internalNoteText.trim());
    if (ok) {
      setInternalNoteText('');
      showToast({
        type: 'success',
        title: 'Internal Note Recorded',
        message: 'Private operational briefing note archived with encryption.',
      });
      reload();
    }
  };

  const handleAddClientMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientMessageText.trim()) return;
    const ok = addClientMessageToRequest(request.id, clientMessageText.trim());
    if (ok) {
      setClientMessageText('');
      showToast({
        type: 'info',
        title: 'Client Communication Dispatched',
        message: 'Notification sent to customer contact point.',
      });
      reload();
    }
  };

  const handleUploadQuotationMock = () => {
    setIsUploadingQuote(true);
    setTimeout(() => {
      setIsUploadingQuote(false);
      setQuoteUploaded(true);
      showToast({
        type: 'success',
        title: 'Quotation Document Attached',
        message: `Quotation PDF verified for KES ${parseFloat(quotationAmountInput).toLocaleString()} + VAT.`,
      });
    }, 700);
  };

  const handleConvertToClientAndSite = () => {
    const res = convertRequestToClientAndSite(request.id);
    if (res.success) {
      showToast({
        type: 'success',
        title: 'Account Provisioned',
        message: `Successfully created Client "${res.client?.companyName}" and Security Site "${res.site?.name}".`,
      });
      reload();
    } else {
      showToast({
        type: 'danger',
        title: 'Conversion Halted',
        message: res.error || 'Unable to provision client and site.',
        shake: true,
      });
    }
  };

  const handleExecuteTransition = (nextStatus: RequestStatus) => {
    const ok = updateServiceRequestStatus(
      request.id,
      nextStatus,
      `Transitioned via Command Centre Stepper by ${currentUser.name}`
    );
    if (ok) {
      showToast({
        type: 'success',
        title: 'Status Transition Executed',
        message: `Request moved to ${nextStatus.replace(/_/g, ' ')}.`,
      });
      reload();
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Summary Ticket */}
      <div className="bg-[#0D322D] border border-[#C9A04A]/25 rounded-xl p-5 emboss-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#003C35] pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 text-[#A0B2AC] hover:text-[#FFFFFF] hover:bg-[#071F1C] rounded-md transition-colors"
              aria-label="Back to requests"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-display font-bold text-[#F4F6F4]">
                  {request.clientName}
                </h1>
                <StatusBadge status={request.status} />
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#A0B2AC] mt-0.5">
                <span className="text-[#E6CB8A] font-semibold">{request.requestCode || request.referenceNumber}</span>
                <span>·</span>
                <span>Submitted {formatEAT(request.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Quick Convert Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleConvertToClientAndSite}
              disabled={!isAccepted}
              title={
                !isAccepted
                  ? 'Disabled: Service request must be in "accepted" status before converting into an active client and site.'
                  : 'Convert to official client account and stationed security site'
              }
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                isAccepted
                  ? 'bg-[#C9A04A] hover:bg-[#E6CB8A] text-[#092824] shadow-xs cursor-pointer'
                  : 'bg-[#071F1C] text-[#52625D] border border-[#003C35] cursor-not-allowed opacity-60'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Convert to Client & Site</span>
            </button>
          </div>
        </div>

        {/* Stepper with only valid next transitions */}
        <StatusStepper
          steps={pipelineSteps}
          currentStepId={request.status}
          onSelectStep={(id) => handleExecuteTransition(id as RequestStatus)}
          allowedTransitions={allowedTransitions}
        />
      </div>

      {/* Main Grid: Ticket Details + Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scope & Ticket Parameters */}
        <div className="space-y-4">
          <div className="bg-[#0D322D] border border-[#C9A04A]/25 rounded-xl p-5 emboss-card space-y-4 text-xs">
            <h3 className="text-xs font-bold font-mono tracking-wider text-[#C9A04A] uppercase border-b border-[#003C35] pb-2">
              Facility & Scope Specification
            </h3>

            <div className="space-y-3">
              <div>
                <span className="text-[#A0B2AC] block text-[11px]">Proposed Facility Name</span>
                <span className="text-[#F4F6F4] font-medium text-sm">{request.siteName || request.siteAddress}</span>
              </div>

              <div>
                <span className="text-[#A0B2AC] block text-[11px]">Physical Coordinates & Address</span>
                <span className="text-[#F4F6F4] font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C9A04A] shrink-0" />
                  <span>{request.locationAddress || request.siteAddress}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#003C35]">
                <div>
                  <span className="text-[#A0B2AC] block text-[11px]">Service Class</span>
                  <span className="text-[#E6CB8A] font-mono font-medium capitalize">
                    {request.serviceType.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-[#A0B2AC] block text-[11px]">Required Force</span>
                  <span className="text-[#F4F6F4] font-mono font-bold text-sm">
                    {request.requiredGuards} Guards
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#003C35]">
                <span className="text-[#A0B2AC] block text-[11px]">Client Contact Representative</span>
                <div className="text-[#F4F6F4] font-medium mt-0.5">{request.contactName || request.clientName}</div>
                <div className="text-[11px] text-[#A0B2AC] font-mono flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#C9A04A]" /> {request.contactEmail}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#C9A04A]" /> {request.contactPhone}
                  </span>
                </div>
              </div>

              {request.urgency && (
                <div className="pt-2 border-t border-[#003C35] flex items-center justify-between">
                  <span className="text-[#A0B2AC] text-[11px]">Deployment Urgency</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#C9A04A]/20 text-[#E6CB8A] uppercase">
                    {request.urgency}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Guard Allocation Card */}
          <div className="bg-[#0D322D] border border-[#C9A04A]/25 rounded-xl p-5 emboss-card space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#003C35] pb-2">
              <h3 className="text-xs font-bold font-mono tracking-wider text-[#C9A04A] uppercase flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#20C997]" />
                <span>Guard Allocation ({request.assignedGuardIds?.length || 0}/{request.requiredGuards || 1})</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAssignmentModalOpen(true)}
                className="px-2.5 py-1 text-[11px] font-mono font-bold rounded bg-[#20C997] hover:bg-[#20C997]/90 text-[#090A0D] flex items-center gap-1 cursor-pointer transition"
              >
                <UserPlus className="w-3 h-3" />
                <span>{(request.assignedGuardIds?.length || 0) > 0 ? 'Edit Guards' : 'Assign Guards'}</span>
              </button>
            </div>

            <div className="space-y-2">
              {request.assignedGuards && request.assignedGuards.length > 0 ? (
                <div className="space-y-2">
                  {request.assignedGuards.map((g, idx) => {
                    const gName = typeof g === 'string' ? g : ((g as any)?.name || (g as any)?.fullName || `Guard ${idx + 1}`);
                    const gBadge = typeof g === 'string' ? '' : (g?.badgeNumber || '');
                    const gRank = typeof g === 'string' ? 'Tactical Sentry' : (g?.rank || 'Tactical Sentry');
                    const gPhone = typeof g === 'string' ? '' : (g?.phone || '');

                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-[#071F1C] border border-[#1E6B45]/40 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-[#20C997]/20 border border-[#20C997]/40 text-[#20C997] flex items-center justify-center font-bold text-xs font-mono shrink-0">
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-white truncate text-xs">{gName}</div>
                            <div className="text-[10px] text-[#A0B2AC] font-mono truncate">
                              {gBadge ? `${gBadge} · ` : ''}{gRank}
                            </div>
                          </div>
                        </div>
                        {gPhone && (
                          <div className="text-[10px] font-mono text-[#20C997] shrink-0">
                            {gPhone}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 text-center rounded-lg bg-[#071F1C] border border-dashed border-[#003C35] text-[#A0B2AC]">
                  <p className="text-[11px]">No security officers assigned yet.</p>
                  <button
                    type="button"
                    onClick={() => setIsAssignmentModalOpen(true)}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-[#20C997]/15 hover:bg-[#20C997]/25 text-[#20C997] border border-[#20C997]/40 cursor-pointer transition"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Assign Guards Now</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quotation Management Card */}
          <div className="bg-[#0D322D] border border-[#C9A04A]/25 rounded-xl p-5 emboss-card space-y-3 text-xs">
            <h3 className="text-xs font-bold font-mono tracking-wider text-[#C9A04A] uppercase border-b border-[#003C35] pb-2 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Quotation & Proposal (PDF)</span>
            </h3>

            <div className="space-y-2">
              <label className="text-[11px] text-[#A0B2AC] block font-mono">
                Monthly Rate Proposal (KES)
              </label>
              <input
                type="number"
                value={quotationAmountInput}
                onChange={(e) => setQuotationAmountInput(e.target.value)}
                className="w-full bg-[#071F1C] border border-[#003C35] rounded p-2 text-xs text-[#F4F6F4] font-mono"
              />

              <div className="pt-1 flex items-center gap-2">
                <button
                  onClick={handleUploadQuotationMock}
                  disabled={isUploadingQuote}
                  className="flex-1 py-1.5 text-xs font-semibold bg-[#003C35] hover:bg-[#0B5247] text-[#FFFFFF] rounded border border-[#C9A04A]/30 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-[#C9A04A]" />
                  <span>{isUploadingQuote ? 'Attaching PDF...' : 'Attach Quotation PDF'}</span>
                </button>
              </div>

              {quoteUploaded && (
                <div className="p-2.5 bg-[#071F1C] rounded border border-[#1E6B45]/40 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-[#E7F3EC]">
                    <CheckCircle2 className="w-4 h-4 text-[#1E6B45]" />
                    <span className="font-mono">CS-QUOTE-{request.requestCode || request.referenceNumber}.pdf</span>
                  </div>
                  <button className="text-[#C9A04A] hover:underline flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Panels (History, Notes, Files) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs bar */}
          <div className="flex items-center gap-2 border-b border-[#003C35] pb-2">
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'notes'
                  ? 'bg-[#C9A04A] text-[#092824] font-semibold'
                  : 'text-[#A0B2AC] hover:text-[#FFFFFF]'
              }`}
            >
              Notes & Communications
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'history'
                  ? 'bg-[#C9A04A] text-[#092824] font-semibold'
                  : 'text-[#A0B2AC] hover:text-[#FFFFFF]'
              }`}
            >
              Timeline History ({request.statusHistory?.length || 1})
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'files'
                  ? 'bg-[#C9A04A] text-[#092824] font-semibold'
                  : 'text-[#A0B2AC] hover:text-[#FFFFFF]'
              }`}
            >
              Document Files
            </button>
          </div>

          {/* TAB 1: Notes & Communications */}
          {activeTab === 'notes' && (
            <div className="space-y-5">
              {/* Internal Notes Panel with Lock Icon, Amber Badge, and Hatched Background */}
              <div className="border border-[#C9A04A]/35 rounded-xl p-5 hatched-internal space-y-3">
                <div className="flex items-center justify-between border-b border-[#C9A04A]/25 pb-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#C9A04A]" />
                    <h4 className="text-xs font-bold text-[#F4F6F4] uppercase font-mono tracking-wider">
                      Internal Operations Briefing Notes
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-[#C9A04A]/20 text-[#E6CB8A] px-2 py-0.5 rounded border border-[#C9A04A]/40 font-bold">
                    Internal Only · Never Visible to Client
                  </span>
                </div>

                <form onSubmit={handleAddInternalNote} className="space-y-2">
                  <textarea
                    rows={2}
                    value={internalNoteText}
                    onChange={(e) => setInternalNoteText(e.target.value)}
                    placeholder="Document guard vetting, supervisor assessment observations, or background checks..."
                    className="w-full bg-[#071F1C] border border-[#003C35] rounded p-2.5 text-xs text-[#F4F6F4] placeholder-[#52625D] focus:outline-none focus:border-[#C9A04A]"
                  />
                  <button
                    type="submit"
                    disabled={!internalNoteText.trim()}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-[#003C35] hover:bg-[#0B5247] text-[#FFFFFF] rounded border border-[#C9A04A]/30 transition-colors disabled:opacity-40"
                  >
                    Post Internal Note
                  </button>
                </form>

                <div className="space-y-2 pt-2 divide-y divide-[#003C35]">
                  {request.internalNotes.map((note) => (
                    <div key={note.id} className="pt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#E6CB8A] font-semibold">{note.authorName} ({note.authorRole})</span>
                        <span className="text-[#52625D]">{formatEAT(note.createdAt)}</span>
                      </div>
                      <p className="text-xs text-[#F4F6F4] bg-[#071F1C]/80 p-2.5 rounded border border-[#003C35]">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Client-Visible Messages Panel in Plain Surface */}
              <div className="bg-[#0D322D] border border-[#003C35] rounded-xl p-5 emboss-card space-y-3">
                <div className="flex items-center justify-between border-b border-[#003C35] pb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#1D4E89]" />
                    <h4 className="text-xs font-bold text-[#F4F6F4] uppercase font-mono tracking-wider">
                      Client-Visible Communications
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-[#1D4E89]/20 text-[#E8F0FA] px-2 py-0.5 rounded border border-[#1D4E89]/30">
                    Shared with Customer
                  </span>
                </div>

                <form onSubmit={handleAddClientMessage} className="space-y-2">
                  <textarea
                    rows={2}
                    value={clientMessageText}
                    onChange={(e) => setClientMessageText(e.target.value)}
                    placeholder="Send update or quotation clarification visible in client portal..."
                    className="w-full bg-[#071F1C] border border-[#003C35] rounded p-2.5 text-xs text-[#F4F6F4] placeholder-[#52625D] focus:outline-none focus:border-[#C9A04A]"
                  />
                  <button
                    type="submit"
                    disabled={!clientMessageText.trim()}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-[#C9A04A] hover:bg-[#E6CB8A] text-[#092824] rounded transition-colors disabled:opacity-40"
                  >
                    Send Message to Client
                  </button>
                </form>

                <div className="space-y-2 pt-2 divide-y divide-[#003C35]">
                  {request.clientMessages.map((msg) => (
                    <div key={msg.id} className="pt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#F4F6F4] font-semibold">{msg.senderName} ({msg.senderRole})</span>
                        <span className="text-[#52625D]">{formatEAT(msg.createdAt)}</span>
                      </div>
                      <p className="text-xs text-[#F4F6F4] bg-[#071F1C] p-2.5 rounded border border-[#003C35]">
                        {msg.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: History (Timeline) */}
          {activeTab === 'history' && (
            <div className="bg-[#0D322D] border border-[#C9A04A]/25 rounded-xl p-5 emboss-card space-y-4">
              <h4 className="text-xs font-bold text-[#C9A04A] uppercase font-mono tracking-wider border-b border-[#003C35] pb-2">
                Audit Timeline of State Transitions
              </h4>

              <div className="space-y-3">
                {request.statusHistory?.map((h, idx) => (
                  <div key={h.id || idx} className="border-l-2 border-[#C9A04A]/60 pl-3 py-1 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#E6CB8A] font-semibold capitalize">
                        {h.fromStatus.replace(/_/g, ' ')} → {h.toStatus.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[#52625D] text-[10px]">{formatEAT(h.timestamp)}</span>
                    </div>
                    <p className="text-xs text-[#A0B2AC]">{h.reason}</p>
                    <div className="text-[10px] font-mono text-[#52625D]">
                      Authorized by: {h.actorName} ({h.actorRole})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Document Files */}
          {activeTab === 'files' && (
            <div className="bg-[#0D322D] border border-[#C9A04A]/25 rounded-xl p-5 emboss-card space-y-4">
              <h4 className="text-xs font-bold text-[#C9A04A] uppercase font-mono tracking-wider border-b border-[#003C35] pb-2">
                Attached Survey & Security Files
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#071F1C] rounded border border-[#003C35] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#C9A04A]" />
                    <div>
                      <div className="font-semibold text-[#F4F6F4]">Site_Survey_NBO.pdf</div>
                      <div className="text-[10px] font-mono text-[#52625D]">2.4 MB · Verified</div>
                    </div>
                  </div>
                  <button className="text-[#C9A04A] hover:underline font-mono text-xs">Download</button>
                </div>

                <div className="p-3 bg-[#071F1C] rounded border border-[#003C35] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#C9A04A]" />
                    <div>
                      <div className="font-semibold text-[#F4F6F4]">Perimeter_Access_Map.png</div>
                      <div className="text-[10px] font-mono text-[#52625D]">4.1 MB · High Res</div>
                    </div>
                  </div>
                  <button className="text-[#C9A04A] hover:underline font-mono text-xs">View</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#092824]/95 backdrop-blur-md border-t border-[#C9A04A]/30 p-3 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-[#A0B2AC]">
          <span>Current Lifecycle:</span>
          <span className="text-[#E6CB8A] font-bold uppercase">{request.status.replace(/_/g, ' ')}</span>
        </div>

        <div className="flex items-center gap-2">
          {allowedTransitions.map((next) => (
            <button
              key={next}
              onClick={() => handleExecuteTransition(next)}
              className="px-3 py-1.5 text-xs font-semibold rounded bg-[#003C35] hover:bg-[#0B5247] text-[#FFFFFF] border border-[#C9A04A]/30 transition-colors"
            >
              Transition to {next.replace(/_/g, ' ')}
            </button>
          ))}
          {isAccepted && (
            <button
              onClick={handleConvertToClientAndSite}
              className="px-3.5 py-1.5 text-xs font-semibold rounded bg-[#C9A04A] hover:bg-[#E6CB8A] text-[#092824] transition-colors"
            >
              Deploy Site & Client
            </button>
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      <RequestAssignmentModal
        request={request}
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        onAssignmentComplete={() => {
          setIsAssignmentModalOpen(false);
          reload();
        }}
      />
    </div>
  );
};
