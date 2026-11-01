import { GuillocheSeal } from '../../motion/GuillocheSeal.tsx';
import { SplitReveal } from '../../motion/SplitReveal.tsx';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderBandProps {
  title: string;
  subtitle?: string;
  badge?: string;
  breadcrumbs: BreadcrumbItem[];
  onNavigate: (path: string) => void;
}

export const PageHeaderBand = ({
  title,
  subtitle,
  badge: _badge,
  breadcrumbs: _breadcrumbs,
  onNavigate: _onNavigate,
}: PageHeaderBandProps) => {
  return (
    <div className="relative bg-[radial-gradient(circle_at_top_right,_rgba(201,160,74,0.18),_transparent_32%),linear-gradient(135deg,_#003C35_0%,_#0D322D_36%,_#092824_100%)] border-b border-[#C9A04A]/30 pt-28 pb-12 sm:pb-16 overflow-hidden text-white">
      {/* 8% Seal Watermark in Corner */}
      <div
        className="absolute -top-16 -right-16 opacity-[0.12] pointer-events-none select-none"
        aria-hidden="true"
      >
        <GuillocheSeal size={320} variant="emerald" />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
        <SplitReveal
          text={title}
          as="h1"
          className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-white tracking-tight"
        />

        {subtitle && (
          <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Subtle Foil Hairline at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[var(--foil)] opacity-40" />
    </div>
  );
};
