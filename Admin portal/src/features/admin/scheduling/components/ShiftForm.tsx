import React, { useState, useEffect } from 'react';
import { Shift } from '@/types';
import {
  getEmployees,
  getSites,
  saveShift,
  validateShiftSchedule,
} from '@/services/store';
import { ShiftConflictWarning } from './ShiftConflictWarning';

interface ShiftFormProps {
  initialData?: Shift;
  onSuccess: (savedShift: Shift) => void;
  onCancel: () => void;
}

export const ShiftForm: React.FC<ShiftFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const sites = getSites();
  const guards = getEmployees().filter(
    (e) => (e.role === 'guard' || e.role === 'k9_specialist' || e.role === 'cctv_operator') && e.employmentStatus === 'active'
  );

  const [siteId, setSiteId] = useState(initialData?.siteId || sites[0]?.id || '');
  const [guardId, setGuardId] = useState(initialData?.guardId || guards[0]?.id || '');
  const [date, setDate] = useState(initialData?.date || '2026-10-29');
  const [shiftType, setShiftType] = useState<Shift['shiftType']>(initialData?.shiftType || 'day_shift');
  const [startTime, setStartTime] = useState(initialData?.startTime || '06:00');
  const [endTime, setEndTime] = useState(initialData?.endTime || '18:00');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [status, setStatus] = useState<Shift['status']>(initialData?.status || 'scheduled');
  const [error, setError] = useState<string | null>(null);

  // Real-time conflict validation
  const validation = validateShiftSchedule(
    guardId,
    date,
    startTime,
    endTime,
    initialData?.id
  );

  const handleShiftTypeChange = (type: Shift['shiftType']) => {
    setShiftType(type);
    if (type === 'day_shift') {
      setStartTime('06:00');
      setEndTime('18:00');
    } else if (type === 'night_shift') {
      setStartTime('18:00');
      setEndTime('06:00');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteId || !guardId || !date || !startTime || !endTime) {
      setError('Please fill in all mandatory shift fields.');
      return;
    }

    if (validation.hasConflict) {
      setError(validation.conflictDetails || 'Cannot roster guard due to an overlapping shift.');
      return;
    }

    const res = saveShift({
      id: initialData?.id,
      siteId,
      guardId,
      date,
      shiftType,
      startTime,
      endTime,
      status,
      notes: notes.trim(),
    });

    if (res.success && res.shift) {
      onSuccess(res.shift);
    } else {
      setError(res.error || 'Failed to schedule shift');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-md text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Collision warning component */}
      <ShiftConflictWarning validation={validation} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Stationed Security Site <span className="text-amber-400">*</span>
          </label>
          <select
            value={siteId}
            aria-label="Stationed security site"
            onChange={(e) => setSiteId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.siteCode})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Assigned Guard / Specialist <span className="text-amber-400">*</span>
          </label>
          <select
            value={guardId}
            aria-label="Assigned guard or specialist"
            onChange={(e) => setGuardId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
          >
            {guards.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.employeeNumber} - {g.role})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Shift Date (EAT)</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Rotation Template</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleShiftTypeChange('day_shift')}
              className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
                shiftType === 'day_shift'
                  ? 'bg-amber-400/20 text-amber-300 border-amber-500/50 font-medium'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              Day (06:00 - 18:00)
            </button>
            <button
              type="button"
              onClick={() => handleShiftTypeChange('night_shift')}
              className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
                shiftType === 'night_shift'
                  ? 'bg-amber-400/20 text-amber-300 border-amber-500/50 font-medium'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              Night (18:00 - 06:00)
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Start Time (HH:mm EAT)
          </label>
          <input
            type="time"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            End Time (HH:mm EAT)
          </label>
          <input
            type="time"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500 font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">Shift Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500 capitalize"
        >
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress (Active Post)</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">
          Special Post Directives / Handover Notes
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Inbound visitor registration at West Gate, hourly radio status checks..."
          className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
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
          disabled={validation.hasConflict}
          className="px-4 py-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 rounded-md transition-colors"
        >
          {initialData ? 'Update Shift' : 'Roster Shift'}
        </button>
      </div>
    </form>
  );
};
