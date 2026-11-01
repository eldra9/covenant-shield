import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  submessage?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Securing connection and loading details...',
  submessage = 'Please wait while we query the dispatch register.',
  className = '',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-[#CCD8D2] shadow-sm ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-[#003C35]/10 flex items-center justify-center mb-4">
        <Loader2 className="w-6 h-6 text-[#003C35] animate-spin" />
      </div>
      <h3 className="text-base font-semibold text-[#003C35] mb-1">{message}</h3>
      {submessage && <p className="text-sm text-[#536B65] max-w-sm">{submessage}</p>}
    </div>
  );
};
