import React from 'react';
import { useInView } from './useInView.ts';

interface ClipRevealProps {
  src?: string;
  alt: string;
  aspectRatio?: string;
  className?: string;
  placeholderCaption?: string;
}

export const ClipReveal: React.FC<ClipRevealProps> = ({
  src,
  alt,
  aspectRatio = 'aspect-[16/9]',
  className = '',
  placeholderCaption = 'Approved imagery pending',
}) => {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.2, triggerOnce: true });

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden bg-[#E6EFEC] ${aspectRatio} ${className}`}
      style={{
        clipPath: inView ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)',
        transition: 'clip-path 1.2s var(--e-silk)',
      }}
    >
      {src ? (
        <div className="relative w-full h-full duotone-container">
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            className="duotone-img transition-transform duration-[1800ms] will-change-transform"
            style={{
              transitionTimingFunction: 'var(--e-silk)',
              transform: inView ? 'scale(1)' : 'scale(1.15)',
            }}
          />
          {/* Duotone overlay with #003C35 multiply */}
          <div className="duotone-overlay" aria-hidden="true" />
        </div>
      ) : (
        /* Branded placeholder (emerald-50 panel, seal at 12%, caption "Approved imagery pending") */
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-[#E6EFEC]">
          <div className="opacity-15 mb-2">
            <svg width="48" height="48" viewBox="0 0 100 120" fill="none">
              <path
                d="M50 4 L92 20 V62 C92 90 50 114 50 114 C50 114 8 90 8 62 V20 L50 4 Z"
                stroke="#003C35"
                strokeWidth="6"
              />
            </svg>
          </div>
          <span className="text-xs uppercase tracking-widest text-[#003C35]/60 font-mono">
            {placeholderCaption}
          </span>
        </div>
      )}
    </div>
  );
};
