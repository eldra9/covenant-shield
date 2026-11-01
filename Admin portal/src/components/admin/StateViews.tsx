import React from 'react';
import { ShieldAlert, Lock, AlertTriangle, RotateCcw, Home, Compass } from 'lucide-react';
import { GuillocheSeal } from './GuillocheSeal';

// 401 Unauthorized
export const UnauthorizedState: React.FC<{ onSignIn?: () => void }> = ({ onSignIn }) => {
  return (
    <div className="min-h-[420px] flex flex-col items-center justify-center p-8 text-center space-y-4 bg-[#0D322D] rounded-xl border border-[#C9A04A]/25 emboss-card">
      <div className="w-14 h-14 rounded-full bg-[#071F1C] border border-[#C9A04A]/40 flex items-center justify-center text-[#C9A04A]">
        <Lock className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <span className="text-xs font-mono tracking-widest text-[#C9A04A] uppercase">
          Checkpoint 401 · Identity Verification
        </span>
        <h2 className="text-2xl font-display font-bold text-[#F4F6F4]">
          Session Authentication Required
        </h2>
        <p className="text-sm text-[#A0B2AC] max-w-md mx-auto">
          Your security session has expired or requires verified biometric credential handoff.
        </p>
      </div>
      {onSignIn && (
        <button
          onClick={onSignIn}
          className="px-4 py-2 text-xs font-semibold text-[#092824] bg-[#C9A04A] hover:bg-[#E6CB8A] rounded-md transition-colors"
        >
          Authenticate Post Credential
        </button>
      )}
    </div>
  );
};

// 403 Forbidden
export const ForbiddenState: React.FC<{ onReturn?: () => void }> = ({ onReturn }) => {
  return (
    <div className="min-h-[420px] flex flex-col items-center justify-center p-8 text-center space-y-4 bg-[#0D322D] rounded-xl border border-[#A12B2B]/40 emboss-card">
      <div className="w-14 h-14 rounded-full bg-[#071F1C] border border-[#A12B2B]/40 flex items-center justify-center text-[#A12B2B]">
        <ShieldAlert className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <span className="text-xs font-mono tracking-widest text-[#A12B2B] uppercase">
          Security Boundary 403 · Access Denied
        </span>
        <h2 className="text-2xl font-display font-bold text-[#F4F6F4]">
          Restricted Post
        </h2>
        <p className="text-sm text-[#A0B2AC] max-w-md mx-auto">
          You don&apos;t have access to this page. If you think you should, contact your administrator.
        </p>
      </div>
      {onReturn && (
        <button
          onClick={onReturn}
          className="px-4 py-2 text-xs font-semibold text-[#F4F6F4] bg-[#003C35] hover:bg-[#0B5247] rounded-md border border-[#C9A04A]/30 transition-colors"
        >
          Return to Operations Command
        </button>
      )}
    </div>
  );
};

// 404 Not Found
export const NotFoundState: React.FC<{ onReturn?: () => void }> = ({ onReturn }) => {
  return (
    <div className="min-h-[420px] flex flex-col items-center justify-center p-8 text-center space-y-4 bg-[#0D322D] rounded-xl border border-[#C9A04A]/25 emboss-card">
      <div className="w-14 h-14 rounded-full bg-[#071F1C] border border-[#C9A04A]/40 flex items-center justify-center text-[#C9A04A]">
        <Compass className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <span className="text-xs font-mono tracking-widest text-[#C9A04A] uppercase">
          Route Telemetry 404
        </span>
        <h2 className="text-2xl font-display font-bold text-[#F4F6F4]">
          Off the Route
        </h2>
        <p className="text-sm text-[#A0B2AC] max-w-md mx-auto">
          The requested dispatch record, facility dossier, or operations route could not be located.
        </p>
      </div>
      {onReturn && (
        <button
          onClick={onReturn}
          className="px-4 py-2 text-xs font-semibold text-[#092824] bg-[#C9A04A] hover:bg-[#E6CB8A] rounded-md transition-colors"
        >
          Return to Roster
        </button>
      )}
    </div>
  );
};

// 500 Internal Error
export const ServerErrorState: React.FC<{ onRetry?: () => void; requestId?: string }> = ({
  onRetry,
  requestId = `REQ-${Date.now().toString(36).toUpperCase()}`,
}) => {
  return (
    <div className="min-h-[420px] flex flex-col items-center justify-center p-8 text-center space-y-4 bg-[#0D322D] rounded-xl border border-[#A12B2B]/40 emboss-card">
      <div className="w-14 h-14 rounded-full bg-[#071F1C] border border-[#A12B2B]/40 flex items-center justify-center text-[#A12B2B]">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <span className="text-xs font-mono tracking-widest text-[#A12B2B] uppercase">
          System Post Exception 500
        </span>
        <h2 className="text-2xl font-display font-bold text-[#F4F6F4]">
          Our Post is Down
        </h2>
        <p className="text-sm text-[#A0B2AC] max-w-md mx-auto">
          The operations server encountered an unexpected interruption. Our telemetry dispatch has logged the incident.
        </p>
        <p className="text-xs font-mono text-[#52625D]">
          Incident Trace ID: {requestId}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#092824] bg-[#C9A04A] hover:bg-[#E6CB8A] rounded-md transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
};

// Elegant Empty State with Guilloche Seal
export const QuietEmptyState: React.FC<{
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}> = ({
  title = 'Nothing needs attention.',
  description = 'All security posts, attendance telemetry, and service requests are clear.',
  action,
}) => {
  return (
    <div className="p-8 sm:p-12 text-center space-y-3 bg-[#0D322D]/60 rounded-xl border border-[#003C35] emboss-card flex flex-col items-center justify-center">
      <GuillocheSeal size={100} theme="dark" />
      <div className="space-y-1 max-w-md mx-auto">
        <h4 className="text-base font-display font-bold text-[#F4F6F4]">
          {title}
        </h4>
        <p className="text-xs text-[#A0B2AC] font-sans">
          {description}
        </p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-3.5 py-1.5 text-xs font-semibold text-[#092824] bg-[#C9A04A] hover:bg-[#E6CB8A] rounded-md transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

// Skeleton Table Loader with 1.4s pulse
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="space-y-2 animate-pulse" style={{ animationDuration: '1400ms' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-12 bg-[#0D322D] rounded border border-[#003C35] flex items-center px-4 gap-4"
        >
          <div className="w-20 h-4 bg-[#123D37] rounded" />
          <div className="w-36 h-4 bg-[#123D37] rounded" />
          <div className="flex-1 h-4 bg-[#123D37] rounded hidden sm:block" />
          <div className="w-24 h-4 bg-[#123D37] rounded" />
          <div className="w-16 h-6 bg-[#123D37] rounded" />
        </div>
      ))}
    </div>
  );
};
