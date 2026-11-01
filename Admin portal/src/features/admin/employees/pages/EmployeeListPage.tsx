import React, { useState, useMemo } from 'react';
import { Column, DataTable } from '@/components/admin/DataTable';
import { FilterToolbar } from '@/components/admin/FilterToolbar';
import { Pagination } from '@/components/admin/Pagination';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { getCurrentUser, getEmployees, hasPermission, saveEmployee } from '@/services/store';
import { Employee } from '@/types';
import { Plus, Shield, ToggleLeft, ToggleRight } from 'lucide-react';
import { EmployeeForm } from '../components/EmployeeForm';
import { downloadCsv, generateCsv } from '@/utils/csv';

interface EmployeeListPageProps {
  onSelectEmployee: (empId: string) => void;
}

export const EmployeeListPage: React.FC<EmployeeListPageProps> = ({ onSelectEmployee }) => {
  const [, setTick] = useState(0);
  const reload = () => setTick((t) => t + 1);

  const allEmployees = getEmployees();
  const currentUser = getCurrentUser();
  const canManage = hasPermission('employees.manage', currentUser);

  /** Toggle a guard between active and suspended/inactive */
  const handleToggleStatus = (emp: Employee, ev: React.MouseEvent) => {
    ev.stopPropagation();
    const nextStatus = emp.employmentStatus === 'active' ? 'suspended' : 'active';
    saveEmployee({ ...emp, employmentStatus: nextStatus });
    reload();
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const pageSize = 8;

  const roleOptions = [
    { label: 'Armed & Static Guards', value: 'guard' },
    { label: 'Field Supervisors', value: 'supervisor' },
    { label: 'K9 Canine Specialists', value: 'k9_specialist' },
    { label: 'CCTV Control Specialists', value: 'cctv_operator' },
    { label: 'VIP Close Defense Officers', value: 'close_protection' },
  ];

  const filteredEmployees = useMemo(() => {
    return allEmployees.filter((e) => {
      const matchSearch =
        e.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.qualifications.some((q) => q.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchRole = roleFilter === 'all' || e.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [allEmployees, searchTerm, roleFilter]);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  const handleExportCsv = () => {
    const headers = [
      'Employee Number',
      'Officer Name',
      'Role',
      'Phone',
      'Employment Status',
      'Qualifications',
      'Assigned Sites Count',
    ];

    const rows = filteredEmployees.map((e) => [
      e.employeeNumber,
      e.name,
      e.role,
      e.phone,
      e.employmentStatus,
      e.qualifications.join('; '),
      e.assignedSiteIds.length,
    ]);

    const csvData = generateCsv(headers, rows);
    downloadCsv(`covenant_shield_personnel_${Date.now()}.csv`, csvData);
  };

  const columns: Column<Employee>[] = [
    {
      header: 'Officer Ref',
      accessor: 'employeeNumber',
      render: (e) => (
        <span className="font-mono font-semibold text-slate-100 hover:text-amber-400">
          {e.employeeNumber}
        </span>
      ),
    },
    {
      header: 'Name & Contact',
      accessor: 'name',
      render: (e) => (
        <div>
          <div className="font-semibold text-slate-100">{e.name}</div>
          <div className="text-[11px] text-slate-400 font-mono">{e.phone}</div>
        </div>
      ),
    },
    {
      header: 'Operational Role',
      accessor: 'role',
      render: (e) => (
        <span className="text-xs text-slate-200 capitalize">
          {e.role.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      header: 'Vetting & Endorsements',
      render: (e) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {e.qualifications.slice(0, 2).map((q) => (
            <span
              key={q}
              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
            >
              {q}
            </span>
          ))}
          {e.qualifications.length > 2 && (
            <span className="text-[10px] text-slate-500 font-mono">
              +{e.qualifications.length - 2} more
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Assigned Posts',
      render: (e) => (
        <span className="text-xs font-mono text-slate-300">
          {e.assignedSiteIds.length} Site(s)
        </span>
      ),
    },
    {
      header: 'Standing',
      render: (e) => <StatusBadge status={e.employmentStatus} size="sm" />,
    },
    {
      header: 'Active',
      render: (e) =>
        canManage ? (
          <button
            onClick={(ev) => handleToggleStatus(e, ev)}
            title={e.employmentStatus === 'active' ? 'Deactivate officer' : 'Reactivate officer'}
            aria-label={e.employmentStatus === 'active' ? 'Deactivate officer' : 'Reactivate officer'}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded transition-colors ${
              e.employmentStatus === 'active'
                ? 'bg-emerald-950/60 text-emerald-400 hover:bg-rose-950/60 hover:text-rose-400 border border-emerald-800/40 hover:border-rose-800/40'
                : 'bg-rose-950/60 text-rose-400 hover:bg-emerald-950/60 hover:text-emerald-400 border border-rose-800/40 hover:border-emerald-800/40'
            }`}
          >
            {e.employmentStatus === 'active' ? (
              <><ToggleRight className="w-3.5 h-3.5" /><span>On</span></>
            ) : (
              <><ToggleLeft className="w-3.5 h-3.5" /><span>Off</span></>
            )}
          </button>
        ) : (
          <span className={`text-xs font-mono ${e.employmentStatus === 'active' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {e.employmentStatus === 'active' ? 'Active' : 'Inactive'}
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-100 tracking-tight">
            Security Force & Guard Personnel
          </h2>
          <p className="text-xs text-slate-400">
            Vetted security guards, field supervisors, canine handlers, and tactical operators.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Guard / Specialist</span>
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Enroll Security Officer / Specialist</span>
          </h3>
          <EmployeeForm
            onSuccess={(newEmp) => {
              setIsCreating(false);
              reload();
              onSelectEmployee(newEmp.id);
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
        searchPlaceholder="Search officer name, ref number, phone, qualifications..."
        statusFilter={roleFilter}
        onStatusFilterChange={(val) => {
          setRoleFilter(val);
          setCurrentPage(1);
        }}
        statusOptions={roleOptions}
        onExportCsv={handleExportCsv}
        onReset={() => {
          setSearchTerm('');
          setRoleFilter('all');
          setCurrentPage(1);
        }}
      />

      <DataTable
        columns={columns}
        data={paginatedEmployees}
        keyExtractor={(e) => e.id}
        onRowClick={(e) => onSelectEmployee(e.id)}
        emptyState={{
          title: 'No personnel records found',
          description: 'No security guards or officers matched your search or authorization scope.',
        }}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={filteredEmployees.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
