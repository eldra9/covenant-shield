import React from 'react';
import { useTranslation } from 'react-i18next';
import { BrandLogo } from '../brand/BrandLogo.tsx';
import { Shield, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

interface PublicFooterProps {
  onNavigate: (path: string) => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  // Contact details configurable from settings/constants
  const contactInfo = {
    phone: '+1 (800) 555-SHIELD',
    dispatchEmail: 'dispatch@covenantshield.com',
    hqAddress: '100 Citadel Way, Suite 800, Financial District',
  };

  return (
    <footer className="relative bg-[#003C35] text-white pt-16 pb-12 overflow-hidden selection:bg-[#C9A04A] selection:text-[#003C35]">
      {/* 1. Watch Line above footer */}
      <div className="absolute top-0 left-0 right-0">
        <div className="watch-line" />
      </div>

      {/* 2. Foil Hairline directly below Watch Line */}
      <div className="absolute top-[1px] left-0 right-0 h-[1px] bg-[var(--foil)] opacity-50" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-white/10">
          {/* Brand Info & 44px Footer Logo */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo placement="footer" onClick={() => onNavigate('/')} />
            <p className="text-sm text-white/70 max-w-sm leading-relaxed">
              Quiet vigilance and disciplined protection for business perimeters, executive personnel, and high-stakes operations. Every shift, kept.
            </p>
            <div className="pt-2 flex flex-col gap-2 text-xs text-white/60">
              <span className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C9A04A]" />
                <span>{contactInfo.phone}</span>
              </span>
              <span className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C9A04A]" />
                <span>{contactInfo.dispatchEmail}</span>
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C9A04A]" />
                <span>{contactInfo.hqAddress}</span>
              </span>
            </div>
          </div>

          {/* Company Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#C9A04A] font-semibold">
              {t('footer.company')}
            </h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-white transition-colors"
                >
                  About Our Standards
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/services')}
                  className="hover:text-white transition-colors"
                >
                  Protective Roster
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="hover:text-white transition-colors"
                >
                  Command Headquarters
                </button>
              </li>
            </ul>
          </div>

          {/* Services Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#C9A04A] font-semibold">
              {t('footer.services')}
            </h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <button
                  onClick={() => onNavigate('/services')}
                  className="hover:text-white transition-colors"
                >
                  Static Guarding
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/services')}
                  className="hover:text-white transition-colors"
                >
                  Event Security
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/services')}
                  className="hover:text-white transition-colors"
                >
                  VIP & Escort Protection
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/services')}
                  className="hover:text-white transition-colors"
                >
                  Patrol Services & CCTV
                </button>
              </li>
            </ul>
          </div>

          {/* Support & Legal Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#C9A04A] font-semibold">
              {t('footer.support')}
            </h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <button
                  onClick={() => onNavigate('/track')}
                  className="hover:text-white transition-colors"
                >
                  Track Service Request
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/track-case')}
                  className="hover:text-white transition-colors"
                >
                  Track Case / Feedback
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/feedback')}
                  className="hover:text-white transition-colors"
                >
                  Feedback & Complaints
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/login')}
                  className="hover:text-white transition-colors"
                >
                  Secure Staff & Client Login
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <p>© {currentYear} Covenant Shield Security Services Inc. {t('footer.rights')}</p>
          <div className="flex items-center gap-6">
            <span>WCAG 2.1 AA Compliant</span>
            <span>·</span>
            <span>256-bit Encrypted Intake</span>
          </div>
        </div>
      </div>

      {/* 3. Decorative "Covenant Shield" wordmark in Fraunces at 14vw, 5% opacity, aria-hidden (not the logo) */}
      <div
        className="pointer-events-none select-none absolute bottom-0 left-1/2 -translate-x-1/2 text-[14vw] font-display font-black leading-none text-white opacity-[0.05] whitespace-nowrap overflow-hidden"
        aria-hidden="true"
      >
        COVENANT SHIELD
      </div>
    </footer>
  );
};
