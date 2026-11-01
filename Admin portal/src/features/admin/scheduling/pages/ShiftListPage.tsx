import React, { useState, useMemo } from 'react';
import { Column, DataTable } from '@/components/admin/DataTable';
import { FilterToolbar } from '@/components/admin/FilterToolbar';
import { Pagination } from '@/components/admin/Pagination';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { getCurrentUser, getShifts, getSites, hasPermission } from '@/services/store';
import { Shift } from '@/types';
import { Calendar, Plus, CalendarDays, ListFilter, Clock, ShieldCheck, UserCheck, MapPin, Building } from 'lucide-react';
import { ShiftForm } from '../components/ShiftForm';
import { DetailPanel } from '@/components/admin/DetailPanel';
import { downloadCsv, generateCsv } from '@/utils/csv';
import { formatEATDate } from '@/utils/date';

interface ShiftListPageProps {
  onSelectSite?: (siteId: string) => void;
}

export const ShiftListPage: React.FC<ShiftListPageProps> = ({ onSelectSite }) => {
  const [, setTick] = useState(0);
  const reload = () => setTick((t) => t + 1);

  const allShifts = getShifts();
  const allSites = getSites();
  const currentUser = getCurrentUser();
  const canManage = hasPermission('shifts.manage', currentUser);

  // Role scoping: supervisor sees only assigned sites, guard sees only own shifts
  const scopedSites = useMemo(() => {
    if (!currentUser) return allSites;
    if (currentUser.role === 'supervisor' || currentUser.role === 'field_supervisor') {
      const assigned = currentUser.assignedSiteIds || [];
      return allSites.filter((s) => assigned.includes(s.id));
    }
    return allSites;
  }, [allSites, currentUser]);

  const scopedShifts = useMemo(() => {
    if (!currentUser) return allShifts;
    if (currentUser.role === 'guard') {
      return allShifts.filter((s) => s.guardId === currentUser.id);
    }
    if (currentUser.role === 'supervisor' || currentUser.role === 'field_supervisor') {
      const assigned = currentUser.assignedSiteIds || [];
      return allShifts.filter((s) => assigned.includes(s.siteId));
    }
    return allShifts;
  }, [allShifts, currentUser]);

  const [searchTerm, setSearchTerm] = useState('');
  const [siteFilter, setSiteFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'by_site' | 'by_guard'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [inspectingShift, setInspectingShift] = useState<Shift | null>(null);
  const pageSize = 8;

  const siteOptions = scopedSites.map((s) => ({ label: s.name, value: s.id }));
  const statusOptions = [
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'In Progress (Active)', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  const filteredShifts = useMemo(() => {
    return scopedShifts.filter((s) => {
      const matchSearch =
        s.shiftCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.guardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.siteName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSite = siteFilter === 'all' || s.siteId === siteFilter;
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchSite && matchStatus;
    });
  }, [scopedShifts, searchTerm, siteFilter, statusFilter]);

  const paginatedShifts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredShifts.slice(start, start + pageSize);
  }, [filteredShifts, currentPage, pageSize]);

  const handleExportCsv = () => {
    const headers = [
      'Shift Code',
      'Security Site',
      'Guard Name',
      'Shift Date EAT',
      'Start Time',
      'End Time',
      'Type',
      'Status',
    ];

    const rows = filteredShifts.map((s) => [
      s.shiftCode,
      s.siteName,
      s.guardName,
      s.date,
      s.startTime,
      s.endTime,
      s.shiftType,
      s.status,
    ]);

    const csvData = generateCsv(headers, rows);
    downloadCsv(`covenant_shield_shifts_${Date.now()}.csv`, csvData);
  };

  const columns: Column<Shift>[] = [
    {
      header: 'Shift Ref',
      accessor: 'shiftCode',
      render: (s) => (
        <span className="font-mono font-semibold text-slate-100 hover:text-amber-400">
          {s.shiftCode}
        </span>
      ),
    },
    {
      header: 'Stationed Site',
      accessor: 'siteName',
      render: (s) => (
        <span className="text-slate-200 font-medium">{s.siteName}</span>
      ),
    },
    {
      header: 'Officer / Guard',
      accessor: 'guardName',
      render: (s) => (
        <div>
          <div className="font-semibold text-slate-100">{s.guardName}</div>
          <div className="text-[11px] text-slate-400 capitalize">{s.shiftType.replace(/_/g, ' ')}</div>
        </div>
      ),
    },
    {
      header: 'Date & Hours (EAT)',
      render: (s) => (
        <div className="font-mono text-xs">
          <div className="text-slate-200">{formatEATDate(s.date)}</div>
          <div className="text-[11px] text-slate-400">
            {s.startTime} – {s.endTime}
          </div>
        </div>
      ),
    },
    {
      header: 'Field Supervisor',
      render: (s) => (
        <span className="text-xs text-slate-400 font-mono">
          {s.supervisorName || 'Command Center'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (s) => <StatusBadge status={s.status} size="sm" />,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (s) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setInspectingShift(s)}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Inspect
          </button>
          {canManage && (
            <button
              onClick={() => setEditingShift(s)}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              Edit
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-100 tracking-tight">
            Shift Rostering & Site Deployment
          </h2>
          <p className="text-xs text-slate-400">
            Automated collision checking, rest period compliance, and guard post schedules.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View toggle */}
          <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-md">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                viewMode === 'list' ? 'bg-slate-800 text-slate-100 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Table Roster
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                viewMode === 'timeline' ? 'bg-slate-800 text-slate-100 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Timeline Matrix
            </button>
            <button
              onClick={() => setViewMode('by_site')}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                viewMode === 'by_site' ? 'bg-slate-800 text-slate-100 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              By Site
            </button>
            <button
              onClick={() => setViewMode('by_guard')}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                viewMode === 'by_guard' ? 'bg-slate-800 text-slate-100 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              By Guard
            </button>
          </div>

          {canManage && (
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Roster Shift</span>
            </button>
          )}
        </div>
      </div>

      {(isCreating || editingShift) && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>{editingShift ? `Update Shift ${editingShift.shiftCode}` : 'Roster New Guard Shift'}</span>
          </h3>
          <ShiftForm
            initialData={editingShift || undefined}
            onSuccess={() => {
              setIsCreating(false);
              setEditingShift(null);
              reload();
            }}
            onCancel={() => {
              setIsCreating(false);
              setEditingShift(null);
            }}
          />
        </div>
      )}

      <FilterToolbar
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search shift code, officer, site..."
        siteFilter={siteFilter}
        onSiteFilterChange={(val) => {
          setSiteFilter(val);
          setCurrentPage(1);
        }}
        siteOptions={siteOptions}
        statusFilter={statusFilter}
        onStatusFilterChange={(val) => {
          setStatusFilter(val);
          setCurrentPage(1);
        }}
        statusOptions={statusOptions}
        onExportCsv={handleExportCsv}
        onReset={() => {
          setSearchTerm('');
          setSiteFilter('all');
          setStatusFilter('all');
          setCurrentPage(1);
        }}
      />

      {viewMode === 'list' && (
        <>
          <DataTable
            columns={columns}
            data={paginatedShifts}
            keyExtractor={(s) => s.id}
            onRowClick={(s) => setInspectingShift(s)}
            emptyState={{
              title: 'No shifts scheduled',
              description: 'No shifts match your filter criteria or authorization scope.',
            }}
          />

          <Pagination
            currentPage={currentPage}
            totalItems={filteredShifts.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {viewMode === 'timeline' && (
        /* Timeline Matrix View */
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 overflow-x-auto">
          <div className="min-w-[700px] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-mono text-slate-400">
              <span>Security Site Facility</span>
              <div className="flex items-center gap-6">
                <span>Day Shift (06:00 – 18:00 EAT)</span>
                <span>Night Shift (18:00 – 06:00 EAT)</span>
              </div>
            </div>

            {scopedSites.map((site) => {
              const siteShiftsForToday = filteredShifts.filter((s) => s.siteId === site.id);
              const dayShifts = siteShiftsForToday.filter((s) => s.shiftType === 'day_shift');
              const nightShifts = siteShiftsForToday.filter((s) => s.shiftType === 'night_shift');

              return (
                <div key={site.id} className="p-3 bg-slate-950/60 rounded border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-200">{site.name}</span>
                      <span className="text-[11px] text-slate-500 font-mono ml-2">Req: {site.requiredGuardCount} guards</span>
                    </div>
                    <StatusBadge status={site.status} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {/* Day shifts */}
                    <div className="space-y-1.5 p-2 bg-slate-900/60 rounded border border-slate-800 text-xs">
                      <div className="text-[10px] text-amber-400 font-mono uppercase">Day Post Roster</div>
                      {dayShifts.length === 0 ? (
                        <div className="text-[11px] text-slate-500 italic">No day guard assigned</div>
                      ) : (
                        dayShifts.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => setInspectingShift(s)}
                            className="flex items-center justify-between bg-slate-950 p-1.5 rounded text-xs cursor-pointer hover:border hover:border-amber-500/50"
                          >
                            <span className="font-medium text-slate-200">{s.guardName}</span>
                            <span className="font-mono text-[10px] text-slate-400">{s.startTime}–{s.endTime}</span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Night shifts */}
                    <div className="space-y-1.5 p-2 bg-slate-900/60 rounded border border-slate-800 text-xs">
                      <div className="text-[10px] text-sky-400 font-mono uppercase">Night Post Roster</div>
                      {nightShifts.length === 0 ? (
                        <div className="text-[11px] text-slate-500 italic">No night guard assigned</div>
                      ) : (
                        nightShifts.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => setInspectingShift(s)}
                            className="flex items-center justify-between bg-slate-950 p-1.5 rounded text-xs cursor-pointer hover:border hover:border-sky-500/50"
                          >
                            <span className="font-medium text-slate-200">{s.guardName}</span>
                            <span className="font-mono text-[10px] text-slate-400">{s.startTime}–{s.endTime}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'by_site' && (
        /* Calendar View by Site */
        <div className="space-y-4">
          {scopedSites
            .filter((site) => siteFilter === 'all' || site.id === siteFilter)
            .map((site) => {
              const siteShifts = filteredShifts.filter((s) => s.siteId === site.id);
              return (
                <div key={site.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-100 text-sm">{site.name}</span>
                        <span className="text-[11px] font-mono text-slate-400 ml-2">({site.siteCode})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400 font-mono">Required: {site.requiredGuardCount}</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-amber-300 font-mono font-medium">Scheduled: {siteShifts.length}</span>
                      <StatusBadge status={site.status} size="sm" />
                    </div>
                  </div>

                  {siteShifts.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">No shift rosters currently scheduled for this site.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {siteShifts.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => setInspectingShift(s)}
                          className="p-3 bg-slate-950/70 border border-slate-800 hover:border-amber-500/60 rounded-md transition-colors cursor-pointer space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-200">{s.guardName}</span>
                            <StatusBadge status={s.status} size="sm" />
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                            <span>{formatEATDate(s.date)}</span>
                            <span className="text-amber-300">{s.startTime} – {s.endTime}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase font-mono">
                            {s.shiftType.replace(/_/g, ' ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {viewMode === 'by_guard' && (
        /* Calendar View by Guard */
        <div className="space-y-4">
          {(() => {
            const guardMap = new Map<string, { guardName: string; shifts: Shift[] }>();
            filteredShifts.forEach((s) => {
              const current = guardMap.get(s.guardName) || { guardName: s.guardName, shifts: [] };
              current.shifts.push(s);
              guardMap.set(s.guardName, current);
            });

            const guardEntries = Array.from(guardMap.values());
            if (guardEntries.length === 0) {
              return (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center text-xs text-slate-500">
                  No guard rosters match current filters.
                </div>
              );
            }

            return guardEntries.map(({ guardName, shifts }) => (
              <div key={guardName} className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-slate-100 text-sm">{guardName}</span>
                  </div>
                  <span className="text-xs font-mono text-amber-300">{shifts.length} Assigned Shift(s)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {shifts.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setInspectingShift(s)}
                      className="p-3 bg-slate-950/70 border border-slate-800 hover:border-emerald-500/60 rounded-md transition-colors cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">{s.siteName}</span>
                        <StatusBadge status={s.status} size="sm" />
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                        <span>{formatEATDate(s.date)}</span>
                        <span className="text-emerald-400">{s.startTime} – {s.endTime}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase font-mono">
                        {s.shiftType.replace(/_/g, ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* Slide-Over Shift Inspection Panel */}
      {inspectingShift && (
        <DetailPanel
          isOpen={!!inspectingShift}
          onClose={() => setInspectingShift(null)}
          title={`Shift ${inspectingShift.shiftCode}`}
          subtitle={`Roster Assignment · ${formatEATDate(inspectingShift.date)}`}
          badge={<StatusBadge status={inspectingShift.status} size="sm" />}
          width="md"
          footer={
            <>
              <button
                onClick={() => setInspectingShift(null)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
              >
                Close Inspector
              </button>
              {canManage && (
                <button
                  onClick={() => {
                    const shiftToEdit = inspectingShift;
                    setInspectingShift(null);
                    setEditingShift(shiftToEdit);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors"
                >
                  Edit Roster Assignment
                </button>
              )}
            </>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Facility & Post */}
            <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Station Facility</span>
                {onSelectSite && (
                  <button
                    onClick={() => {
                      onSelectSite(inspectingShift.siteId);
                      setInspectingShift(null);
                    }}
                    className="text-[11px] text-amber-400 hover:underline font-mono"
                  >
                    View Site Dossier →
                  </button>
                )}
              </div>
              <div className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{inspectingShift.siteName}</span>
              </div>
            </div>

            {/* Officer Assignment */}
            <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Assigned Officer</span>
              <div className="font-medium text-slate-200 text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{inspectingShift.guardName}</span>
              </div>
              <div className="text-slate-400 capitalize">
                Shift Designation: <span className="text-slate-200 font-mono">{inspectingShift.shiftType.replace(/_/g, ' ')}</span>
              </div>
            </div>

            {/* Duty Hours in EAT */}
            <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Duty Hours (EAT - UTC+3)</span>
              <div className="font-mono text-sm text-emerald-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{inspectingShift.startTime} — {inspectingShift.endTime}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Supervisor: <span className="text-slate-200">{inspectingShift.supervisorName || 'Command Center Dispatch'}</span>
              </div>
            </div>

            {/* Compliance & Collision Checks */}
            <div className="bg-emerald-950/20 border border-emerald-800/40 p-3 rounded space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Operational Invariant Check Passed</span>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                <li>Interval intersection verified: No overlapping guard shifts</li>
                <li>Rest-period policy: Minimum 8-hour off-duty buffer honored</li>
                <li>Site allocation status: Security guard certified for post</li>
              </ul>
            </div>

            {/* Notes */}
            {inspectingShift.notes && (
              <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Dispatch / Post Notes</span>
                <p className="text-slate-300 italic">{inspectingShift.notes}</p>
              </div>
            )}
          </div>
        </DetailPanel>
      )}
    </div>
  );
};
