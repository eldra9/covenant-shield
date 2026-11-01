import React, { useState, useMemo } from 'react';
import { Column, DataTable } from '@/components/admin/DataTable';
import { FilterToolbar } from '@/components/admin/FilterToolbar';
import { Pagination } from '@/components/admin/Pagination';
import { getAuditLogs } from '@/services/store';
import { AuditLog } from '@/types';
import { History, Shield, Download } from 'lucide-react';
import { formatEAT } from '@/utils/date';
import { downloadCsv, generateCsv } from '@/utils/csv';

export const AuditLogPage: React.FC = () => {
  const allLogs = getAuditLogs();

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const actionOptions = [
    { label: 'Status Changes', value: 'REQUEST_STATUS_CHANGE' },
    { label: 'Attendance Corrections', value: 'ATTENDANCE_CORRECTION' },
    { label: 'Role Changes', value: 'ROLE_CHANGE' },
    { label: 'Shift Scheduling', value: 'SHIFT_CREATE' },
    { label: 'Case Assignments & Closures', value: 'CASE_STATUS_CHANGE' },
    { label: 'Data Exports', value: 'REPORT_EXPORT_CSV' },
  ];

  const filteredLogs = useMemo(() => {
    return allLogs.filter((l) => {
      const matchSearch =
        l.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.action.toLowerCase().includes(searchTerm.toLowerCase());

      const matchAction = actionFilter === 'all' || l.action === actionFilter;
      return matchSearch && matchAction;
    });
  }, [allLogs, searchTerm, actionFilter]);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const handleExportCsv = () => {
    const headers = [
      'Timestamp (EAT)',
      'Actor Name',
      'Actor Role',
      'Action Code',
      'Entity Type',
      'Entity Ref',
      'Summary',
    ];

    const rows = filteredLogs.map((l) => [
      formatEAT(l.timestamp),
      l.actorName,
      l.actorRole,
      l.action,
      l.entityType,
      l.entityId,
      l.summary,
    ]);

    const csvData = generateCsv(headers, rows);
    downloadCsv(`covenant_shield_audit_trail_${Date.now()}.csv`, csvData);
  };

  const columns: Column<AuditLog>[] = [
    {
      header: 'Timestamp (EAT)',
      accessor: 'timestamp',
      render: (l) => (
        <span className="font-mono text-xs text-slate-300 tabular-nums">
          {formatEAT(l.timestamp)}
        </span>
      ),
    },
    {
      header: 'Action Code',
      accessor: 'action',
      render: (l) => (
        <span className="font-mono text-xs font-semibold text-amber-400 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-800/40">
          {l.action}
        </span>
      ),
    },
    {
      header: 'Operational Actor',
      accessor: 'actorName',
      render: (l) => (
        <div>
          <div className="font-semibold text-slate-200">{l.actorName}</div>
          <div className="text-[11px] text-slate-500 font-mono capitalize">
            {l.actorRole.replace('_', ' ')}
          </div>
        </div>
      ),
    },
    {
      header: 'Entity Scope',
      render: (l) => (
        <span className="text-xs text-slate-300 font-mono">
          {l.entityType} ({l.entityId})
        </span>
      ),
    },
    {
      header: 'Audit Event Summary',
      render: (l) => (
        <span className="text-xs text-slate-300 leading-relaxed block max-w-md">
          {l.summary}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-100 tracking-tight">
            Immutable Audit Trail
          </h2>
          <p className="text-xs text-slate-400">
            Cryptographically sealed operational event logging for compliance, role transitions, and corrections.
          </p>
        </div>
      </div>

      <FilterToolbar
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search actor, action, entity ref, or summary..."
        statusFilter={actionFilter}
        onStatusFilterChange={(val) => {
          setActionFilter(val);
          setCurrentPage(1);
        }}
        statusOptions={actionOptions}
        onExportCsv={handleExportCsv}
        onReset={() => {
          setSearchTerm('');
          setActionFilter('all');
          setCurrentPage(1);
        }}
      />

      <DataTable
        columns={columns}
        data={paginatedLogs}
        keyExtractor={(l) => l.id}
        emptyState={{
          title: 'No audit entries match',
          description: 'No events found matching your filter parameters.',
        }}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={filteredLogs.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
