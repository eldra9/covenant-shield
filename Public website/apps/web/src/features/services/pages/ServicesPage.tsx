import React from 'react';
import { PageHeaderBand } from '../../../components/ui/PageHeaderBand.tsx';
import { Sheen } from '../../../motion/Sheen.tsx';
import { ClipReveal } from '../../../motion/ClipReveal.tsx';
import {
  ShieldCheck,
  CalendarCheck,
  UserCheck,
  Route,
  Video,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { ServiceType } from '../../../../../../packages/shared/src/types/index.ts';

export interface ServicesPageProps {
  onNavigate: (path: string, options?: { serviceType?: ServiceType }) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const imgStaticHq = '/src/assets/images/service_static_hq_1793354410567.jpg';
  const imgEventSec = '/src/assets/images/service_event_security_1793354410404.jpg';
  const imgPatrol = '/src/assets/images/service_patrol_perimeter_1793354411766.jpg';
  const imgCctv = '/src/assets/images/service_cctv_monitoring_1793354412143.jpg';

  const servicesList: {
    type: ServiceType;
    index: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    image?: string;
    placeholderCaption?: string;
    features: string[];
  }[] = [
    {
      type: 'STATIC_GUARDING',
      index: '01',
      icon: <ShieldCheck className="w-6 h-6 text-[#003C35]" />,
      title: 'Static Guarding',
      description:
        'Dedicated guards at your gate, lobby or perimeter, rostered around your hours. [DRAFT]',
      image: imgStaticHq,
      features: ['Gatehouse access validation', 'Visitor identity verification', 'Perimeter barrier inspection'],
    },
    {
      type: 'EVENT_SECURITY',
      index: '02',
      icon: <CalendarCheck className="w-6 h-6 text-[#003C35]" />,
      title: 'Event Security',
      description:
        'Crowd-aware coverage for launches, ceremonies and gatherings, planned with you in advance. [DRAFT]',
      image: imgEventSec,
      features: ['Tiered guest screening', 'Quiet ingress & egress control', 'Emergency evacuation readiness'],
    },
    {
      type: 'VIP_ESCORT',
      index: '03',
      icon: <UserCheck className="w-6 h-6 text-[#003C35]" />,
      title: 'VIP & Escort Services',
      description: 'Discreet escort and secure movement, planned route by route. [DRAFT]',
      placeholderCaption: 'Discreet Close Protection',
      features: ['Advance transit route reconnaissance', 'Low-profile executive accompaniment', 'Safe room & transit liaison'],
    },
    {
      type: 'PATROL_SERVICES',
      index: '04',
      icon: <Route className="w-6 h-6 text-[#003C35]" />,
      title: 'Patrol Services',
      description: 'Scheduled patrols of your premises, planned around your risk. [DRAFT]',
      image: imgPatrol,
      features: ['Randomized perimeter sweeps', 'Electronic checkpoint logging', 'Rapid incident escalation dispatch'],
    },
    {
      type: 'CCTV_MONITORING',
      index: '05',
      icon: <Video className="w-6 h-6 text-[#003C35]" />,
      title: 'CCTV Monitoring',
      description: 'Camera monitoring with a clear route to escalation. [DRAFT]',
      image: imgCctv,
      features: ['Continuous multi-feed monitoring', 'Barrier intrusion sensor response', 'Archive logging for investigations'],
    },
    {
      type: 'OTHER_SECURITY',
      index: '06',
      icon: <Plus className="w-6 h-6 text-[#003C35]" />,
      title: 'Custom Protective Deployments',
      description: 'Tell us what you need and we will shape a plan. [DRAFT]',
      placeholderCaption: 'Bespoke Tactical Plan',
      features: ['Operations Officer site survey', 'Specialized risk assessment matrix', 'Custom shift rotation scheduling'],
    },
  ];

  return (
    <div className="w-full bg-[#F4F6F4]">
      {/* Page Header Band */}
      <PageHeaderBand
        title="What we protect."
        badge="CERTIFIED SECURITY DISCIPLINES"
        subtitle="Standard operating procedures enforced by supervised rosters and transparent dispatch records. [DRAFT]"
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Services', path: '/services' },
        ]}
        onNavigate={onNavigate}
      />

      <section className="py-20 md:py-28 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesList.map((srv) => (
            <div
              key={srv.type}
              className="rounded-xl border border-[#D9E0DC] bg-white p-6 sm:p-7 flex flex-col justify-between group sheen-card relative hover:border-[#C9A04A]/50 transition-all duration-300 shadow-xs"
              data-cursor="Request"
            >
              <Sheen />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold tracking-widest text-[#A47F2E]">
                    {srv.index}
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-[#003C35]/5 flex items-center justify-center">
                    {srv.icon}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-display text-xl font-semibold text-[#003C35]">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-[#52625D] leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                {/* Duotone Visual */}
                <ClipReveal
                  src={srv.image}
                  alt={srv.title}
                  aspectRatio="aspect-[16/10]"
                  className="rounded-lg border border-[#D9E0DC]"
                  placeholderCaption={srv.placeholderCaption}
                />

                {/* Key feature bullet points */}
                <div className="pt-2 space-y-1 text-xs text-[#52625D]">
                  {srv.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#C9A04A]" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5 border-t border-[#D9E0DC] mt-4 flex items-center justify-between">
                <button
                  onClick={() => onNavigate('/request', { serviceType: srv.type })}
                  className="text-xs font-bold uppercase tracking-wider text-[#003C35] hover:text-[#A47F2E] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Request this service</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
