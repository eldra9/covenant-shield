import React, { useState, useMemo } from 'react';
import { Column, DataTable } from '@/components/admin/DataTable';
import { FilterToolbar } from '@/components/admin/FilterToolbar';
import { Pagination } from '@/components/admin/Pagination';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { getCases, getSites } from '@/services/store';
import { Case } from '@/types';
import { ShieldAlert, AlertTriangle, Filter } from 'lucide-react';
import { downloadCsv, generateCsv } from '@/utils/csv';
import { formatEATDate } from '@/utils/date';

interface CaseListPageProps {
  onSelectCase: (caseId: string) => void;
}

export const CaseListPage: React.FC<CaseListPageProps> = ({ onSelectCase }) => {
  const allCases = getCases();
  const sites = getSites();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const siteOptions = sites.map((s) => ({ label: s.name, value: s.id }));
  const statusOptions = [
    { label: 'Submitted', value: 'submitted' },
    { label: 'Assigned', value: 'assigned' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Resolution Proposed', value: 'resolution_proposed' },
    { label: 'Closed', value: 'closed' },
  ];

  const filteredCases = useMemo(() => {
    return allCases.filter((c) => {
      const matchSearch =
        c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.reportedBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchSeverity = severityFilter === 'all' || c.severity === severityFilter;
      const matchSite = siteFilter === 'all' || c.siteId === siteFilter;

      return matchSearch && matchStatus && matchSeverity && matchSite;
    }).sort((a, b) => {
      const da = new Date(a.resolutionDeadline || a.dueDate).getTime();
      const db = new Date(b.resolutionDeadline || b.dueDate).getTime();
      return da - db;
    });
  }, [allCases, searchTerm, statusFilter, severityFilter, siteFilter]);

  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCases.slice(start, start + pageSize);
  }, [filteredCases, currentPage, pageSize]);

  const handleExportCsv = () => {
    const headers = [
      'Case Number',
      'Title',
      'Category',
      'Severity',
      'Facility Site',
      'Client',
      'Reported By',
      'Lead Investigator',
      'Due Date EAT',
      'Status',
    ];

    const rows = filteredCases.map((c) => [
      c.caseNumber,
      c.title,
      c.type,
      c.severity,
      c.siteName,
      c.clientName,
      c.reportedBy,
      c.assignedOwnerName || 'Unassigned',
      formatEATDate(c.dueDate),
      c.status,
    ]);

    const csvData = generateCsv(headers, rows);
    downloadCsv(`covenant_shield_incident_cases_${Date.now()}.csv`, csvData);
  };

  const columns: Column<Case>[] = [
    {
      header: 'Case Ref',
      accessor: 'caseNumber',
      render: (c) => (
        <span className="font-mono font-semibold text-slate-100 hover:text-amber-400">
          {c.caseNumber}
        </span>
      ),
    },
    {
      header: 'Incident Title & Category',
      accessor: 'title',
      render: (c) => (
        <div>
          <div className="font-semibold text-slate-100">{c.title}</div>
          <div className="text-[11px] text-slate-400 capitalize">{c.type.replace(/_/g, ' ')}</div>
        </div>
      ),
    },
    {
      header: 'Security Facility',
      accessor: 'siteName',
      render: (c) => (
        <span className="text-slate-200 text-xs font-medium">{c.siteName}</span>
      ),
    },
    {
      header: 'Severity',
      accessor: 'severity',
      render: (c) => (
        <span
          className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold ${
            c.severity === 'critical'
              ? 'bg-rose-950 text-rose-300 border border-rose-800'
              : c.severity === 'high'
              ? 'bg-amber-950 text-amber-300 border border-amber-800'
              : 'bg-slate-800 text-slate-300'
          }`}
        >
          {c.severity}
        </span>
      ),
    },
    {
      header: 'Lead Investigator',
      render: (c) => (
        <span className="text-xs text-slate-400 font-mono">
          {c.assignedOwnerName || '—'}
        </span>
      ),
    },
    {
      header: 'Target Resolution (EAT)',
      render: (c) => (
        <span className="text-xs text-slate-400 font-mono">
          {formatEATDate(c.dueDate)}
        </span>
      ),
    },
    {
      header: 'Workflow Status',
      render: (c) => <StatusBadge status={c.status} size="sm" />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-100 tracking-tight">
            Incident Cases & Client Complaints
          </h2>
          <p className="text-xs text-slate-400">
            Perimeter breaches, hardware anomalies, tenant complaints, and escalation SLAs.
          </p>
        </div>

        {/* Severity quick toggles */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {['all', 'critical', 'high', 'medium'].map((sev) => (
            <button
              key={sev}
              onClick={() => {
                setSeverityFilter(sev);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 text-xs rounded border capitalize transition-colors ${
                severityFilter === sev
                  ? 'bg-slate-800 text-slate-100 font-semibold border-amber-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {sev === 'all' ? 'All Severities' : `${sev}`}
            </button>
          ))}
        </div>
      </div>

      <FilterToolbar
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search case ref, incident title, facility site, reporter..."
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
          setStatusFilter('all');
          setSeverityFilter('all');
          setSiteFilter('all');
          setCurrentPage(1);
        }}
      />

      <DataTable
        columns={columns}
        data={paginatedCases}
        keyExtractor={(c) => c.id}
        onRowClick={(c) => onSelectCase(c.id)}
        emptyState={{
          title: 'No cases match your filters',
          description: 'No active incident reports or client complaints found.',
        }}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={filteredCases.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
