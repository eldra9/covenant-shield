import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  CalendarCheck,
  UserCheck,
  Route,
  Video,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  FileText,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { SplitReveal } from '../../../motion/SplitReveal.tsx';
import { GuillocheSeal } from '../../../motion/GuillocheSeal.tsx';
import { DustField } from '../../../motion/DustField.tsx';
import { ParallaxStack } from '../../../motion/ParallaxStack.tsx';
import { MagneticButton } from '../../../motion/MagneticButton.tsx';
import { ScrollScrub } from '../../../motion/ScrollScrub.tsx';
import { Marquee } from '../../../motion/Marquee.tsx';
import { ClipReveal } from '../../../motion/ClipReveal.tsx';
import { Sheen } from '../../../motion/Sheen.tsx';

interface HomePageProps {
  onNavigate: (path: string, options?: { serviceType?: string }) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const [activeChapter, setActiveChapter] = useState(1);
  const chapterSectionRef = useRef<HTMLDivElement | null>(null);

  // Generated duotone photography paths
  const imgStaticHq = '/src/assets/images/service_static_hq_1793354410567.jpg';
  const imgEventSec = '/src/assets/images/service_event_security_1793354410404.jpg';
  const imgPatrol = '/src/assets/images/service_patrol_perimeter_1793354411766.jpg';
  const imgCctv = '/src/assets/images/service_cctv_monitoring_1793354412143.jpg';

  const marqueeItems = [
    t('services.s1Title'),
    t('services.s2Title'),
    t('services.s3Title'),
    t('services.s4Title'),
    t('services.s5Title'),
    t('services.s6Title'),
  ];

