import React, { useState } from 'react';
import { AttendanceRecord, AttendanceStatus } from '@/types';
import { correctAttendanceRecord } from '@/services/store';
import { formatEAT, formatEATTime } from '@/utils/date';
import { AlertTriangle, FileCheck } from 'lucide-react';

interface AttendanceCorrectionFormProps {
  record: AttendanceRecord;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AttendanceCorrectionForm: React.FC<AttendanceCorrectionFormProps> = ({
  record,
  onSuccess,
  onCancel,
}) => {
  const [newStatus, setNewStatus] = useState<AttendanceStatus>('corrected');
  const [reason, setReason] = useState('');
  const [checkInTime, setCheckInTime] = useState(
    record.actualCheckIn ? new Date(record.actualCheckIn).toISOString().substring(11, 16) : '06:00'
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A documented audit rationale is mandatory for every attendance correction.');
      return;
    }

    // Convert new time to ISO UTC
    const datePart = record.date;
    const [hh, mm] = checkInTime.split(':').map(Number);
    // Convert EAT (UTC+3) to UTC: subtract 3 hours
    const utcDate = new Date(Date.UTC(
      parseInt(datePart.split('-')[0]),
      parseInt(datePart.split('-')[1]) - 1,
      parseInt(datePart.split('-')[2]),
      hh - 3,
      mm
    ));

    const res = correctAttendanceRecord(
      record.id,
      newStatus,
      reason.trim(),
      utcDate.toISOString(),
      record.actualCheckOut
    );

    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || 'Failed to submit correction');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-md text-xs text-amber-300 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-amber-200">Compliance Preservation Notice:</span> Original event data (<span className="font-mono">{record.originalStatus}</span>) is immutably preserved. This action appends an audited correction ledger entry.
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-md text-xs text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Current Recorded Status
          </label>
          <input
            type="text"
            disabled
            value={record.currentStatus}
            className="w-full bg-slate-900 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-400 capitalize cursor-not-allowed font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Corrected Resolution Status <span className="text-amber-400">*</span>
          </label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as AttendanceStatus)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500 capitalize"
          >
            <option value="corrected">Corrected (Audited Proof Verified)</option>
            <option value="on_time">On Time (Retroactive Verification)</option>
            <option value="late">Late Arrival</option>
            <option value="absent">Confirmed Unexcused Absence</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Verified Physical Check-In (HH:mm EAT)
          </label>
          <input
            type="time"
            value={checkInTime}
            onChange={(e) => setCheckInTime(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Officer</label>
          <input
            type="text"
            disabled
            value={`${record.guardName} (${record.siteName})`}
            className="w-full bg-slate-900 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-400 cursor-not-allowed"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">
          Documented Justification & Verification Evidence <span className="text-amber-400">*</span>
        </label>
        <textarea
          rows={3}
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Biometric reader hardware offline; physical log sheet cross-signed by site supervisor Samuel Okello confirms officer arrived on time at 05:52 EAT."
          className="w-full bg-slate-950 border border-slate-800 rounded-md p-2.5 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-md transition-colors inline-flex items-center gap-1.5"
        >
          <FileCheck className="w-4 h-4" />
          <span>Commit Audited Correction</span>
        </button>
      </div>
    </form>
  );
};
