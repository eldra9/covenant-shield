import React, { useState, useMemo } from 'react';
import { Column, DataTable } from '@/components/admin/DataTable';
import { FilterToolbar } from '@/components/admin/FilterToolbar';
import { Pagination } from '@/components/admin/Pagination';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { getAttendanceRecords, getCurrentUser, getSites, hasPermission } from '@/services/store';
import { AttendanceRecord } from '@/types';
import { AlertCircle, ClockAlert, CheckCircle, ShieldAlert, ArrowRight, UserCheck, MapPin, Activity, List, ClipboardList } from 'lucide-react';
import { DetailPanel } from '@/components/admin/DetailPanel';
import { downloadCsv, generateCsv } from '@/utils/csv';
import { formatEAT, formatEATDate, formatEATTime } from '@/utils/date';

interface AttendanceListPageProps {
  onSelectAttendance: (id: string) => void;
}

export const AttendanceListPage: React.FC<AttendanceListPageProps> = ({
  onSelectAttendance,
}) => {
  const currentUser = getCurrentUser();
  const allRecords = getAttendanceRecords();
  const sites = getSites();

  // Role-based record scoping
  const scopedRecords = useMemo(() => {
    if (!currentUser) return allRecords;
    if (currentUser.role === 'guard') {
      // Guards see only their own records
      return allRecords.filter((a) => a.guardId === currentUser.id);
    }
    if (currentUser.role === 'supervisor' || currentUser.role === 'field_supervisor') {
      // Supervisors see only records for their assigned sites
      const assignedSites = currentUser.assignedSiteIds || [];
      return allRecords.filter((a) => assignedSites.includes(a.siteId));
    }
    return allRecords;
  }, [allRecords, currentUser]);

  const [activeTab, setActiveTab] = useState<'log' | 'live' | 'pending'>('live');
  const [searchTerm, setSearchTerm] = useState('');
  const [siteFilter, setSiteFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [exceptionsOnly, setExceptionsOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [inspectingRecord, setInspectingRecord] = useState<AttendanceRecord | null>(null);
  const pageSize = 8;

  const siteOptions = sites.map((s) => ({ label: s.name, value: s.id }));
  const statusOptions = [
    { label: 'On Time', value: 'on_time' },
    { label: 'Late Arrival', value: 'late' },
    { label: 'Unconfirmed Absence', value: 'absent' },
    { label: 'Incomplete', value: 'incomplete' },
    { label: 'Corrected (Audited)', value: 'corrected' },
  ];

  // Manual entries awaiting review
  const pendingManualEntries = useMemo(
    () => scopedRecords.filter((a) => (a as any).isManualEntry && !(a as any).isReviewed),
    [scopedRecords],
  );

  const filteredRecords = useMemo(() => {
    return scopedRecords.filter((a) => {
      const matchSearch =
        a.guardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.date.includes(searchTerm);

      const matchSite = siteFilter === 'all' || a.siteId === siteFilter;
      const matchStatus = statusFilter === 'all' || a.currentStatus === statusFilter;
      const matchException = !exceptionsOnly || a.isException;

      return matchSearch && matchSite && matchStatus && matchException;
    });
  }, [allRecords, searchTerm, siteFilter, statusFilter, exceptionsOnly]);

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const handleExportCsv = () => {
    const headers = [
      'Date EAT',
      'Officer Name',
      'Security Site',
      'Scheduled Start EAT',
      'Scheduled End EAT',
      'Actual Check-In EAT',
      'Original Status',
      'Current Status',
      'Is Exception',
      'Exception Notes',
    ];

    const rows = filteredRecords.map((a) => [
      formatEATDate(a.date),
      a.guardName,
      a.siteName,
      formatEATTime(a.scheduledStart),
      formatEATTime(a.scheduledEnd),
      a.actualCheckIn ? formatEATTime(a.actualCheckIn) : 'No Signal',
      a.originalStatus,
      a.currentStatus,
      a.isException ? 'YES' : 'NO',
      a.exceptionNotes || '',
    ]);

    const csvData = generateCsv(headers, rows);
    downloadCsv(`covenant_shield_attendance_${Date.now()}.csv`, csvData);
  };

  const columns: Column<AttendanceRecord>[] = [
    {
      header: 'Shift Date (EAT)',
      render: (a) => (
        <span className="font-mono text-xs text-slate-200">
          {formatEATDate(a.date)}
        </span>
      ),
    },
    {
      header: 'Guard / Specialist',
      accessor: 'guardName',
      render: (a) => (
        <div>
          <div className="font-semibold text-slate-100 hover:text-amber-400">
            {a.guardName}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">ID: {a.id}</div>
        </div>
      ),
    },
    {
      header: 'Security Facility',
      accessor: 'siteName',
      render: (a) => (
        <span className="text-slate-200 text-xs font-medium">{a.siteName}</span>
      ),
    },
    {
      header: 'Rostered Window',
      render: (a) => (
        <span className="text-xs text-slate-400 font-mono">
          {formatEATTime(a.scheduledStart)} – {formatEATTime(a.scheduledEnd)}
        </span>
      ),
    },
    {
      header: 'Biometric Check-In',
      render: (a) => (
        <span
          className={`text-xs font-mono font-medium ${
            a.actualCheckIn ? 'text-slate-200' : 'text-rose-400'
          }`}
        >
          {a.actualCheckIn ? formatEATTime(a.actualCheckIn) : 'Missing Log'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (a) => (
        <div className="flex items-center gap-1.5">
          <StatusBadge status={a.currentStatus} size="sm" />
          {a.isException && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950/60 text-rose-300 font-mono border border-rose-800/40">
              Exception
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (a) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setInspectingRecord(a)}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Inspect
          </button>
          <button
            onClick={() => onSelectAttendance(a.id)}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium"
          >
            Review & Edit
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-100 tracking-tight">
            Attendance Verification &amp; Exception Oversight
          </h2>
          <p className="text-xs text-slate-400">
            Biometric gate telemetry, late arrivals, missing check-ins, and audited corrections.
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            &#x26A0; GPS coordinates are captured only at check-in/out events. Continuous tracking is never performed.
          </p>
        </div>
        <button
          onClick={() => { setExceptionsOnly(!exceptionsOnly); setCurrentPage(1); }}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors self-start sm:self-auto ${exceptionsOnly ? 'bg-rose-950/60 text-rose-300 border-rose-800' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'}`}
        >
          <ClockAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>{exceptionsOnly ? 'Showing Exceptions Only' : 'Filter Exceptions Only'}</span>
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 w-fit">
        {([
          { id: 'live' as const,    label: 'Live Board',  Icon: Activity },
          { id: 'log'  as const,    label: 'Daily Log',   Icon: List },
          { id: 'pending' as const, label: pendingManualEntries.length > 0 ? `Pending Review (${pendingManualEntries.length})` : 'Pending Review', Icon: ClipboardList },
        ]).map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} aria-label={label}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === id ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
            <Icon className="w-3.5 h-3.5" /><span>{label}</span>
          </button>
        ))}
      </div>

      {/* Live Board */}
      {activeTab === 'live' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-200">Live Duty Board — Today (EAT)</span>
            <span className="ml-auto text-[11px] text-slate-500 font-mono">Refreshes on page load</span>
          </div>
          <div className="divide-y divide-slate-800/50">
            {(siteFilter === 'all' ? sites : sites.filter((s) => s.id === siteFilter)).map((site) => {
              const siteRecs = scopedRecords.filter((r) => r.siteId === site.id);
              const onDuty = siteRecs.filter((r) => r.currentStatus === 'on_time' || r.currentStatus === 'late');
              const absent = siteRecs.filter((r) => r.currentStatus === 'absent');
              const color = absent.length > 0 ? 'text-rose-400' : onDuty.length >= site.requiredGuardCount ? 'text-emerald-400' : 'text-amber-400';
              return (
                <div key={site.id} className="px-4 py-3 flex items-start gap-4">
                  <div className="w-32 shrink-0">
                    <div className="text-xs font-semibold text-slate-200 truncate">{site.name}</div>
                    <div className="text-[11px] font-mono text-slate-500">{site.siteCode}</div>
                  </div>
                  <div className={`text-xs font-semibold font-mono ${color} w-24 shrink-0 pt-0.5`}>{onDuty.length}/{site.requiredGuardCount} on duty</div>
                  <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                    {siteRecs.length === 0 ? <span className="text-[11px] text-slate-500">No shifts today</span> : siteRecs.map((r) => (
                      <span key={r.id} className={`text-[11px] font-mono px-2 py-0.5 rounded border ${r.currentStatus === 'on_time' ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40' : r.currentStatus === 'late' ? 'bg-amber-950/50 text-amber-300 border-amber-800/40' : 'bg-rose-950/50 text-rose-300 border-rose-800/40'}`}>
                        {r.guardName.split(' ')[0]} · {r.currentStatus.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                  {absent.length > 0 && <span className="text-[11px] font-semibold text-rose-400 shrink-0 pt-0.5">&#x26A0; {absent.length} absent</span>}
                </div>
              );
            })}
            {sites.length === 0 && <div className="px-4 py-8 text-center text-xs text-slate-500">No sites in your operational scope.</div>}
          </div>
        </div>
      )}

      {/* Pending Manual Review */}
      {activeTab === 'pending' && (
        <div className="space-y-3">
          {pendingManualEntries.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-200">No Entries Awaiting Review</p>
              <p className="text-xs text-slate-500 mt-1">All manual attendance corrections have been reviewed.</p>
            </div>
          ) : pendingManualEntries.map((r) => (
            <div key={r.id} onClick={() => onSelectAttendance(r.id)}
              className="bg-slate-900 border border-amber-800/40 rounded-lg p-4 cursor-pointer hover:border-amber-600/60 transition-colors flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-slate-100">{r.guardName} — {r.siteName}</div>
                <div className="text-[11px] text-slate-400 font-mono">{formatEATDate(r.date)} · {formatEATTime(r.scheduledStart)} – {formatEATTime(r.scheduledEnd)}</div>
                {r.exceptionNotes && <div className="text-[11px] text-amber-300 italic">{r.exceptionNotes}</div>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-950/60 text-amber-300 border border-amber-800/40 rounded font-mono font-semibold">Manual Entry</span>
                <StatusBadge status={r.currentStatus} size="sm" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Daily Log */}
      {activeTab === 'log' && (
        <>
          <FilterToolbar
            searchTerm={searchTerm}
            onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
            searchPlaceholder="Search officer name, site, date..."
            siteFilter={siteFilter}
            onSiteFilterChange={(val) => { setSiteFilter(val); setCurrentPage(1); }}
            siteOptions={siteOptions}
            statusFilter={statusFilter}
            onStatusFilterChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
            statusOptions={statusOptions}
            onExportCsv={handleExportCsv}
            onReset={() => { setSearchTerm(''); setSiteFilter('all'); setStatusFilter('all'); setExceptionsOnly(false); setCurrentPage(1); }}
          />
          <DataTable columns={columns} data={paginatedRecords} keyExtractor={(a) => a.id} onRowClick={(a) => setInspectingRecord(a)}
            emptyState={{ title: 'No attendance records match', description: 'No biometric post events match your criteria.' }} />
          <Pagination currentPage={currentPage} totalItems={filteredRecords.length} pageSize={pageSize} onPageChange={setCurrentPage} />
        </>
      )}

      {/* Detail Panel */}
      {inspectingRecord && (
        <DetailPanel isOpen={!!inspectingRecord} onClose={() => setInspectingRecord(null)}
          title={`Attendance: ${inspectingRecord.guardName}`}
          subtitle={`Log ${inspectingRecord.id} · ${formatEATDate(inspectingRecord.date)}`}
          badge={<StatusBadge status={inspectingRecord.currentStatus} size="sm" />} width="md"
          footer={<>
            <button onClick={() => setInspectingRecord(null)} className="px-3 py-1.5 text-xs text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded transition-colors">Close</button>
            <button onClick={() => { const id = inspectingRecord.id; setInspectingRecord(null); onSelectAttendance(id); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors">
              <span>Full Audit &amp; Correction Workflow</span><ArrowRight className="w-3.5 h-3.5" />
            </button>
          </>}>
          <div className="space-y-4 text-xs">
            <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Verification Status</span>
                {inspectingRecord.isException && <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 font-mono border border-rose-800/60 font-semibold">Exception Flagged</span>}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-500 block text-[10px]">Original Status</span><span className="text-slate-200 capitalize font-medium">{inspectingRecord.originalStatus.replace(/_/g, ' ')}</span></div>
                <div><span className="text-slate-500 block text-[10px]">Current Status</span><span className="text-emerald-400 capitalize font-medium">{inspectingRecord.currentStatus.replace(/_/g, ' ')}</span></div>
              </div>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Duty Post</span>
              <div className="font-semibold text-slate-100 flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-400 shrink-0" /><span>{inspectingRecord.siteName}</span></div>
              <div className="text-slate-300 flex items-center gap-2"><UserCheck className="w-4 h-4 text-amber-400 shrink-0" /><span>Officer {inspectingRecord.guardName}</span></div>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Biometric Telemetry (EAT UTC+3)</span>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Rostered:</span><span className="text-slate-200">{formatEATTime(inspectingRecord.scheduledStart)} – {formatEATTime(inspectingRecord.scheduledEnd)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Check-In:</span><span className={inspectingRecord.actualCheckIn ? 'text-emerald-300' : 'text-rose-400 font-bold'}>{inspectingRecord.actualCheckIn ? formatEATTime(inspectingRecord.actualCheckIn) : 'No Signal'}</span></div>
                {inspectingRecord.actualCheckOut && <div className="flex justify-between"><span className="text-slate-400">Check-Out:</span><span className="text-slate-200">{formatEATTime(inspectingRecord.actualCheckOut)}</span></div>}
              </div>
            </div>
            {inspectingRecord.exceptionNotes && (
              <div className="bg-rose-950/20 border border-rose-900/40 p-3 rounded space-y-1">
                <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-xs"><AlertCircle className="w-3.5 h-3.5 shrink-0" /><span>Exception Analysis</span></div>
                <p className="text-slate-300 text-[11px]">{inspectingRecord.exceptionNotes}</p>
              </div>
            )}
          </div>
        </DetailPanel>
      )}
    </div>
  );
};