  // Chapter tracking via IntersectionObserver
  useEffect(() => {
    const handleScroll = () => {
      const p1 = document.getElementById('chapter-panel-1');
      const p2 = document.getElementById('chapter-panel-2');
      const p3 = document.getElementById('chapter-panel-3');

      if (!p1 || !p2 || !p3) return;

      const vMid = window.innerHeight * 0.45;
      const r1 = p1.getBoundingClientRect();
      const r2 = p2.getBoundingClientRect();
      const r3 = p3.getBoundingClientRect();

      if (r3.top <= vMid) {
        setActiveChapter(3);
      } else if (r2.top <= vMid) {
        setActiveChapter(2);
      } else {
        setActiveChapter(1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative w-full bg-[#F4F6F4]">
      {/* ========================================================
          1. HERO SECTION (100dvh, forest-to-emerald 135deg)
      ======================================================== */}
      <section
        className="relative min-h-[100vh] min-h-[100dvh] flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#092824] via-[#0D322D] to-[#003C35] text-white pt-24 sm:pt-28 pb-12"
        aria-label="Covenant Shield Hero"
      >
        {/* Subtle Guilloche background pattern at 5% */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none select-none"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, #C9A04A 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
          aria-hidden="true"
        />

        {/* DustField behind visual */}
        <DustField isVisible={true} />

        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Copy Column (Columns 1-7) */}
          <div className="lg:col-span-7 space-y-6 lg:pr-6">
            {/* H1 Headline */}
            <h1 className="font-display text-[clamp(2.5rem,7vw,5.5rem)] font-[350] leading-[1.0] tracking-[-0.025em] text-white">
              <span className="block">Quiet vigilance.</span>
              <span className="block mt-1">
                Every shift,{' '}
                <span className="italic font-display font-normal text-foil shimmer-text pr-1">
                  kept.
                </span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-white/80 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
              Professionally managed security for businesses, institutions and events, with one clear
              record of every request, every post and every shift. [DRAFT]
            </p>

            {/* CTAs: Accent (Magnetic) and Outlined */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <MagneticButton
                variant="gold"
                onClick={() => onNavigate('/request')}
                data-cursor="Request"
                className="!px-7 !py-3.5 font-bold uppercase tracking-wider text-xs shadow-lg"
              >
                Request a Service
              </MagneticButton>

              <button
                onClick={() => onNavigate('/track')}
                data-cursor="View"
                className="px-6 py-3.5 rounded border border-white/40 text-white font-medium text-xs uppercase tracking-wider hover:border-[#C9A04A] hover:text-[#C9A04A] bg-transparent transition-colors cursor-pointer"
              >
                Track a Request
              </button>
            </div>
          </div>

          {/* Visual Column (Columns 8-12, 560px tall) */}
          <div className="lg:col-span-5 relative w-full h-[480px] lg:h-[560px] flex items-center justify-center">
            <ParallaxStack isVisible={true} />
          </div>
        </div>

        {/* Scroll Cue: 1px gold line, 48px, fills downward every 2.4s */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-2 pt-6 pb-2 text-white/50 text-[11px] font-mono uppercase tracking-widest">
          <span>Scroll to inspect</span>
          <div className="w-[1px] h-[48px] bg-white/20 relative overflow-hidden">
            <style>{`
              @keyframes scrollCueFill {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(100%); }
              }
            `}</style>
            <div className="w-full h-full bg-[#C9A04A] animate-[scrollCueFill_2.4s_cubic-bezier(0.65,0,0.35,1)_infinite]" />
          </div>
        </div>

        {/* Bottom Edge: Watch Line + Shield-Notch Edge */}
        <div className="relative w-full">
          <div className="watch-line" />
        </div>
      </section>

      {/* Marquee Band (Mist) */}
      <Marquee items={marqueeItems} />

      {/* ========================================================
          2. SERVICES BENTO GRID (White, H2 "What we protect.")
      ======================================================== */}
      <section
        id="services-section"
        className="py-20 md:py-32 bg-white relative overflow-hidden"
        aria-labelledby="services-heading"
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="max-w-2xl space-y-3">
            <div className="text-xs font-mono font-semibold tracking-widest uppercase text-[#A47F2E]">
              OPERATIONAL ROSTER
            </div>
            <SplitReveal
              text="What we protect."
              as="h2"
              className="text-3xl md:text-5xl font-display font-medium text-[#003C35] tracking-tight"
            />
            <p className="text-[#52625D] text-base leading-relaxed">
              Every deployment operates under structured post orders, direct supervisory rounds,
              and immutable electronic intake verification. [DRAFT]
            </p>
          </div>

          {/* 12-Column Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Tile 1: Static Guarding (Col 6x2) */}
            <div
              className="md:col-span-12 lg:col-span-6 rounded-xl border border-[#D9E0DC] bg-[#F4F6F4]/50 p-6 sm:p-8 flex flex-col justify-between group sheen-card relative hover:border-[#C9A04A]/50 transition-all duration-300"
              data-cursor="Request"
            >
              <Sheen />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold tracking-widest text-[#A47F2E]">
                    01
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-[#003C35]/5 flex items-center justify-center text-[#003C35]">
                    <ShieldCheck className="w-6 h-6 text-[#003C35]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-2xl font-semibold text-[#003C35]">
                    Static Guarding
                  </h3>
                  <p className="text-sm text-[#52625D] leading-relaxed">
                    Dedicated guards at your gate, lobby or perimeter, rostered around your hours.
                    [DRAFT]
                  </p>
                </div>

                {/* Duotone Image with ClipReveal */}
                <ClipReveal
                  src={imgStaticHq}
                  alt="Corporate headquarters perimeter guarding"
                  aspectRatio="aspect-[16/9]"
                  className="rounded-lg border border-[#D9E0DC]"
                />
              </div>

              <div className="pt-6 border-t border-[#D9E0DC] mt-4 flex items-center justify-between">
                <button
                  onClick={() => onNavigate('/request', { serviceType: 'STATIC_GUARDING' })}
                  className="text-xs font-bold uppercase tracking-wider text-[#003C35] hover:text-[#A47F2E] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Request this service</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono text-[#52625D]">Access Control · Gate</span>
              </div>
            </div>

            {/* Tile 2: Event Security (Col 3) */}
            <div
              className="md:col-span-6 lg:col-span-3 rounded-xl border border-[#D9E0DC] bg-white p-6 flex flex-col justify-between group sheen-card relative hover:border-[#C9A04A]/50 transition-all duration-300"
              data-cursor="Request"
            >
              <Sheen />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold tracking-widest text-[#A47F2E]">
                    02
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-[#003C35]/5 flex items-center justify-center text-[#003C35]">
                    <CalendarCheck className="w-6 h-6 text-[#003C35]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-xl font-semibold text-[#003C35]">
                    Event Security
                  </h3>
                  <p className="text-xs text-[#52625D] leading-relaxed">
                    Crowd-aware coverage for launches, ceremonies and gatherings, planned with you in
                    advance. [DRAFT]
                  </p>
                </div>

                <ClipReveal
                  src={imgEventSec}
                  alt="Exclusive corporate event reception security"
                  aspectRatio="aspect-[4/3]"
                  className="rounded-lg border border-[#D9E0DC]"
                />
              </div>

              <div className="pt-4 border-t border-[#D9E0DC] mt-4">
                <button
                  onClick={() => onNavigate('/request', { serviceType: 'EVENT_SECURITY' })}
                  className="text-xs font-bold uppercase tracking-wider text-[#003C35] hover:text-[#A47F2E] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Request this service</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tile 3: VIP and Escort Services (Col 3) */}
            <div
              className="md:col-span-6 lg:col-span-3 rounded-xl border border-[#D9E0DC] bg-white p-6 flex flex-col justify-between group sheen-card relative hover:border-[#C9A04A]/50 transition-all duration-300"
              data-cursor="Request"
            >
              <Sheen />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold tracking-widest text-[#A47F2E]">
                    03
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-[#003C35]/5 flex items-center justify-center text-[#003C35]">
                    <UserCheck className="w-6 h-6 text-[#003C35]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-xl font-semibold text-[#003C35]">
                    VIP & Escort
                  </h3>
                  <p className="text-xs text-[#52625D] leading-relaxed">
                    Discreet escort and secure movement, planned route by route. [DRAFT]
                  </p>
                </div>

                {/* Branded placeholder for VIP discreet escort */}
                <ClipReveal
                  alt="VIP close escort protection"
                  aspectRatio="aspect-[4/3]"
                  className="rounded-lg border border-[#D9E0DC]"
                  placeholderCaption="Discreet Close Protection"
                />
              </div>

              <div className="pt-4 border-t border-[#D9E0DC] mt-4">
                <button
                  onClick={() => onNavigate('/request', { serviceType: 'VIP_ESCORT' })}
                  className="text-xs font-bold uppercase tracking-wider text-[#003C35] hover:text-[#A47F2E] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Request this service</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tile 4: Patrol Services (Col 4) */}
            <div
              className="md:col-span-6 lg:col-span-4 rounded-xl border border-[#D9E0DC] bg-white p-6 flex flex-col justify-between group sheen-card relative hover:border-[#C9A04A]/50 transition-all duration-300"
              data-cursor="Request"
            >
              <Sheen />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold tracking-widest text-[#A47F2E]">
                    04
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-[#003C35]/5 flex items-center justify-center text-[#003C35]">
                    <Route className="w-6 h-6 text-[#003C35]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-xl font-semibold text-[#003C35]">
                    Patrol Services
                  </h3>
                  <p className="text-xs text-[#52625D] leading-relaxed">
                    Scheduled patrols of your premises, planned around your risk. [DRAFT]
                  </p>
                </div>

                <ClipReveal
                  src={imgPatrol}
                  alt="Evening premises security perimeter patrol"
                  aspectRatio="aspect-[16/10]"
                  className="rounded-lg border border-[#D9E0DC]"
                />
              </div>

              <div className="pt-4 border-t border-[#D9E0DC] mt-4">
                <button
                  onClick={() => onNavigate('/request', { serviceType: 'PATROL_SERVICES' })}
                  className="text-xs font-bold uppercase tracking-wider text-[#003C35] hover:text-[#A47F2E] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Request this service</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tile 5: CCTV Monitoring (Col 4) */}
            <div
              className="md:col-span-6 lg:col-span-4 rounded-xl border border-[#D9E0DC] bg-white p-6 flex flex-col justify-between group sheen-card relative hover:border-[#C9A04A]/50 transition-all duration-300"
              data-cursor="Request"
            >
              <Sheen />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold tracking-widest text-[#A47F2E]">
                    05
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-[#003C35]/5 flex items-center justify-center text-[#003C35]">
                    <Video className="w-6 h-6 text-[#003C35]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-xl font-semibold text-[#003C35]">
                    CCTV Monitoring
                  </h3>
                  <p className="text-xs text-[#52625D] leading-relaxed">
                    Camera monitoring with a clear route to escalation. [DRAFT]
                  </p>
                </div>

                <ClipReveal
                  src={imgCctv}
                  alt="24/7 Command dispatch CCTV surveillance desk"
                  aspectRatio="aspect-[16/10]"
                  className="rounded-lg border border-[#D9E0DC]"
                />
              </div>

              <div className="pt-4 border-t border-[#D9E0DC] mt-4">
                <button
                  onClick={() => onNavigate('/request', { serviceType: 'CCTV_MONITORING' })}
                  className="text-xs font-bold uppercase tracking-wider text-[#003C35] hover:text-[#A47F2E] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Request this service</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tile 6: Other Special Deployments (Col 4, dashed) */}
            <div
              className="md:col-span-12 lg:col-span-4 rounded-xl border-2 border-dashed border-[#CCD8D2] bg-[#F4F6F4]/30 p-6 flex flex-col justify-between group relative hover:border-[#C9A04A] transition-all duration-300"
              data-cursor="Request"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold tracking-widest text-[#A47F2E]">
                    06
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-[#003C35]/5 flex items-center justify-center text-[#003C35]">
                    <Plus className="w-6 h-6 text-[#003C35]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-xl font-semibold text-[#003C35]">
                    Custom Protection
                  </h3>
                  <p className="text-sm text-[#52625D] leading-relaxed">
                    Tell us what you need and we will shape a plan. [DRAFT]
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-white border border-[#D9E0DC] text-xs text-[#52625D] space-y-1">
                  <div className="font-semibold text-[#003C35]">Tailored Scope:</div>
                  <div>Direct coordination with Operations Commander for non-standard tactical requirements.</div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#D9E0DC] mt-4">
                <button
                  onClick={() => onNavigate('/request', { serviceType: 'OTHER_SECURITY' })}
                  className="text-xs font-bold uppercase tracking-wider text-[#003C35] hover:text-[#A47F2E] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Request this service</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. CHAPTERS SECTION (Forest, Sticky Numeral 01-03)
      ======================================================== */}
      <section
        ref={chapterSectionRef}
        className="py-24 md:py-32 bg-[#092824] text-white relative overflow-hidden"
        aria-labelledby="chapters-heading"
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative">
            {/* Left Sticky Numeral Column (Cols 1-4) */}
            <div className="md:col-span-5 lg:col-span-4">
              <div className="md:sticky md:top-36 space-y-6">
                <div className="text-xs font-mono font-semibold tracking-widest uppercase text-[#C9A04A]">
                  HOW WE ENGAGE
                </div>

                {/* Animated Rolling Numeral clamp(8rem, 14vw, 12rem) */}
                <div className="relative h-32 md:h-44 overflow-hidden select-none">
                  <div
                    className="font-display font-[300] text-[clamp(6rem,12vw,11rem)] text-[#C9A04A] opacity-90 leading-none transition-transform duration-700 ease-out will-change-transform"
                    style={{
                      transform: `translateY(-${(activeChapter - 1) * 33.333}%)`,
                    }}
                  >
                    <div className="h-32 md:h-44 flex items-center">01</div>
                    <div className="h-32 md:h-44 flex items-center">02</div>
                    <div className="h-32 md:h-44 flex items-center">03</div>
                  </div>
                </div>

                <p className="text-sm text-white/70 max-w-xs leading-relaxed hidden md:block">
                  A three-step verification framework ensuring no ambiguity in responsibilities,
                  clear roster records, and immediate accountability.
                </p>

                {/* Vertical 1px gold line that tracks scroll */}
                <div className="w-[1px] h-32 bg-white/10 relative overflow-hidden hidden md:block">
                  <div
                    className="w-full bg-[#C9A04A] transition-all duration-300"
                    style={{ height: `${(activeChapter / 3) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right Scrolling Panels (Cols 5-12, three ~80vh panels) */}
            <div className="md:col-span-7 lg:col-span-8 space-y-24 md:space-y-40">
              {/* Panel 1 */}
              <div
                id="chapter-panel-1"
                className="min-h-[50vh] md:min-h-[70vh] flex flex-col justify-center rounded-2xl bg-[#0D322D] p-8 md:p-12 border border-[#C9A04A]/25 relative"
                style={{
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.25)',
                }}
              >
                <div className="text-xs font-mono text-[#C9A04A] uppercase tracking-widest mb-3">
                  Step 01 · Immediate Intake
                </div>
                <h3 className="font-display text-3xl md:text-4xl font-medium text-white mb-4">
                  Send a request
                </h3>
                <p className="text-white/80 text-base md:text-lg leading-relaxed mb-6">
                  Tell us about the site, the shifts and the start date. You receive a reference
                  straight away. [DRAFT]
                </p>
                <div className="p-4 rounded-lg bg-[#092824] border border-white/10 flex items-center gap-3 text-xs text-white/70">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A04A] shrink-0" />
                  <span>Immediate reference token issued upon submission with no phone tag.</span>
                </div>
              </div>

              {/* Panel 2 */}
              <div
                id="chapter-panel-2"
                className="min-h-[50vh] md:min-h-[70vh] flex flex-col justify-center rounded-2xl bg-[#0D322D] p-8 md:p-12 border border-[#C9A04A]/25 relative"
                style={{
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.25)',
                }}
              >
                <div className="text-xs font-mono text-[#C9A04A] uppercase tracking-widest mb-3">
                  Step 02 · Risk Survey & Scope
                </div>
                <h3 className="font-display text-3xl md:text-4xl font-medium text-white mb-4">
                  We assess and quote
                </h3>
                <p className="text-white/80 text-base md:text-lg leading-relaxed mb-6">
                  We review your request, visit the site where needed and send a written quotation.
                  [DRAFT]
                </p>
                <div className="p-4 rounded-lg bg-[#092824] border border-white/10 flex items-center gap-3 text-xs text-white/70">
                  <Clock className="w-4 h-4 text-[#C9A04A] shrink-0" />
                  <span>Guaranteed operations officer initial evaluation SLA within 4 hours.</span>
                </div>
              </div>

              {/* Panel 3 */}
              <div
                id="chapter-panel-3"
                className="min-h-[50vh] md:min-h-[70vh] flex flex-col justify-center rounded-2xl bg-[#0D322D] p-8 md:p-12 border border-[#C9A04A]/25 relative"
                style={{
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.25)',
                }}
              >
                <div className="text-xs font-mono text-[#C9A04A] uppercase tracking-widest mb-3">
                  Step 03 · Operational Post Deployment
                </div>
                <h3 className="font-display text-3xl md:text-4xl font-medium text-white mb-4">
                  Guards go on post
                </h3>
                <p className="text-white/80 text-base md:text-lg leading-relaxed mb-6">
                  Your guards are rostered and report for duty, and coverage is recorded shift by
                  shift. [DRAFT]
                </p>
                <div className="p-4 rounded-lg bg-[#092824] border border-white/10 flex items-center gap-3 text-xs text-white/70">
                  <ShieldCheck className="w-4 h-4 text-[#C9A04A] shrink-0" />
                  <span>Real-time shift presence verified by electronic roving supervisors.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. PROMISE SECTION (Mist, ScrollScrub text & 4 feature cards)
      ======================================================== */}
      <section
        className="py-24 md:py-32 bg-[#F4F6F4] text-[#24332F] relative overflow-hidden"
        aria-labelledby="promise-heading"
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* ScrollScrub Statement */}
          <div className="max-w-3xl space-y-4">
            <div className="text-xs font-mono font-semibold tracking-widest uppercase text-[#A47F2E]">
              THE COVENANT SHIELD COMMITMENT
            </div>
            <ScrollScrub
              text="A covenant is a promise kept. We run every post that way."
              className="text-3xl md:text-5xl font-medium text-[#003C35]"
            />
          </div>

          {/* Four Real Product Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-xl border border-[#D9E0DC] space-y-3 shadow-xs">
              <div className="w-9 h-9 rounded-md bg-[#003C35]/5 flex items-center justify-center text-[#003C35]">
                <FileText className="w-5 h-5 text-[#003C35]" />
              </div>
              <h3 className="font-display text-lg font-semibold text-[#003C35]">
                Every request gets a reference.
              </h3>
              <p className="text-xs text-[#52625D] leading-relaxed">
                No lost emails or verbal handoffs. Every inquiry receives a collision-safe SR identifier.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-xl border border-[#D9E0DC] space-y-3 shadow-xs">
              <div className="w-9 h-9 rounded-md bg-[#003C35]/5 flex items-center justify-center text-[#003C35]">
                <Clock className="w-5 h-5 text-[#003C35]" />
              </div>
              <h3 className="font-display text-lg font-semibold text-[#003C35]">
                Progress you can follow.
              </h3>
              <p className="text-xs text-[#52625D] leading-relaxed">
                Query approved dispatch milestones and surveyor notes in real-time with zero phone queues.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-xl border border-[#D9E0DC] space-y-3 shadow-xs">
              <div className="w-9 h-9 rounded-md bg-[#003C35]/5 flex items-center justify-center text-[#003C35]">
                <AlertTriangle className="w-5 h-5 text-[#003C35]" />
              </div>
              <h3 className="font-display text-lg font-semibold text-[#003C35]">
                Complaints with a deadline.
              </h3>
              <p className="text-xs text-[#52625D] leading-relaxed">
                Every grievance logs directly into our QA ledger with strict investigation review deadlines.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-6 rounded-xl border border-[#D9E0DC] space-y-3 shadow-xs">
              <div className="w-9 h-9 rounded-md bg-[#003C35]/5 flex items-center justify-center text-[#003C35]">
                <Eye className="w-5 h-5 text-[#003C35]" />
              </div>
              <h3 className="font-display text-lg font-semibold text-[#003C35]">
                Coverage you can see.
              </h3>
              <p className="text-xs text-[#52625D] leading-relaxed">
                Clear post orders and electronic attendance logs so your facilities never experience an unannounced gap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. FINAL CTA SECTION (Emerald, rotating 900px seal watermark)
      ======================================================== */}
      <section
        className="py-24 md:py-36 bg-[#003C35] text-white relative overflow-hidden"
        aria-labelledby="cta-heading"
      >
        {/* 900px Seal Watermark at 8% rotating one turn per 160s (full tier) */}
        <div
          className="absolute -top-40 -right-40 opacity-[0.08] pointer-events-none select-none animate-watermark"
          aria-hidden="true"
        >
          <GuillocheSeal size={900} variant="gold" strokeColor="#C9A04A" />
        </div>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-widest uppercase text-[#C9A04A]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A04A]" />
            <span>DISPATCH COMMAND ACTIVE</span>
          </div>

          <h2
            id="cta-heading"
            className="font-display text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-white max-w-2xl mx-auto"
          >
            Put someone reliable on watch. [DRAFT]
          </h2>

          <p className="text-white/80 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
            From single-shift executive escorts to 24-hour perimeter defensive sentries, request an
            official quotation online.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
            <MagneticButton
              variant="gold"
              onClick={() => onNavigate('/request')}
              className="!px-8 !py-4 font-bold uppercase tracking-wider text-sm shadow-xl"
            >
              Request a Service
            </MagneticButton>

            <a
              href="tel:+18005557443"
              className="px-6 py-4 rounded border border-white/30 text-white font-mono text-sm hover:border-[#C9A04A] hover:text-[#C9A04A] transition-colors"
            >
              +1 (800) 555-SHIELD
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
