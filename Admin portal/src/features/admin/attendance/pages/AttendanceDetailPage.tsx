import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileCheck,
  History,
  MapPin,
  ShieldAlert,
  User,
} from 'lucide-react';
import {
  getAttendanceById,
  getCurrentUser,
  hasPermission,
} from '@/services/store';
import { formatEAT, formatEATDate, formatEATTime } from '@/utils/date';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { AttendanceCorrectionForm } from '../components/AttendanceCorrectionForm';

interface AttendanceDetailPageProps {
  attendanceId: string;
  onBack: () => void;
}

export const AttendanceDetailPage: React.FC<AttendanceDetailPageProps> = ({
  attendanceId,
  onBack,
}) => {
  const [, setTick] = useState(0);
  const reload = () => setTick((t) => t + 1);

  const [isCorrecting, setIsCorrecting] = useState(false);
  const record = getAttendanceById(attendanceId);
  const currentUser = getCurrentUser();
  const canCorrect = hasPermission('attendance.correct', currentUser);

  if (!record) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-lg max-w-lg mx-auto">
        <h3 className="text-base font-semibold text-slate-100">Attendance Log Not Found</h3>
        <p className="text-xs text-slate-400 mt-1">
          This record may not exist or is outside your current operational scope.
        </p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 text-xs bg-slate-800 text-slate-200 rounded-md hover:bg-slate-700"
        >
          Back to Attendance
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors"
            aria-label="Back to attendance logs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">{record.guardName}</h2>
              <StatusBadge status={record.currentStatus} />
              {record.isException && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/50 font-mono">
                  Exception Flag
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Post: <span className="text-slate-200 font-medium">{record.siteName}</span> · Shift Date {formatEATDate(record.date)}
            </p>
          </div>
        </div>

        {canCorrect && !isCorrecting && (
          <button
            onClick={() => setIsCorrecting(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors self-start sm:self-auto"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Submit Audited Correction</span>
          </button>
        )}
      </div>

      {isCorrecting ? (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">
            Correct Attendance Record #{record.id}
          </h3>
          <AttendanceCorrectionForm
            record={record}
            onSuccess={() => {
              setIsCorrecting(false);
              reload();
            }}
            onCancel={() => setIsCorrecting(false)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Biometric & Check-in Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
              <h3 className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Biometric Post Check-in & Rostered Window</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-950/60 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Rostered Window (EAT)</span>
                  <span className="text-slate-200 font-mono font-medium text-sm">
                    {formatEATTime(record.scheduledStart)} – {formatEATTime(record.scheduledEnd)}
                  </span>
                </div>

                <div className="p-3 bg-slate-950/60 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Actual Verified Check-In</span>
                  <span className="text-emerald-400 font-mono font-medium text-sm">
                    {record.actualCheckIn ? formatEATTime(record.actualCheckIn) : 'No Telemetry Signal'}
                  </span>
                </div>

                <div className="p-3 bg-slate-950/60 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Original Event Classification</span>
                  <span className="text-slate-300 font-mono capitalize">
                    {record.originalStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="p-3 bg-slate-950/60 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Current Verified Status</span>
                  <span className="text-amber-400 font-mono capitalize font-semibold">
                    {record.currentStatus.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {record.exceptionNotes && (
                <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded text-xs text-rose-200">
                  <span className="text-[10px] text-rose-400 uppercase font-mono block mb-1">
                    Initial Exception Note
                  </span>
                  {record.exceptionNotes}
                </div>
              )}
            </div>

            {/* Immutable Correction History */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <h3 className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider mb-4 flex items-center gap-2">
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>Immutable Correction Audit History ({record.correctionHistory.length})</span>
              </h3>

              {record.correctionHistory.length === 0 ? (
                <div className="text-xs text-slate-500 py-3 text-center">
                  Original biometric event unaltered. No corrections have been applied to this record.
                </div>
              ) : (
                <div className="space-y-3">
                  {record.correctionHistory.map((corr) => (
                    <div
                      key={corr.id}
                      className="p-3 bg-slate-950/80 rounded border border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-semibold text-slate-200">
                          Status updated: <span className="font-mono text-slate-400">{corr.priorStatus}</span> → <span className="font-mono text-amber-300">{corr.newStatus}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {formatEAT(corr.timestamp)}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2 rounded border border-slate-800/50">
                        "{corr.reason}"
                      </p>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Authorizing Officer: {corr.correctedByUserName} ({corr.correctedByUserRole.replace('_', ' ')})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Shift & Facility context */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
              <h3 className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Station Assignment</span>
              </h3>
              <div className="text-xs space-y-2">
                <div>
                  <span className="text-slate-500 block text-[11px]">Facility Name</span>
                  <span className="text-slate-200 font-medium">{record.siteName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Shift Identifier</span>
                  <span className="text-slate-300 font-mono">{record.shiftId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Supervising Officer</span>
                  <span className="text-slate-300">{record.supervisorName || 'Command Center'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
