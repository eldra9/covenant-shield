import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none cursor-pointer';

    const sizeStyles = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5 font-semibold tracking-wide',
      md: 'text-sm px-5 py-2.5 gap-2 font-medium',
      lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold tracking-wide shadow-sm',
    };

    const variantStyles = {
      primary:
        'bg-[#003C35] hover:bg-[#0A554C] active:bg-[#002B26] text-white focus-visible:outline-[#C9A04A] border border-[#003C35] shadow-sm',
      gold:
        'bg-[#C9A04A] hover:bg-[#B38C3B] active:bg-[#9E7A31] text-[#092824] font-semibold focus-visible:outline-[#003C35] border border-[#B38C3B] shadow-sm',
      secondary:
        'bg-[#F4F6F4] hover:bg-[#E6EBE7] text-[#003C35] border border-[#CCD8D2] focus-visible:outline-[#003C35]',
      outline:
        'bg-transparent hover:bg-[#003C35]/5 text-[#003C35] border border-[#003C35] focus-visible:outline-[#003C35]',
      ghost:
        'bg-transparent hover:bg-black/5 text-[#24332F] focus-visible:outline-[#003C35]',
      danger:
        'bg-red-700 hover:bg-red-800 text-white focus-visible:outline-red-700',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
