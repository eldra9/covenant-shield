import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
  hasError?: boolean;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', hasError, options, placeholder, children, disabled, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="relative flex flex-col w-full group">
        <div className="relative flex items-center w-full">
          <select
            ref={ref}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            className={`w-full h-[44px] appearance-none rounded-md bg-white text-[#24332F] text-[16px] pl-3.5 pr-10 transition-colors border focus:bg-white cursor-pointer
              ${hasError
                ? 'border-[#A12B2B] focus:border-[#A12B2B] focus:ring-2 focus:ring-[#A12B2B]/20 focus:outline-none'
                : 'border-[#D9E0DC] hover:border-[#003C35]/60 focus:border-[#003C35] focus:outline-none'
              }
              ${disabled ? 'bg-[#F4F6F4] text-[#52625D] cursor-not-allowed border-[#D9E0DC]' : ''}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="text-[#52625D]">
                {placeholder}
              </option>
            )}
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-3.5 text-[#52625D] pointer-events-none flex items-center">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* Foil underline on focus */}
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

Select.displayName = 'Select';
