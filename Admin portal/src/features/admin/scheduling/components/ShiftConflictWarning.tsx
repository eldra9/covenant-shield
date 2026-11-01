import React from 'react';
import { AlertTriangle, AlertCircle, Clock } from 'lucide-react';
import { ShiftValidationResult } from '@/services/store';

interface ShiftConflictWarningProps {
  validation: ShiftValidationResult;
}

export const ShiftConflictWarning: React.FC<ShiftConflictWarningProps> = ({ validation }) => {
  if (!validation.hasConflict && !validation.hasRestWarning) {
    return null;
  }

  return (
    <div className="space-y-2">
      {validation.hasConflict && (
        <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-md text-xs text-rose-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-rose-100">Schedule Collision Detected</div>
            <div className="mt-0.5 text-[11px] leading-relaxed text-rose-200">
              {validation.conflictDetails}
            </div>
          </div>
        </div>
      )}

      {validation.hasRestWarning && (
        <div className="p-3 bg-amber-950/50 border border-amber-800/80 rounded-md text-xs text-amber-200 flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-100">Rest Period Notice</div>
            <div className="mt-0.5 text-[11px] leading-relaxed text-amber-200">
              {validation.restWarningDetails}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
