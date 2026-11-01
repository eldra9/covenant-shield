import React, { useState } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', hasError, leftIcon, rightIcon, disabled, id, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="relative flex flex-col w-full group">
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 text-[#52625D] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            className={`w-full h-[44px] rounded-md bg-white text-[#24332F] text-[16px] px-3.5 transition-colors border placeholder:text-[#52625D]/60 focus:bg-white
              ${leftIcon ? 'pl-11' : 'pl-3.5'}
              ${rightIcon ? 'pr-11' : 'pr-3.5'}
              ${hasError
                ? 'border-[#A12B2B] focus:border-[#A12B2B] focus:ring-2 focus:ring-[#A12B2B]/20 focus:outline-none'
                : 'border-[#D9E0DC] hover:border-[#003C35]/60 focus:border-[#003C35] focus:outline-none'
              }
              ${disabled ? 'bg-[#F4F6F4] text-[#52625D] cursor-not-allowed border-[#D9E0DC]' : ''}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-[#52625D] flex items-center pointer-events-auto">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Foil underline draws left to right (scaleX 0 to 1, 320ms, --e-lux) on focus */}
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

Input.displayName = 'Input';
