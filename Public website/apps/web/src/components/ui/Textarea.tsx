import React, { useState } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', hasError, disabled, rows = 4, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="relative flex flex-col w-full group">
        <textarea
          ref={ref}
          rows={rows}
          disabled={disabled}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          className={`w-full rounded-md bg-white text-[#24332F] text-[16px] py-2.5 px-3.5 transition-colors border placeholder:text-[#52625D]/60 focus:bg-white
            ${hasError
              ? 'border-[#A12B2B] focus:border-[#A12B2B] focus:ring-2 focus:ring-[#A12B2B]/20 focus:outline-none'
              : 'border-[#D9E0DC] hover:border-[#003C35]/60 focus:border-[#003C35] focus:outline-none'
            }
            ${disabled ? 'bg-[#F4F6F4] text-[#52625D] cursor-not-allowed border-[#D9E0DC]' : ''}
            ${className}
          `}
          {...props}
        />
        <div
          className="h-[2px] w-full bg-[var(--foil)] origin-left transition-transform duration-[320ms]"
          style={{
            transitionTimingFunction: 'var(--e-lux)',
            transform: isFocused && !hasError ? 'scaleX(1)' : 'scaleX(0)',
          }}
          aria-hidden="true"
        />
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
