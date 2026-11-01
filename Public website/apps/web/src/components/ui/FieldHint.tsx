import React from 'react';
import { Info } from 'lucide-react';

export interface FieldHintProps {
  id?: string;
  showIcon?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FieldHint: React.FC<FieldHintProps> = ({
  id,
  showIcon = false,
  children,
  className = '',
}) => {
  return (
    <p
      id={id}
      className={`text-xs text-[#536B65] flex items-center gap-1.5 mt-1 leading-normal ${className}`}
    >
      {showIcon && <Info className="w-3.5 h-3.5 shrink-0 text-[#003C35]" />}
      <span>{children}</span>
    </p>
  );
};
