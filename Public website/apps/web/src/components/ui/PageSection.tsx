import React from 'react';
import { Container } from './Container.tsx';

export interface PageSectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'lightGrey' | 'darkForest' | 'emerald' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  className?: string;
}

export const PageSection: React.FC<PageSectionProps> = ({
  variant = 'default',
  padding = 'lg',
  containerSize = 'lg',
  children,
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-transparent text-[#24332F]',
    lightGrey: 'bg-[#F4F6F4] text-[#24332F]',
    darkForest: 'bg-[#092824] text-white border-y border-[#0A554C]',
    emerald: 'bg-[#003C35] text-white border-b-4 border-[#C9A04A]',
    bordered: 'bg-white border-y border-[#CCD8D2] text-[#24332F]',
  };

  const paddingStyles = {
    none: 'py-0',
    sm: 'py-8 md:py-12',
    md: 'py-12 md:py-16',
    lg: 'py-16 md:py-24',
  };

  return (
    <section
      className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      <Container size={containerSize}>{children}</Container>
    </section>
  );
};
