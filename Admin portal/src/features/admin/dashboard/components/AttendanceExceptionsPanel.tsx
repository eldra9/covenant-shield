import React from 'react';
import { AlertCircle, Clock, ShieldAlert, ArrowRight } from 'lucide-react';
import { AttendanceRecord } from '@/types';
import { formatEATTime } from '@/utils/date';
import { StatusBadge } from '@/components/admin/StatusBadge';

interface AttendanceExceptionsPanelProps {
  exceptions: AttendanceRecord[];
  onReviewException: (record: AttendanceRecord) => void;
}

export const AttendanceExceptionsPanel: React.FC<AttendanceExceptionsPanelProps> = ({
  exceptions,
  onReviewException,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-semibold text-slate-100">Live Attendance Exceptions</h3>
        </div>
        <span className="text-[11px] font-mono text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2 py-0.5 rounded">
          {exceptions.length} Urgent Flag{exceptions.length === 1 ? '' : 's'}
        </span>
      </div>

      {exceptions.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-xs">
          No active attendance deviations or unconfirmed posts. All scheduled guards are checked in nominal.
        </div>
      ) : (
        <div className="divide-y divide-slate-800/80">
          {exceptions.map((rec) => (
            <div
              key={rec.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850/50 -mx-2 px-2 rounded transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {rec.guardName}
                  </span>
                  <StatusBadge status={rec.currentStatus} size="sm" />
                  <span className="text-[11px] text-slate-400 font-mono">
                    {rec.siteName}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {rec.exceptionNotes || 'Scheduled shift start missed with no telemetry confirmed.'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Scheduled Start: {formatEATTime(rec.scheduledStart)} · Check-in: {rec.actualCheckIn ? formatEATTime(rec.actualCheckIn) : 'None logged'}
                </div>
              </div>

              <button
                onClick={() => onReviewException(rec)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/40 border border-amber-800/50 hover:bg-amber-900/40 rounded transition-colors self-start sm:self-center shrink-0"
              >
                <span>Investigate</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
