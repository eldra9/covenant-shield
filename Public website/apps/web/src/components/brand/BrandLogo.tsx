import React from 'react';
import logo from '../../assets/images/logo.png';
interface BrandLogoProps {
  placement?: 'nav' | 'footer' | 'header';
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  placement = 'nav',
  variant,
  size,
  className = '',
  onClick,
}) => {
  // Clear space half height; nav 36px (32 mobile), footer 44px
  const iconHeightClass =
    placement === 'footer'
      ? 'h-[44px] w-[44px]'
      : 'h-[36px] sm:h-[40px] w-[36px] sm:w-[40px]';

  const textClass =
    placement === 'footer'
      ? 'text-lg tracking-wider'
      : 'text-base sm:text-lg tracking-wider';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none cursor-pointer group ${className}`}
    >
      {/* Official Emblem */}
      <div className={`relative shrink-0 ${iconHeightClass} flex items-center justify-center`}>
        <img
          src={logo}
          alt="Covenant Shield logo"
          className="h-full w-full object-contain drop-shadow-[0_0_10px_rgba(201,160,74,0.18)]"
        />
      </div>

      {/* Brand Typography (Fraunces Display Face) */}
      <div className="flex flex-col leading-none">
        <span className={`font-display font-bold text-white ${textClass}`}>
          COVENANT <span className="text-[#C9A04A]">SHIELD</span>
        </span>
        <span className="text-[9px] uppercase tracking-[0.25em] font-medium text-[#C9A04A]/90 mt-1">
          Security Services
        </span>
      </div>
    </div>
  );
};
