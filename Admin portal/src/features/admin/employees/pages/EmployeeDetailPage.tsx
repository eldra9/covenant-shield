import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Edit3,
  FileCheck,
  MapPin,
  Phone,
  Shield,
  User,
  Users,
} from 'lucide-react';
import {
  getAttendanceRecords,
  getCurrentUser,
  getEmployeeById,
  getShifts,
  getSites,
  hasPermission,
} from '@/services/store';
import { formatEAT, formatEATDate } from '@/utils/date';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmployeeForm } from '../components/EmployeeForm';

interface EmployeeDetailPageProps {
  employeeId: string;
  onBack: () => void;
  onSelectSite?: (siteId: string) => void;
}

export const EmployeeDetailPage: React.FC<EmployeeDetailPageProps> = ({
  employeeId,
  onBack,
  onSelectSite,
}) => {
  const [, setTick] = useState(0);
  const reload = () => setTick((t) => t + 1);

  const [isEditing, setIsEditing] = useState(false);
  const employee = getEmployeeById(employeeId);
  const currentUser = getCurrentUser();
  const canManage = hasPermission('employees.manage', currentUser);

  if (!employee) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-lg max-w-lg mx-auto">
        <h3 className="text-base font-semibold text-slate-100">Personnel Record Inaccessible</h3>
        <p className="text-xs text-slate-400 mt-1">
          Employee profile not found or restricted by current supervisory scope.
        </p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 text-xs bg-slate-800 text-slate-200 rounded-md hover:bg-slate-700"
        >
          Back to Personnel Directory
        </button>
      </div>
    );
  }

  const allSites = getSites();
  const assignedSites = allSites.filter((s) => employee.assignedSiteIds.includes(s.id));
  const employeeShifts = getShifts().filter((s) => s.guardId === employee.id);
  const employeeAttendance = getAttendanceRecords().filter((a) => a.guardId === employee.id);

  const onTimeCount = employeeAttendance.filter(
    (a) => a.currentStatus === 'on_time' || a.currentStatus === 'corrected'
  ).length;
  const exceptionCount = employeeAttendance.filter((a) => a.isException).length;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors"
            aria-label="Back to employee list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">{employee.name}</h2>
              <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                {employee.employeeNumber}
              </span>
              <StatusBadge status={employee.employmentStatus} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5 capitalize">
              Role: <span className="text-slate-200 font-medium">{employee.role.replace(/_/g, ' ')}</span> · Enrolled {formatEATDate(employee.dateHired)}
            </p>
          </div>
        </div>

        {canManage && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Edit Personnel Profile</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Edit Personnel File</h3>
          <EmployeeForm
            initialData={employee}
            onSuccess={() => {
              setIsEditing(false);
              reload();
            }}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Personnel Credentials & Compliance */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vetting & Contact Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
              <h3 className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Identification & Compliance File</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">National Identification</span>
                  <span className="text-slate-200 font-mono">{employee.nationalIdMasked}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Primary Duty Phone</span>
                  <span className="text-slate-200 font-mono">{employee.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Official Email</span>
                  <span className="text-slate-200 font-mono">{employee.email || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Emergency Next-of-Kin</span>
                  <span className="text-slate-200">{employee.emergencyContact || '—'}</span>
                </div>
              </div>

              {/* Qualifications */}
              <div className="pt-2">
                <span className="text-slate-500 block text-[11px] mb-1.5">
                  Verified Vetting & Endorsements
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {employee.qualifications.map((q) => (
                    <span
                      key={q}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-950 text-slate-200 border border-slate-800 rounded font-medium"
                    >
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>{q}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Attendance Track Record */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <h3 className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Shift Attendance History ({employeeAttendance.length})</span>
                </h3>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-emerald-400">{onTimeCount} Nominal</span>
                  {exceptionCount > 0 && <span className="text-rose-400">{exceptionCount} Exceptions</span>}
                </div>
              </div>

              {employeeAttendance.length === 0 ? (
                <div className="text-xs text-slate-500 py-3 text-center">
                  No attendance history logged yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {employeeAttendance.map((rec) => (
                    <div
                      key={rec.id}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-medium text-slate-200">{rec.siteName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Date: {formatEATDate(rec.date)} · In: {rec.actualCheckIn ? formatEAT(rec.actualCheckIn) : 'Unconfirmed'}
                        </div>
                      </div>
                      <StatusBadge status={rec.currentStatus} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Stationed Facilities */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <h3 className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Stationed Security Sites</span>
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">
                Client perimeters and post installations where this officer is authorized to be rostered.
              </p>

              {assignedSites.length === 0 ? (
                <div className="text-xs text-slate-500 py-2">
                  Officer not allocated to any active sites.
                </div>
              ) : (
                <div className="space-y-2">
                  {assignedSites.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => onSelectSite?.(s.id)}
                      className="p-2.5 bg-slate-950/70 border border-slate-800 rounded text-xs space-y-1 hover:border-slate-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{s.name}</span>
                        <StatusBadge status={s.status} size="sm" />
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{s.siteCode} · {s.city}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
