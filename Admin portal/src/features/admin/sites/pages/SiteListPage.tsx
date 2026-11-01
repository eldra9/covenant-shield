import React, { useState, useMemo } from 'react';
import { Column, DataTable } from '@/components/admin/DataTable';
import { FilterToolbar } from '@/components/admin/FilterToolbar';
import { Pagination } from '@/components/admin/Pagination';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { getCurrentUser, getEmployees, getSites, hasPermission } from '@/services/store';
import { Site } from '@/types';
import { Plus, MapPin, QrCode } from 'lucide-react';
import { SiteForm } from '../components/SiteForm';
import { downloadCsv, generateCsv } from '@/utils/csv';

interface SiteListPageProps {
  onSelectSite: (siteId: string) => void;
}

export const SiteListPage: React.FC<SiteListPageProps> = ({ onSelectSite }) => {
  const [, setTick] = useState(0);
  const reload = () => setTick((t) => t + 1);

  const allSites = getSites();
  const allEmployees = getEmployees();
  const currentUser = getCurrentUser();
  const canManage = hasPermission('sites.manage', currentUser);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const pageSize = 8;

  const statusOptions = [
    { label: 'Active Guarding', value: 'active' },
    { label: 'Under Assessment', value: 'under_assessment' },
    { label: 'Inactive Posts', value: 'inactive' },
  ];

  const filteredSites = useMemo(() => {
    return allSites.filter((s) => {
      const matchSearch =
        s.siteCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [allSites, searchTerm, statusFilter]);

  const paginatedSites = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSites.slice(start, start + pageSize);
  }, [filteredSites, currentPage, pageSize]);

  const handleExportCsv = () => {
    const headers = [
      'Site Code',
      'Facility Name',
      'Client Name',
      'Address',
      'City',
      'Required Guards',
      'Status',
    ];

    const rows = filteredSites.map((s) => [
      s.siteCode,
      s.name,
      s.clientName,
      s.address,
      s.city,
      s.requiredGuardCount,
      s.status,
    ]);

    const csvData = generateCsv(headers, rows);
    downloadCsv(`covenant_shield_sites_${Date.now()}.csv`, csvData);
  };

  const columns: Column<Site>[] = [
    {
      header: 'Site Code',
      accessor: 'siteCode',
      render: (s) => (
        <span className="font-mono font-semibold text-slate-100 hover:text-amber-400">
          {s.siteCode}
        </span>
      ),
    },
    {
      header: 'Security Facility / Installation',
      accessor: 'name',
      render: (s) => (
        <div>
          <div className="font-semibold text-slate-100">{s.name}</div>
          <div className="text-[11px] text-slate-400 font-mono">{s.address}, {s.city}</div>
        </div>
      ),
    },
    {
      header: 'Contracted Client',
      accessor: 'clientName',
      render: (s) => (
        <span className="text-slate-200 font-medium">{s.clientName}</span>
      ),
    },
    {
      header: 'Supervisory Command',
      render: (s) => {
        const assigned = allEmployees.filter((e) => s.assignedSupervisorIds.includes(e.id));
        if (assigned.length === 0) return <span className="text-slate-500 font-mono text-xs">Unassigned</span>;
        return (
          <span className="text-xs text-amber-300 font-mono">
            {assigned.map((a) => a.name).join(', ')}
          </span>
        );
      },
    },
    {
      header: 'Manning',
      accessor: 'requiredGuardCount',
      render: (s) => (
        <span className="text-xs font-mono text-slate-300">
          {s.requiredGuardCount} Officer(s)
        </span>
      ),
    },
    {
      header: 'Operational Status',
      render: (s) => <StatusBadge status={s.status} size="sm" />,
    },
    {
      header: 'Geofence',
      render: (s) => (
        <span className="text-xs font-mono text-slate-400">
          {(s as any).geofenceRadius ? `${(s as any).geofenceRadius}m` : '—'}
        </span>
      ),
    },
    {
      header: 'QR / Check-in',
      render: (s) => (
        <div
          title={`Scan QR to check in at ${s.siteCode}`}
          className="inline-flex items-center gap-1 text-xs text-amber-400 font-mono"
        >
          <QrCode className="w-3.5 h-3.5 shrink-0" />
          <span>{s.siteCode}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-100 tracking-tight">
            Security Site Facilities
          </h2>
          <p className="text-xs text-slate-400">
            Enrolled client perimeters, gate access protocols, and supervisory boundaries.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Register Facility Site</span>
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Register New Client Installation</span>
          </h3>
          <SiteForm
            onSuccess={(newSite) => {
              setIsCreating(false);
              reload();
              onSelectSite(newSite.id);
            }}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}

      <FilterToolbar
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search site code, facility name, address, client..."
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
          setCurrentPage(1);
        }}
      />

      <DataTable
        columns={columns}
        data={paginatedSites}
        keyExtractor={(s) => s.id}
        onRowClick={(s) => onSelectSite(s.id)}
        emptyState={{
          title: 'No sites found',
          description: 'No security sites matched your search or authorization scope.',
        }}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={filteredSites.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
