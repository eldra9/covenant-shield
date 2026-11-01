import React from 'react';
import { Permission, Role, ROLE_PERMISSIONS } from '@/types';
import { KeyRound, ShieldCheck, Check, X } from 'lucide-react';

const ALL_PERMISSIONS: { id: Permission; name: string; module: string; description: string }[] = [
  { id: 'dashboard.read', name: 'View Dashboard & Telemetry', module: 'Operations', description: 'Access live operations control dashboard and deployment metrics' },
  { id: 'requests.read', name: 'Read Service Requests', module: 'Commercial', description: 'Browse and inspect inbound security contracts and inquiries' },
  { id: 'requests.update', name: 'Manage Requests & Quotes', module: 'Commercial', description: 'Transition status, schedule assessments, and dispatch quotations' },
  { id: 'clients.read', name: 'Read Client Directory', module: 'Clients', description: 'View client accounts, billing addresses, and points of contact' },
  { id: 'clients.create', name: 'Create Client Accounts', module: 'Clients', description: 'Register new commercial client records with duplicate check' },
  { id: 'clients.update', name: 'Update Client Accounts', module: 'Clients', description: 'Modify client commercial terms, notes, and contacts' },
  { id: 'sites.read', name: 'Read Security Sites', module: 'Infrastructure', description: 'Inspect site locations, emergency phones, and coordinates' },
  { id: 'sites.manage', name: 'Manage Security Sites', module: 'Infrastructure', description: 'Create and edit sites, manning requirements, and supervisor scopes' },
  { id: 'employees.read', name: 'Read Guard Roster', module: 'Personnel', description: 'View guard records, qualifications, and employment standings' },
  { id: 'employees.manage', name: 'Manage Guard Personnel', module: 'Personnel', description: 'Enroll guards, verify PSRA certifications, and assign sites' },
  { id: 'shifts.read', name: 'Read Shift Rosters', module: 'Scheduling', description: 'View scheduled shifts and active rotations' },
  { id: 'shifts.manage', name: 'Manage Shift Scheduling', module: 'Scheduling', description: 'Create and modify shifts with automated collision and rest-period checks' },
  { id: 'attendance.read', name: 'Read Attendance Records', module: 'Attendance', description: 'Inspect biometric post check-ins and exception flags' },
  { id: 'attendance.correct', name: 'Submit Attendance Corrections', module: 'Attendance', description: 'Audit and correct attendance logs with immutable history' },
  { id: 'cases.read', name: 'Read Incident Cases', module: 'Incidents', description: 'Inspect perimeter breach logs, client complaints, and SLAs' },
  { id: 'cases.assign', name: 'Assign Case Investigators', module: 'Incidents', description: 'Designate lead investigation officers' },
  { id: 'cases.resolve', name: 'Transition & Resolve Cases', module: 'Incidents', description: 'Update status, propose resolutions, and document closure reasons' },
  { id: 'reports.read', name: 'Generate Operational Reports', module: 'Intelligence', description: 'Produce operational reports and download formula-safe CSVs' },
  { id: 'users.manage', name: 'Manage System Users', module: 'Administration', description: 'Create and update user accounts and security credentials' },
  { id: 'roles.manage', name: 'Authorize Roles & Scope', module: 'Administration', description: 'Assign roles and modify organizational boundaries' },
  { id: 'audit.read', name: 'View Audit Log', module: 'Governance', description: 'Inspect immutable system event trail' },
  { id: 'settings.manage', name: 'System Settings', module: 'Governance', description: 'Manage operational thresholds, EAT timezone, and security policies' },
  { id: 'requests.submit', name: 'Submit Service Requests', module: 'Commercial', description: 'Create new service requests on behalf of clients or own organization' },
  { id: 'cases.submit', name: 'Submit Complaints & Feedback', module: 'Incidents', description: 'File new incident reports or feedback cases' },
  { id: 'attendance.checkin', name: 'Guard Self Check-in / Out', module: 'Attendance', description: 'Guards record their own post arrival and departure via QR or mobile' },
];

const ROLES: { id: Role; label: string; badge: string }[] = [
  { id: 'super_admin', label: 'Super Administrator', badge: 'Tier 1' },
  { id: 'operations_staff', label: 'Operations Staff', badge: 'Tier 2' },
  { id: 'supervisor', label: 'Field Supervisor', badge: 'Tier 3' },
  { id: 'field_supervisor', label: 'Field Supervisor', badge: 'Tier 3b' },
  { id: 'guard', label: 'Security Guard', badge: 'Tier 4' },
  { id: 'client', label: 'Client Portal User', badge: 'Tier 5' },
];

export const RolePermissionsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-100 tracking-tight">
            Role-Based Access Control (RBAC) Matrix
          </h2>
          <p className="text-xs text-slate-400">
            Centralized policy definitions governing capabilities and resource boundaries across Covenant Shield.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-slate-200 uppercase font-mono tracking-wider">
              Central Capability Mapping
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {ALL_PERMISSIONS.length} Enforced Rules
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                <th className="py-3 px-4 min-w-[200px]">Permission Identifier</th>
                <th className="py-3 px-4 min-w-[120px]">Functional Module</th>
                {ROLES.map((r) => (
                  <th key={r.id} className="py-3 px-3 text-center min-w-[110px]">
                    <div className="font-semibold text-slate-200">{r.label}</div>
                    <div className="text-[10px] text-amber-400 font-normal">{r.badge}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {ALL_PERMISSIONS.map((perm) => (
                <tr key={perm.id} className="hover:bg-slate-850/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-mono font-semibold text-amber-300 text-xs">
                      {perm.id}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{perm.description}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-slate-300 font-medium">
                      {perm.module}
                    </span>
                  </td>
                  {ROLES.map((r) => {
                    const hasP = ROLE_PERMISSIONS[r.id].includes(perm.id);
                    return (
                      <td key={r.id} className="py-3 px-3 text-center">
                        {hasP ? (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-950/80 text-slate-600 border border-slate-800/80">
                            <X className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
