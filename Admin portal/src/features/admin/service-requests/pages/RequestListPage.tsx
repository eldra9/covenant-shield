import React, { useState, useMemo } from 'react';
import {
  Shield,
  UserPlus,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  ArrowRight,
  FileText,
  Filter,
  Check,
  Briefcase,
  Building2,
  MapPin,
  Calendar,
} from 'lucide-react';
import { getServiceRequests, getEmployees, subscribe, syncWithBackend } from '@/services/store';
import { ServiceRequest, Employee } from '@/types';
import { formatEATDate } from '@/utils/date';
import { RequestAssignmentModal } from '../components/RequestAssignmentModal';

interface RequestListPageProps {
  onSelectRequest: (requestId: string) => void;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  new: {
    label: 'NEW INBOUND',
    bg: 'bg-[#FF8A35]/15',
    text: 'text-[#FF8A35]',
    border: 'border-[#FF8A35]/40',
  },
  under_review: {
    label: 'UNDER REVIEW',
    bg: 'bg-[#398BFF]/15',
    text: 'text-[#398BFF]',
    border: 'border-[#398BFF]/40',
  },
  site_assessment_scheduled: {
    label: 'SITE SURVEY',
    bg: 'bg-purple-500/15',
    text: 'text-purple-400',
    border: 'border-purple-400/40',
  },
  quotation_sent: {
    label: 'QUOTATION SENT',
    bg: 'bg-[#C9A04A]/15',
    text: 'text-[#C9A04A]',
    border: 'border-[#C9A04A]/40',
  },
  accepted: {
    label: 'ACCEPTED',
    bg: 'bg-[#20C997]/15',
    text: 'text-[#20C997]',
    border: 'border-[#20C997]/40',
  },
  contract_active: {
    label: 'CONTRACT ACTIVE',
    bg: 'bg-[#20C997]/20',
    text: 'text-[#20C997]',
    border: 'border-[#20C997]/60',
  },
  rejected: {
    label: 'REJECTED',
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    border: 'border-red-400/40',
  },
  cancelled: {
    label: 'CANCELLED',
    bg: 'bg-[#30343B]/50',
    text: 'text-[#A5A9B0]',
    border: 'border-[#30343B]',
  },
};

const SERVICE_ICONS: Record<string, string> = {
  armed_guarding: '🛡️',
  corporate_patrol: '🚶',
  vip_close_protection: '🕵️',
  cctv_monitoring: '📷',
  event_security: '🎪',
};

