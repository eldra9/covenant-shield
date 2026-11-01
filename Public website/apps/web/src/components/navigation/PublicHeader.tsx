import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BrandLogo } from '../brand/BrandLogo.tsx';
import { MagneticButton } from '../../motion/MagneticButton.tsx';
import { Menu, X, ArrowRight, Shield } from 'lucide-react';

interface PublicHeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const publicNavLinks = [
  { id: 'home', path: '/', translationKey: 'home' },
  { id: 'about', path: '/about', translationKey: 'about' },
  { id: 'services', path: '/services', translationKey: 'services' },
  { id: 'contact', path: '/contact', translationKey: 'contact' },
  { id: 'track-request', path: '/track-request', translationKey: 'trackRequest' },
  { id: 'feedback', path: '/feedback', translationKey: 'feedbackComplaints' },
] as const;

export const PublicHeader: React.FC<PublicHeaderProps> = ({ currentPath, onNavigate }) => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navContainerRef = useRef<HTMLDivElement | null>(null);

  // Nav height: 72px (60 mobile); Transparent over hero; after 24px scroll becomes emerald with foil hairline & shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Handle escape to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const navLinks = publicNavLinks.map((link) => ({
    ...link,
    label: t(`nav.${link.translationKey}`),
  }));

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setIsMobileMenuOpen(false);
  };

  const isCurrentActive = (path: string) => {
    const normalizedCurrentPath = currentPath || '/';

    if (path === '/') {
      return normalizedCurrentPath === '/';
    }

    if (path === '/track-request') {
      return normalizedCurrentPath === '/track-request' || normalizedCurrentPath === '/track';
    }

    if (path === '/feedback') {
      return normalizedCurrentPath === '/feedback' || normalizedCurrentPath === '/complaints';
    }

    return normalizedCurrentPath === path;
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
          isScrolled
            ? 'h-[60px] lg:h-[72px] bg-[#003C35] shadow-lg shadow-black/20 border-b border-[#C9A04A]/25'
            : 'h-[60px] lg:h-[72px] bg-transparent'
        }`}
      >
        <div
          ref={navContainerRef}
          className="max-w-[1280px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4"
        >
          {/* Logo Left */}
          <div className="flex items-center shrink-0">
            <BrandLogo placement="nav" onClick={() => handleNavClick('/')} />
          </div>

          {/* Desktop Nav Links (Hidden below 1024px) */}
          <nav
            className="hidden lg:flex items-center gap-4 xl:gap-6 relative shrink-0"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => {
              const active = isCurrentActive(link.path);
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.path)}
                  className={`relative py-1 text-xs xl:text-sm font-medium transition-colors cursor-pointer select-none whitespace-nowrap ${
                    active ? 'text-white font-semibold' : 'text-white/85 hover:text-white'
                  }`}
                >
                  {link.label}
                  {/* Active 2px gold underline at 8px offset */}
                  {active && (
                    <span
                      className="absolute bottom-[-8px] left-0 right-0 h-[2px] bg-[#C9A04A] transition-all duration-300"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Zone: Login (Ghost) + Request a Service (Accent) */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => handleNavClick('/login')}
              className="text-sm font-medium text-white/85 hover:text-white px-3 py-2 rounded transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {t('nav.login')}
            </button>

            <MagneticButton
              variant="gold"
              onClick={() => handleNavClick('/request')}
              className="!py-2.5 !px-5 text-xs font-bold uppercase tracking-wider whitespace-nowrap shrink-0"
            >
              {t('nav.requestService')}
            </MagneticButton>
          </div>

          {/* Mobile Burger Trigger (< 1024px) */}
          <div className="lg:hidden flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white hover:text-[#C9A04A] transition-colors cursor-pointer"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Hairline beneath nav when scrolled */}
        {isScrolled && <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[var(--foil)] opacity-40" />}
      </header>

      {/* Mobile Drawer (Below 1024px) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#092824] pt-[60px] pb-8 px-6 flex flex-col justify-between overflow-y-auto lg:hidden animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          <div className="space-y-1 divide-y divide-white/10 mt-4">
            {navLinks.map((link, idx) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.path)}
                className="w-full h-[48px] flex items-center justify-between text-left text-base font-medium text-white/90 hover:text-[#C9A04A] transition-colors"
                style={{
                  animation: `fadeIn 300ms var(--e-silk) forwards ${idx * 60}ms`,
                }}
              >
                <span>{link.label}</span>
                <ArrowRight className="w-4 h-4 opacity-40" />
              </button>
            ))}

            <button
              onClick={() => handleNavClick('/login')}
              className="w-full h-[48px] flex items-center justify-between text-left text-base font-medium text-white/90 hover:text-[#C9A04A] transition-colors"
            >
              <span>{t('nav.login')}</span>
              <Shield className="w-4 h-4 opacity-40" />
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
            <button
              onClick={() => handleNavClick('/request')}
              className="w-full py-3.5 rounded bg-[#C9A04A] text-[#003C35] font-bold text-center uppercase text-xs tracking-wider shadow-md hover:bg-[#B38C3B] transition-colors"
            >
              {t('nav.requestService')}
            </button>

            <p className="text-[11px] text-white/50 text-center font-mono">
              Command Dispatch Desk · 24/7 Operations Watch
            </p>
          </div>
        </div>
      )}
    </>
  );
};
