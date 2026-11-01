import React, { useState, useMemo } from 'react';
import { Column, DataTable } from '@/components/admin/DataTable';
import { FilterToolbar } from '@/components/admin/FilterToolbar';
import { Pagination } from '@/components/admin/Pagination';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { getClients, getCurrentUser, hasPermission } from '@/services/store';
import { Client } from '@/types';
import { Plus, Building2 } from 'lucide-react';
import { ClientForm } from '../components/ClientForm';
import { downloadCsv, generateCsv } from '@/utils/csv';
import { formatEATDate } from '@/utils/date';

interface ClientListPageProps {
  onSelectClient: (clientId: string) => void;
}

export const ClientListPage: React.FC<ClientListPageProps> = ({ onSelectClient }) => {
  const [, setTick] = useState(0);
  const reload = () => setTick((t) => t + 1);

  const allClients = getClients();
  const currentUser = getCurrentUser();
  const canCreate = hasPermission('clients.create', currentUser);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const pageSize = 8;

  const statusOptions = [
    { label: 'Active Clients', value: 'active' },
    { label: 'Pending Onboarding', value: 'pending' },
    { label: 'Suspended Accounts', value: 'suspended' },
  ];

  const filteredClients = useMemo(() => {
    return allClients.filter((c) => {
      const matchSearch =
        c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [allClients, searchTerm, statusFilter]);

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredClients.slice(start, start + pageSize);
  }, [filteredClients, currentPage, pageSize]);

  const handleExportCsv = () => {
    const headers = [
      'Account Reference',
      'Company Name',
      'Primary Contact',
      'Email',
      'Phone',
      'Industry',
      'City',
      'Contracts Count',
      'Status',
      'Created Date EAT',
    ];

    const rows = filteredClients.map((c) => [
      c.accountReference,
      c.companyName,
      c.contactPerson,
      c.email,
      c.phone,
      c.industry,
      c.city,
      c.activeContractsCount,
      c.status,
      formatEATDate(c.createdAt),
    ]);

    const csvData = generateCsv(headers, rows);
    downloadCsv(`covenant_shield_clients_${Date.now()}.csv`, csvData);
  };

  const columns: Column<Client>[] = [
    {
      header: 'Account Ref',
      accessor: 'accountReference',
      render: (c) => (
        <span className="font-mono font-semibold text-slate-100 hover:text-amber-400">
          {c.accountReference}
        </span>
      ),
    },
    {
      header: 'Company / Commercial Entity',
      accessor: 'companyName',
      render: (c) => (
        <div>
          <div className="font-semibold text-slate-100">{c.companyName}</div>
          <div className="text-[11px] text-slate-400">{c.industry}</div>
        </div>
      ),
    },
    {
      header: 'Contact Person',
      accessor: 'contactPerson',
      render: (c) => (
        <div>
          <div className="text-slate-200">{c.contactPerson}</div>
          <div className="text-[11px] text-slate-500 font-mono">{c.email}</div>
        </div>
      ),
    },
    {
      header: 'Location',
      render: (c) => (
        <span className="text-xs text-slate-300 font-mono">
          {c.city}
        </span>
      ),
    },
    {
      header: 'Active Posts',
      accessor: 'activeContractsCount',
      render: (c) => (
        <span className="text-xs font-mono tabular-nums text-slate-200">
          {c.activeContractsCount} Site(s)
        </span>
      ),
    },
    {
      header: 'Status',
      render: (c) => <StatusBadge status={c.status} size="sm" />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-100 tracking-tight">
            Client Account Directory
          </h2>
          <p className="text-xs text-slate-400">
            Corporate accounts, commercial contracts, and authorized points of contact.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll New Client</span>
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Enroll New Client Account</span>
          </h3>
          <ClientForm
            onSuccess={(newCli) => {
              setIsCreating(false);
              reload();
              onSelectClient(newCli.id);
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
        searchPlaceholder="Search company, contact person, email, city..."
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
        data={paginatedClients}
        keyExtractor={(c) => c.id}
        onRowClick={(c) => onSelectClient(c.id)}
        emptyState={{
          title: 'No client accounts found',
          description: 'No active client accounts matched your filter criteria.',
        }}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={filteredClients.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
