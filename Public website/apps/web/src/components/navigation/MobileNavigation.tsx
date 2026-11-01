import React from 'react';
import { X, ShieldCheck, PhoneCall, ChevronRight, Search, FileText } from 'lucide-react';
import { BRAND } from '../../../../../packages/shared/src/constants/index.ts';
import { BrandLogo } from '../brand/BrandLogo.tsx';

export interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
  currentPath,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    onClose();
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Request Tracking', path: '/track-request' },
    { label: 'Case Tracking', path: '/track-case' },
    { label: 'Feedback & Complaints', path: '/feedback' },
    { label: 'Contact', path: '/contact' },
    { label: 'Login', path: '/login' },
    { label: 'Request a Service', path: '/request-service', highlight: true },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation"
      className="fixed inset-0 z-50 lg:hidden flex flex-col bg-[#002B26] text-white overflow-y-auto"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-[#0A554C]">
        <BrandLogo variant="light" size="sm" />
        <button
          onClick={onClose}
          aria-label="Close navigation menu"
          className="p-2 rounded-lg bg-[#003C35] text-white hover:bg-[#0A554C] transition-colors focus-visible:outline-[#C9A04A]"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Quick Action Banner */}
      <div className="bg-[#092824] px-5 py-3 border-b border-[#0A554C] flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#C9A04A]">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>24/7 National Operations Command</span>
        </div>
        <a
          href={`tel:${BRAND.phone.replace(/[^\d+]/g, '')}`}
          className="text-xs font-semibold text-white flex items-center gap-1.5 hover:text-[#C9A04A]"
        >
          <PhoneCall className="w-3.5 h-3.5 text-[#C9A04A]" />
          Call Now
        </a>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleLinkClick(item.path)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#C9A04A] text-[#092824] font-semibold'
                  : item.highlight
                  ? 'bg-[#003C35] text-[#C9A04A] border border-[#C9A04A]/40 hover:bg-[#0A554C]'
                  : 'text-gray-200 hover:bg-[#003C35] hover:text-white'
              }`}
            >
              <span>{item.label}</span>
              <ChevronRight
                className={`w-4 h-4 ${isActive ? 'text-[#092824]' : 'text-gray-400'}`}
              />
            </button>
          );
        })}
      </nav>

      {/* Footer info in menu */}
      <div className="p-5 border-t border-[#0A554C] bg-[#092824] text-xs text-gray-300 space-y-2">
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-[#C9A04A]" />
          <span>Track request reference anytime on the portal</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-[#C9A04A]" />
          <span>Official licensed security contractor</span>
        </div>
        <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-800">
          © {new Date().getFullYear()} Covenant Shield Security Services.
        </p>
      </div>
    </div>
  );
};
