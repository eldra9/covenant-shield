import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Edit3,
  MapPin,
  Phone,
  QrCode,
  Shield,
  ShieldAlert,
  User,
  Users,
} from 'lucide-react';
import {
  getAttendanceRecords,
  getCases,
  getCurrentUser,
  getEmployees,
  getShifts,
  getSiteById,
  hasPermission,
} from '@/services/store';
import { formatEAT, formatEATDate } from '@/utils/date';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { SiteForm } from '../components/SiteForm';

interface SiteDetailPageProps {
  siteId: string;
  onBack: () => void;
  onSelectShift?: (shiftId: string) => void;
  onSelectCase?: (caseId: string) => void;
}

export const SiteDetailPage: React.FC<SiteDetailPageProps> = ({
  siteId,
  onBack,
  onSelectShift,
  onSelectCase,
}) => {
  const [, setTick] = useState(0);
  const reload = () => setTick((t) => t + 1);

  const [isEditing, setIsEditing] = useState(false);
  const site = getSiteById(siteId);
  const currentUser = getCurrentUser();
  const canManage = hasPermission('sites.manage', currentUser);

  if (!site) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-lg max-w-lg mx-auto">
        <h3 className="text-base font-semibold text-slate-100">Site Not Found or Inaccessible</h3>
        <p className="text-xs text-slate-400 mt-1">
          This post could not be accessed. Field Supervisors can only inspect sites within their designated resource scope.
        </p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 text-xs bg-slate-800 text-slate-200 rounded-md hover:bg-slate-700"
        >
          Back to Sites
        </button>
      </div>
    );
  }

  // Linked resources
  const allEmployees = getEmployees();
  const assignedSupervisors = allEmployees.filter((e) =>
    site.assignedSupervisorIds.includes(e.id)
  );

  const siteShifts = getShifts().filter((s) => s.siteId === site.id);
  const siteAttendance = getAttendanceRecords().filter((a) => a.siteId === site.id);
  const siteCases = getCases().filter((c) => c.siteId === site.id);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors"
            aria-label="Back to sites list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">{site.name}</h2>
              <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                {site.siteCode}
              </span>
              <StatusBadge status={site.status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Client: <span className="text-slate-200 font-medium">{site.clientName}</span> · {site.city}
            </p>
          </div>
        </div>

        {canManage && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Edit Facility Protocols</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Edit Security Post Details</h3>
          <SiteForm
            initialData={site}
            onSuccess={() => {
              setIsEditing(false);
              reload();
            }}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Post Specs & Operational Shifts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Facility specs */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
              <h3 className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Facility Infrastructure & Manning</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Physical Address</span>
                  <span className="text-slate-200">{site.address}, {site.city}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Mandatory Post Strength</span>
                  <span className="text-slate-200 font-mono font-medium">
                    {site.requiredGuardCount} Dedicated Officer(s)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">On-Site Manager / Lead</span>
                  <span className="text-slate-200">{site.contactPerson || 'Facilities Office'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Control Room Phone</span>
                  <span className="text-slate-200 font-mono">{site.contactPhone || '—'}</span>
                </div>
                {site.coordinates && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 block text-[11px]">GPS Telemetry Coordinates</span>
                    <span className="text-slate-300 font-mono text-[11px]">
                      Latitude: {site.coordinates.lat} · Longitude: {site.coordinates.lng}
                    </span>
                  </div>
                )}
              </div>

              {site.operationalNotes && (
                <div className="mt-3 p-3 bg-slate-950/60 rounded border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">
                    Operating Directives & Gate Rules
                  </span>
                  {site.operationalNotes}
                </div>
              )}
            </div>

            {/* Scheduled Shifts at Site */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <h3 className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider mb-3 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Stationed Guard Rotations ({siteShifts.length})</span>
              </h3>

              {siteShifts.length === 0 ? (
                <div className="text-xs text-slate-500 py-3 text-center">
                  No shifts scheduled for this post today.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {siteShifts.map((shift) => (
                    <div
                      key={shift.id}
                      onClick={() => onSelectShift?.(shift.id)}
                      className="py-3 flex items-center justify-between hover:bg-slate-850/50 -mx-2 px-2 rounded cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-200">
                          {shift.guardName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {shift.shiftCode} · {shift.startTime} – {shift.endTime} (EAT)
                        </div>
                      </div>
                      <StatusBadge status={shift.status} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Site Incidents & Cases */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <h3 className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider mb-3 flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Logged Incidents at this Facility ({siteCases.length})</span>
              </h3>

              {siteCases.length === 0 ? (
                <div className="text-xs text-slate-500 py-3 text-center">
                  Zero active breach or incident tickets logged for this site.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {siteCases.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => onSelectCase?.(c.id)}
                      className="py-3 flex items-center justify-between hover:bg-slate-850/50 -mx-2 px-2 rounded cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-200">{c.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {c.caseNumber} · Reported by {c.reportedBy}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase ${
                          c.severity === 'critical' || c.severity === 'high' ? 'bg-rose-950 text-rose-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {c.severity}
                        </span>
                        <StatusBadge status={c.status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Assigned Supervisors & Scope */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <h3 className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider mb-3 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Command Supervisors</span>
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">
                Field supervisors assigned to conduct post checks and handle attendance exceptions for this installation.
              </p>

              {assignedSupervisors.length === 0 ? (
                <div className="text-xs text-slate-500 py-2">
                  No dedicated field supervisor assigned yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {assignedSupervisors.map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 bg-slate-950/70 border border-slate-800 rounded text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{s.name}</span>
                        <span className="text-[10px] text-amber-400 font-mono">Field Sup</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{s.phone}</div>
                      <div className="text-[10px] text-slate-500">Ref: {s.employeeNumber}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Geofence & QR Code */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <h3 className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider mb-3 flex items-center gap-2">
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>Geofence &amp; Check-in QR</span>
              </h3>
              <div className="space-y-3">
                {/* Geofence radius */}
                <div className="bg-slate-950/70 border border-slate-800 rounded p-3 text-xs space-y-1">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">Geofence Radius</div>
                  <div className="text-slate-200 font-semibold">
                    {(site as any).geofenceRadius ? `${(site as any).geofenceRadius} metres` : 'Not configured'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Guards must check in within this radius of the site GPS anchor point.
                  </div>
                </div>
                {/* QR placeholder */}
                <div className="bg-slate-950/70 border border-amber-900/40 rounded p-3 text-xs space-y-2">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">Guard Check-in QR Code</div>
                  <div className="flex items-center justify-center w-full h-28 bg-white rounded">
                    {/* ASCII-art QR placeholder until a real QR library is integrated */}
                    <div className="grid grid-cols-5 grid-rows-5 gap-0.5 opacity-80">
                      {/* Corner finder pattern simulation */}
                      {Array.from({ length: 25 }).map((_, i) => {
                        const r = Math.floor(i / 5);
                        const c = i % 5;
                        const isBorder = r === 0 || r === 4 || c === 0 || c === 4;
                        const isInner = (r === 1 || r === 3) && (c === 1 || c === 3);
                        const isCenter = r === 2 && c === 2;
                        const dark = isBorder || isCenter || (!isInner && Math.random() > 0.5);
                        return (
                          <div
                            key={i}
                            className={`w-3 h-3 ${dark ? 'bg-slate-900' : 'bg-white'}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="text-center font-mono text-[11px] text-amber-400 tracking-widest">
                    {site.siteCode}
                  </div>
                  <div className="text-[10px] text-slate-500 text-center">
                    Scan at gate to log check-in. GPS captured at scan time only.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
