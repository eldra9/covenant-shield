import React, { useId } from 'react';
import { MagneticButton } from '../../../motion/MagneticButton.tsx';
import { RotateCw, ShieldAlert, ArrowLeft } from 'lucide-react';

export interface ServerErrorPageProps {
  onNavigate?: (path: string) => void;
  requestId?: string;
  onRetry?: () => void;
  errorDetail?: string;
}

export const ServerErrorPage: React.FC<ServerErrorPageProps> = ({
  onNavigate,
  requestId,
  onRetry,
  errorDetail,
}) => {
  const generatedId = useId().replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase() || '5D81B20E';
  const displayId = requestId || `ERR-CS-${generatedId}`;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="w-full bg-[#092824] text-white min-h-[calc(100vh-80px)] flex items-center justify-center py-20 px-4 sm:px-6 relative overflow-hidden">
      {/* Background subtle radial warning glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(161, 43, 43, 0.25) 0%, rgba(201, 160, 74, 0.1) 40%, transparent 70%)',
        }}
      />

      <div className="max-w-xl w-full mx-auto text-center relative z-10 space-y-8">
        {/* Incident badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#C9A04A]/30 bg-[#C9A04A]/10 text-[#C9A04A] text-xs font-mono uppercase tracking-widest">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Error 500 · Command Post Interruption</span>
        </div>

        {/* 1.5px Foil Line-Art Illustration: Sentry Bastion / Shield Beacon */}
        <div className="flex justify-center items-center my-6">
          <svg
            className="w-48 h-48 sm:w-56 sm:h-56 filter drop-shadow-[0_8px_24px_rgba(201,160,74,0.15)]"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="foil500Stroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A47F2E" />
                <stop offset="35%" stopColor="#C9A04A" />
                <stop offset="50%" stopColor="#E6CB8A" />
                <stop offset="65%" stopColor="#C9A04A" />
                <stop offset="100%" stopColor="#A47F2E" />
              </linearGradient>
            </defs>

            {/* Sentry Tower Crenellations */}
            <path
              d="M 50 160 L 50 80 L 62 80 L 62 90 L 78 90 L 78 80 L 92 80 L 92 90 L 108 90 L 108 80 L 122 80 L 122 90 L 138 90 L 138 80 L 150 80 L 150 160 Z"
              stroke="url(#foil500Stroke)"
              strokeWidth="1.5"
              fill="rgba(201, 160, 74, 0.04)"
            />

            {/* Central Sentry Shield Contour */}
            <path
              d="M 100 40 L 135 55 V 105 C 135 128 100 148 100 148 C 100 148 65 128 65 105 V 55 Z"
              stroke="url(#foil500Stroke)"
              strokeWidth="1.5"
              fill="rgba(0, 60, 53, 0.6)"
            />

            {/* Inner Shield Line */}
            <path
              d="M 100 48 L 127 60 V 102 C 127 121 100 138 100 138 C 100 138 73 121 73 102 V 60 Z"
              stroke="url(#foil500Stroke)"
              strokeWidth="1.5"
              strokeOpacity="0.6"
            />

            {/* Protective Beacon / Lightning Surge Hairline */}
            <path
              d="M 100 68 L 94 92 L 104 92 L 96 116"
              stroke="url(#foil500Stroke)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Foundation Line and Anchor Bolts */}
            <line x1="36" y1="160" x2="164" y2="160" stroke="url(#foil500Stroke)" strokeWidth="1.5" />
            <circle cx="50" cy="160" r="2.5" fill="#C9A04A" />
            <circle cx="100" cy="160" r="2.5" fill="#C9A04A" />
            <circle cx="150" cy="160" r="2.5" fill="#C9A04A" />

            {/* Radar Sweep Rings */}
            <path
              d="M 40 40 A 85 85 0 0 1 160 40"
              stroke="url(#foil500Stroke)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              opacity="0.4"
            />
          </svg>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="font-display text-4xl sm:text-5xl font-normal tracking-tight text-white">
            Our post is down<span className="text-[#C9A04A]">.</span>
          </h1>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
            The command server encountered a temporary synchronization disruption. Perimeter integrity remains intact; watch officers are responding.
          </p>
          {errorDetail && (
            <p className="text-xs font-mono text-[#E6CB8A]/80 bg-black/30 p-2 rounded max-w-sm mx-auto truncate">
              {errorDetail}
            </p>
          )}
        </div>

        {/* Request ID Display */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-[#0D322D] border border-white/10 text-xs font-mono text-white/60">
          <span className="text-[#C9A04A] font-bold">INCIDENT ID:</span>
          <span className="text-white tracking-widest">{displayId}</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <MagneticButton
            variant="gold"
            onClick={handleRetry}
            className="w-full sm:w-auto !px-7 !py-3.5 font-bold uppercase text-xs tracking-wider"
          >
            <span className="flex items-center gap-2">
              <RotateCw className="w-4 h-4" />
              <span>Retry Post Connection</span>
            </span>
          </MagneticButton>

          {onNavigate && (
            <button
              onClick={() => onNavigate('/')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-mono uppercase tracking-wider text-white transition-colors flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C9A04A]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C9A04A]" />
              <span>Return to Safety</span>
            </button>
          )}
        </div>

        {/* Emergency contact info */}
        <div className="pt-6 border-t border-white/10 text-xs text-white/50 font-mono tracking-wider">
          FOR URGENT ACTIVE DISPATCH CALL COMMAND DESK: <span className="text-[#C9A04A] font-bold">+1 (800) 492-7435</span>
        </div>
      </div>
    </div>
  );
};
