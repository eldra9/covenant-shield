import React from 'react';
import { PageHeaderBand } from '../../../components/ui/PageHeaderBand.tsx';
import { MagneticButton } from '../../../motion/MagneticButton.tsx';
import { Shield, Scale, Eye, CheckCircle2, ArrowRight } from 'lucide-react';

export interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full bg-[#F4F6F4]">
      {/* Page Header Band */}
      <PageHeaderBand
        title="Disciplined vigilance. Inviolate trust."
        badge="ABOUT COVENANT SHIELD"
        subtitle="A security provider structured around immutable intake records, supervised rosters, and transparent client oversight. [DRAFT]"
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'About', path: '/about' },
        ]}
        onNavigate={onNavigate}
      />

      {/* Main Philosophy & Doctrine */}
      <section className="py-20 md:py-28 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-mono font-semibold tracking-widest uppercase text-[#A47F2E]">
              FOUNDING DOCTRINE
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#003C35]">
              Security is not merely presence. It is a covenant of perpetual preparedness. [DRAFT]
            </h2>
            <p className="text-base text-[#52625D] leading-relaxed">
              Covenant Shield operates on a single governing premise: businesses, public institutions,
              and private families deserve complete visibility into their security deployments. Every
              post order is agreed in advance, every sentry is rostered with confirmed relief, and
              every incident follows an auditable chain of command. [DRAFT]
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <MagneticButton
                variant="gold"
                onClick={() => onNavigate('/request')}
                className="!px-6 !py-3 font-bold uppercase text-xs tracking-wider"
              >
                Request a Service
              </MagneticButton>
              <button
                onClick={() => onNavigate('/contact')}
                className="px-6 py-3 rounded border border-[#003C35] text-[#003C35] font-medium text-xs uppercase tracking-wider hover:bg-[#003C35] hover:text-white transition-colors cursor-pointer"
              >
                Inquire with Command
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-8 rounded-2xl border border-[#D9E0DC] space-y-6 shadow-xs">
            <h3 className="font-display text-xl font-semibold text-[#003C35]">
              Three Cornerstones of Duty [DRAFT]
            </h3>

            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-md bg-[#003C35]/5 flex items-center justify-center text-[#003C35] shrink-0">
                  <Shield className="w-5 h-5 text-[#003C35]" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#003C35]">Vigilance</h4>
                  <p className="text-xs text-[#52625D] leading-relaxed mt-0.5">
                    Continuous perimeter inspection and access control protocols designed around risk.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-md bg-[#003C35]/5 flex items-center justify-center text-[#003C35] shrink-0">
                  <Scale className="w-5 h-5 text-[#003C35]" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#003C35]">Accountability</h4>
                  <p className="text-xs text-[#52625D] leading-relaxed mt-0.5">
                    Independent QA incident handling with formal resolution commitments and client updates.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-md bg-[#003C35]/5 flex items-center justify-center text-[#003C35] shrink-0">
                  <Eye className="w-5 h-5 text-[#003C35]" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#003C35]">Clarity</h4>
                  <p className="text-xs text-[#52625D] leading-relaxed mt-0.5">
                    Zero verbal approximations. Every client receives an encrypted reference to follow intake.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Verification Standards */}
        <div className="rounded-2xl bg-[#003C35] text-white p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-mono font-semibold tracking-widest uppercase text-[#C9A04A]">
              OPERATIONAL GOVERNANCE
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-medium">
              Vetting, Training &amp; Chain of Responsibility [DRAFT]
            </h3>
            <p className="text-sm text-white/80 leading-relaxed">
              Every prospective operative undergoes multi-stage background authentication, statutory
              licensing confirmation, and site-specific SOP drills before arriving on post.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs text-white/80">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C9A04A] shrink-0" />
                <span>Statutory criminal & background clearance</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C9A04A] shrink-0" />
                <span>De-escalation & conflict mitigation protocols</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C9A04A] shrink-0" />
                <span>Verified supervisory round check-ins</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C9A04A] shrink-0" />
                <span>24/7 Command dispatch coordination</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
