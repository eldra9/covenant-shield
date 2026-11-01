import React, { useId } from 'react';
import { MagneticButton } from '../../../motion/MagneticButton.tsx';
import { RotateCw, Compass, ArrowLeft } from 'lucide-react';

export interface NotFoundPageProps {
  onNavigate: (path: string) => void;
  requestId?: string;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onNavigate,
  requestId,
}) => {
  const generatedId = useId().replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase() || '7A92F1C4';
  const displayId = requestId || `REQ-404-${generatedId}`;

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="w-full bg-[#092824] text-white min-h-[calc(100vh-80px)] flex items-center justify-center py-20 px-4 sm:px-6 relative overflow-hidden">
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(201, 160, 74, 0.25) 0%, transparent 60%)',
        }}
      />

      <div className="max-w-xl w-full mx-auto text-center relative z-10 space-y-8">
        {/* Sector badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#C9A04A]/30 bg-[#C9A04A]/10 text-[#C9A04A] text-xs font-mono uppercase tracking-widest">
          <Compass className="w-3.5 h-3.5" />
          <span>Error 404 · Sector Unmapped</span>
        </div>

        {/* 1.5px Foil Line-Art Illustration: Perimeter Coordinate Compass */}
        <div className="flex justify-center items-center my-6">
          <svg
            className="w-48 h-48 sm:w-56 sm:h-56 filter drop-shadow-[0_8px_24px_rgba(201,160,74,0.15)]"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="foil404Stroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A47F2E" />
                <stop offset="35%" stopColor="#C9A04A" />
                <stop offset="50%" stopColor="#E6CB8A" />
                <stop offset="65%" stopColor="#C9A04A" />
                <stop offset="100%" stopColor="#A47F2E" />
              </linearGradient>
            </defs>

            {/* Outer coordinate ring with 1.5px foil stroke */}
            <circle
              cx="100"
              cy="100"
              r="84"
              stroke="url(#foil404Stroke)"
              strokeWidth="1.5"
              strokeDasharray="4 8"
              opacity="0.6"
            />
            {/* Primary boundary ring */}
            <circle
              cx="100"
              cy="100"
              r="68"
              stroke="url(#foil404Stroke)"
              strokeWidth="1.5"
            />
            {/* Inner concentric ring */}
            <circle
              cx="100"
              cy="100"
              r="48"
              stroke="url(#foil404Stroke)"
              strokeWidth="1.5"
              opacity="0.8"
            />

            {/* Crosshair perimeter axes */}
            <line x1="100" y1="12" x2="100" y2="188" stroke="url(#foil404Stroke)" strokeWidth="1.5" strokeOpacity="0.4" />
            <line x1="12" y1="100" x2="188" y2="100" stroke="url(#foil404Stroke)" strokeWidth="1.5" strokeOpacity="0.4" />

            {/* Diagonal patrol quadrant marks */}
            <line x1="40" y1="40" x2="52" y2="52" stroke="url(#foil404Stroke)" strokeWidth="1.5" />
            <line x1="160" y1="40" x2="148" y2="52" stroke="url(#foil404Stroke)" strokeWidth="1.5" />
            <line x1="40" y1="160" x2="52" y2="148" stroke="url(#foil404Stroke)" strokeWidth="1.5" />
            <line x1="160" y1="160" x2="148" y2="148" stroke="url(#foil404Stroke)" strokeWidth="1.5" />

            {/* Central Broken Beacon / Diamond Pivot */}
            <polygon
              points="100,68 116,100 100,132 84,100"
              stroke="url(#foil404Stroke)"
              strokeWidth="1.5"
              strokeLinejoin="round"
              fill="rgba(201, 160, 74, 0.05)"
            />
            <circle cx="100" cy="100" r="4" fill="#C9A04A" />

            {/* Missing Route Gap Indicator */}
            <path
              d="M 68 85 L 80 85 M 120 85 L 132 85"
              stroke="url(#foil404Stroke)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="font-display text-4xl sm:text-5xl font-normal tracking-tight text-white">
            Off the route<span className="text-[#C9A04A]">.</span>
          </h1>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
            The patrol coordinate or designated dispatch file you requested does not exist on our active security manifest.
          </p>
        </div>

        {/* Monospace Request ID Chip */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-[#0D322D] border border-white/10 text-xs font-mono text-white/60">
          <span className="text-[#C9A04A] font-bold">DISPATCH ID:</span>
          <span className="text-white tracking-widest">{displayId}</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <MagneticButton
            variant="gold"
            onClick={() => onNavigate('/')}
            className="w-full sm:w-auto !px-7 !py-3.5 font-bold uppercase text-xs tracking-wider"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Perimeter</span>
            </span>
          </MagneticButton>

          <button
            onClick={handleRetry}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-mono uppercase tracking-wider text-white transition-colors flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C9A04A]"
          >
            <RotateCw className="w-3.5 h-3.5 text-[#C9A04A]" />
            <span>Retry Route</span>
          </button>
        </div>

        {/* Secondary Links */}
        <div className="pt-6 border-t border-white/10 flex flex-wrap justify-center gap-6 text-xs text-white/50 font-mono uppercase tracking-wider">
          <button
            onClick={() => onNavigate('/services')}
            className="hover:text-[#C9A04A] transition-colors cursor-pointer"
          >
            Security Services
          </button>
          <span>·</span>
          <button
            onClick={() => onNavigate('/track-request')}
            className="hover:text-[#C9A04A] transition-colors cursor-pointer"
          >
            Track Request
          </button>
          <span>·</span>
          <button
            onClick={() => onNavigate('/contact')}
            className="hover:text-[#C9A04A] transition-colors cursor-pointer"
          >
            Command Dispatch
          </button>
        </div>
      </div>
    </div>
  );
};