export const RequestListPage: React.FC<RequestListPageProps> = ({ onSelectRequest }) => {
  const [, setTick] = useState(0);
  const reload = () => setTick((t) => t + 1);

  React.useEffect(() => {
    return subscribe(() => setTick((t) => t + 1));
  }, []);

  const allRequests = getServiceRequests();
  const allEmployees = getEmployees();

  // Active view tab: 'requests' (inbound requests awaiting deployment) vs 'contracts' (active deployed contracts)
  const [activeTab, setActiveTab] = useState<'requests' | 'contracts'>('requests');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignmentModal, setAssignmentModal] = useState<ServiceRequest | null>(null);

  // --- Counts ---
  const pendingRequests = allRequests.filter((r) => r.status !== 'contract_active' && r.status !== 'cancelled' && r.status !== 'rejected');
  const activeContracts = allRequests.filter((r) => r.status === 'contract_active');
  const newCount = allRequests.filter((r) => r.status === 'new').length;
  const unassignedCount = allRequests.filter(
    (r) =>
      r.status !== 'contract_active' &&
      (!r.assignedGuardIds || r.assignedGuardIds.length === 0)
  ).length;

  // Guard stats
  const availableGuards = allEmployees.filter(
    (e) => e.employmentStatus === 'active' && e.isAvailable !== false
  ).length;
  const deployedGuards = allEmployees.filter(
    (e) => e.isAvailable === false || e.employmentStatus !== 'active'
  ).length;

  // Current list based on active tab
  const currentList = activeTab === 'requests' ? pendingRequests : activeContracts;

  // Filtered list
  const filteredList = useMemo(() => {
    return currentList.filter((r) => {
      const matchSearch =
        !searchTerm ||
        r.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.siteAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [currentList, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#C9A04A]" />
            Operations Control: Requests &amp; Active Contracts
          </h2>
          <p className="text-xs text-[#A5A9B0] mt-0.5">
            Assign guards to deploy inbound requests into Active Contracts.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1 p-1 bg-[#15171B] border border-[#30343B] rounded-xl font-mono text-xs">
          <button
            type="button"
            onClick={() => { setActiveTab('requests'); setStatusFilter('all'); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'requests'
                ? 'bg-[#FF8A35]/20 text-[#FF8A35] font-bold border border-[#FF8A35]/40 shadow-sm'
                : 'text-[#A5A9B0] hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Inbound Requests</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#FF8A35]/30 text-[#FF8A35]">
              {pendingRequests.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('contracts'); setStatusFilter('all'); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'contracts'
                ? 'bg-[#20C997]/20 text-[#20C997] font-bold border border-[#20C997]/40 shadow-sm'
                : 'text-[#A5A9B0] hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active Contracts</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#20C997]/30 text-[#20C997]">
              {activeContracts.length}
            </span>
          </button>
        </div>
      </div>

      {/* ── KPI SUMMARY ROW ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Inbound Requests */}
        <div
          onClick={() => setActiveTab('requests')}
          className={`p-3.5 bg-[#15171B] border rounded-xl cursor-pointer transition ${
            activeTab === 'requests' ? 'border-[#FF8A35]' : 'border-[#30343B] hover:border-[#FF8A35]/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono text-[#A5A9B0] uppercase tracking-wider">Awaiting Deployment</span>
            <Clock className="w-3.5 h-3.5 text-[#FF8A35]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#FF8A35]">{pendingRequests.length}</div>
          <div className="text-[10px] text-[#A5A9B0] mt-0.5">{unassignedCount} need guards</div>
        </div>

        {/* Active Contracts */}
        <div
          onClick={() => setActiveTab('contracts')}
          className={`p-3.5 bg-[#15171B] border rounded-xl cursor-pointer transition ${
            activeTab === 'contracts' ? 'border-[#20C997]' : 'border-[#30343B] hover:border-[#20C997]/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono text-[#A5A9B0] uppercase tracking-wider">Active Contracts</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#20C997]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#20C997]">{activeContracts.length}</div>
          <div className="text-[10px] text-[#A5A9B0] mt-0.5">Deployed &amp; operational</div>
        </div>

        {/* Guards Available */}
        <div className="p-3.5 bg-[#15171B] border border-[#30343B] rounded-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono text-[#A5A9B0] uppercase tracking-wider">Guards Available</span>
            <Shield className="w-3.5 h-3.5 text-[#20C997]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#20C997]">{availableGuards}</div>
          <div className="text-[10px] text-[#A5A9B0] mt-0.5">Ready for deployment</div>
        </div>

        {/* Guards Deployed */}
        <div className="p-3.5 bg-[#15171B] border border-[#30343B] rounded-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono text-[#A5A9B0] uppercase tracking-wider">Guards Deployed</span>
            <Users className="w-3.5 h-3.5 text-[#398BFF]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#398BFF]">{deployedGuards}</div>
          <div className="text-[10px] text-[#A5A9B0] mt-0.5">Stationed on posts</div>
        </div>
      </div>

      {/* ── GUARD ROSTER STATUS PANEL ── */}
      <div className="p-4 bg-[#15171B] border border-[#30343B] rounded-xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#30343B]/60 mb-3">
          <h3 className="text-xs font-mono font-bold uppercase text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#398BFF]" />
            Security Force Roster — {allEmployees.length} Officers
          </h3>
          <span className="text-[10px] font-mono text-[#A5A9B0]">
            {availableGuards} Available · {deployedGuards} Deployed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {allEmployees.length === 0 ? (
            <div className="col-span-full text-xs text-[#A5A9B0] font-mono text-center py-4">
              Loading security personnel roster...
            </div>
          ) : (
            allEmployees.map((emp) => {
              const isAvailable = emp.isAvailable !== false && emp.employmentStatus === 'active';
              return (
                <div
                  key={emp.id}
                  className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                    isAvailable
                      ? 'bg-[#0E1F1A] border-[#20C997]/30'
                      : 'bg-[#14161A] border-[#30343B] opacity-80'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 font-mono ${
                      isAvailable
                        ? 'bg-[#20C997]/20 text-[#20C997] border border-[#20C997]/50'
                        : 'bg-[#1C1F24] text-[#A5A9B0] border border-[#30343B]'
                    }`}
                  >
                    {(emp.name || emp.fullName || 'G').charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <div className="font-bold text-white truncate text-[11px]">
                      {emp.name || emp.fullName}
                    </div>
                    <div className="text-[10px] font-mono text-[#A5A9B0] truncate">
                      {emp.badgeNumber || emp.employeeNumber}
                    </div>
                    <div
                      className={`text-[10px] font-mono mt-0.5 flex items-center gap-1 ${
                        isAvailable ? 'text-[#20C997]' : 'text-red-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isAvailable ? 'bg-[#20C997]' : 'bg-red-400'
                        }`}
                      />
                      {isAvailable ? 'Available' : 'Deployed'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT LIST: INBOUND REQUESTS VS ACTIVE CONTRACTS ── */}
      <div className="bg-[#15171B] border border-[#30343B] rounded-xl overflow-hidden">
        {/* Header with Title & Search */}
        <div className="px-5 py-4 border-b border-[#30343B] flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            {activeTab === 'requests' ? (
              <>
                <Clock className="w-4 h-4 text-[#FF8A35]" />
                <h3 className="text-xs font-mono font-bold uppercase text-white">
                  Inbound Requests Awaiting Deployment ({filteredList.length})
                </h3>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#20C997]" />
                <h3 className="text-xs font-mono font-bold uppercase text-white">
                  Active Commercial Contracts ({filteredList.length})
                </h3>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#A5A9B0] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={activeTab === 'requests' ? 'Search requests...' : 'Search active contracts...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-[#1C1F24] border border-[#30343B] rounded-lg text-white placeholder-[#A5A9B0]/60 focus:outline-none focus:border-[#20C997]"
              />
            </div>

            {/* Status Filter for Requests */}
            {activeTab === 'requests' && (
              <div className="relative">
                <Filter className="w-3.5 h-3.5 text-[#A5A9B0] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-7 pr-3 py-2 text-xs bg-[#1C1F24] border border-[#30343B] text-white rounded-lg focus:outline-none focus:border-[#20C997] appearance-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New Inbound</option>
                  <option value="under_review">Under Review</option>
                  <option value="site_assessment_scheduled">Site Survey</option>
                  <option value="quotation_sent">Quotation Sent</option>
                  <option value="accepted">Accepted</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* List Content */}
        <div className="divide-y divide-[#30343B]">
          {filteredList.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#A5A9B0] font-mono space-y-2">
              <Shield className="w-8 h-8 text-[#30343B] mx-auto" />
              {activeTab === 'requests' ? (
                <div>
                  <p className="text-white font-medium">No pending inbound requests.</p>
                  <p className="text-[11px] text-[#A5A9B0] mt-1">All requests have been deployed to Active Contracts.</p>
                </div>
              ) : (
                <div>
                  <p className="text-white font-medium">No active contracts yet.</p>
                  <p className="text-[11px] text-[#A5A9B0] mt-1">Assign guards to an inbound request to deploy it into an Active Contract.</p>
                </div>
              )}
            </div>
          ) : (
            filteredList.map((req) => {
              const statusConf = STATUS_CONFIG[req.status] || STATUS_CONFIG['new'];
              const assignedCount = req.assignedGuardIds?.length || 0;
              const isContract = req.status === 'contract_active';

              return (
                <div
                  key={req.id}
                  className={`px-5 py-4 transition-colors ${
                    isContract ? 'hover:bg-[#12231E]/40 bg-[#0E1714]/20' : 'hover:bg-[#1C1F24]/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Request / Contract Info */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Service Icon */}
                      <div className="w-10 h-10 rounded-xl bg-[#1C1F24] border border-[#30343B] flex items-center justify-center text-base shrink-0">
                        {SERVICE_ICONS[req.serviceType] || '🛡️'}
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* Reference + Status Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-sm text-white">
                            {req.referenceNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${statusConf.bg} ${statusConf.text} border ${statusConf.border}`}
                          >
                            {isContract ? 'ACTIVE CONTRACT' : statusConf.label}
                          </span>
                          {req.urgency && !isContract && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#FF8A35]/10 text-[#FF8A35] border border-[#FF8A35]/30">
                              {req.urgency}
                            </span>
                          )}
                          {isContract && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#20C997]/15 text-[#20C997] border border-[#20C997]/30">
                              DEPLOYED
                            </span>
                          )}
                        </div>

                        {/* Client & Deployment Location */}
                        <div className="text-sm font-semibold text-white truncate">
                          {req.clientName}
                        </div>
                        <div className="text-xs text-[#A5A9B0] font-mono mt-0.5 truncate">
                          {req.serviceType.replace(/_/g, ' ')} ·{' '}
                          <span className="text-white/70">{req.siteAddress}, {req.city}</span>
                        </div>

                        {/* Guard Slots & Deployed Officers */}
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          {/* Guard Slot Indicators */}
                          <div className="flex items-center gap-1.5">
                            {Array.from({ length: req.requiredGuards || 1 }).map((_, idx) => {
                              const assigned = req.assignedGuards?.[idx];
                              const assignedName = typeof assigned === 'string'
                                ? assigned
                                : ((assigned as any)?.name || (assigned as any)?.fullName || '');
                              const initial = assignedName ? assignedName.charAt(0).toUpperCase() : `${idx + 1}`;

                              return (
                                <div
                                  key={idx}
                                  title={assignedName || 'Unassigned post'}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono border ${
                                    assignedName
                                      ? 'bg-[#20C997] text-[#090A0D] border-[#20C997]'
                                      : 'bg-[#1C1F24] text-[#A5A9B0] border-dashed border-[#30343B]'
                                  }`}
                                >
                                  {initial}
                                </div>
                              );
                            })}
                            <span className="text-[11px] font-mono text-[#A5A9B0]">
                              {assignedCount}/{req.requiredGuards || 1} guards {isContract ? 'deployed' : 'allocated'}
                            </span>
                          </div>

                          {/* Deployed Officer Name Chips */}
                          {req.assignedGuards && req.assignedGuards.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {req.assignedGuards.map((g, gIdx) => {
                                const gName = typeof g === 'string'
                                  ? g
                                  : ((g as any)?.name || (g as any)?.fullName || `Guard ${gIdx + 1}`);
                                const gId = typeof g === 'string' ? `g-${gIdx}` : ((g as any)?.id || `g-${gIdx}`);
                                return (
                                  <span
                                    key={gId}
                                    className="px-1.5 py-0.5 bg-[#20C997]/15 text-[#20C997] border border-[#20C997]/30 rounded text-[10px] font-mono"
                                  >
                                    {gName}
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          {req.quotationAmountKES ? (
                            <span className="text-[11px] font-mono text-[#C9A04A]">
                              KES {req.quotationAmountKES.toLocaleString()}/mo
                            </span>
                          ) : null}

                          <span className="text-[10px] text-[#A5A9B0] font-mono">
                            {formatEATDate(req.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Assign / Reallocate Guards Button */}
                      {!isContract ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssignmentModal(req);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-[#20C997] hover:bg-[#20C997]/90 text-[#090A0D] shadow-md shadow-[#20C997]/20 transition"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Assign &amp; Deploy</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssignmentModal(req);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-[#1C1F24] hover:bg-[#20C997] hover:text-[#090A0D] text-white border border-[#30343B] transition"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Reallocate Guards</span>
                        </button>
                      )}

                      {/* View Record Button */}
                      <button
                        type="button"
                        onClick={() => onSelectRequest(req.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono bg-[#1C1F24] hover:bg-[#252930] text-white border border-[#30343B] transition"
                      >
                        <span>{isContract ? 'View Contract' : 'View Details'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── ASSIGNMENT MODAL ── */}
      <RequestAssignmentModal
        request={assignmentModal}
        isOpen={!!assignmentModal}
        onClose={() => setAssignmentModal(null)}
        onAssignmentComplete={() => {
          setAssignmentModal(null);
          reload();
        }}
      />
    </div>
  );
};
