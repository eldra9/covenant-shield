import React from 'react';
import { Activity } from 'lucide-react';
import { Site, Shift, Employee } from '@/types';

interface OperationsSummaryProps {
  sites: Site[];
  shifts: Shift[];
  employees: Employee[];
}

export const OperationsSummary: React.FC<OperationsSummaryProps> = ({
  sites,
  shifts,
  employees,
}) => {
  const activeSites = sites.filter((s) => s.status === 'active');
  const activeGuards = employees.filter((e) => e.employmentStatus === 'active');
  const todayShifts = shifts.filter((s) => s.date === '2026-10-29' || s.status === 'in_progress');
  const inProgressShifts = todayShifts.filter((s) => s.status === 'in_progress');

  const requiredGuardsTotal = activeSites.reduce((sum, s) => sum + s.requiredGuardCount, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-100">Live Deployment Status</h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">EAT Operations Zone</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-md">
          <div className="text-[11px] text-slate-400 font-medium">Post Manning Ratio</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-100 tabular-nums">
              {todayShifts.length} / {requiredGuardsTotal}
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">
              {requiredGuardsTotal > 0
                ? `${Math.round((todayShifts.length / requiredGuardsTotal) * 100)}%`
                : '100%'}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            {requiredGuardsTotal - todayShifts.length > 0
              ? `${requiredGuardsTotal - todayShifts.length} post(s) open for dispatch`
              : 'All mandatory posts manned'}
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-md">
          <div className="text-[11px] text-slate-400 font-medium">Active Radio Patrols</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {inProgressShifts.length}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Units Online</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            Across {activeSites.length} verified client sites
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-md">
          <div className="text-[11px] text-slate-400 font-medium">Field Supervisors on Duty</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">
              {employees.filter((e) => e.role === 'supervisor' && e.employmentStatus === 'active').length}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Supervisory Command</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            Conducting random site inspections
          </div>
        </div>
      </div>
    </div>
  );
};
