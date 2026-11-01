import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from './Button.tsx';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white rounded-xl border border-[#CCD8D2] shadow-sm ${className}`}>
      <div className="w-14 h-14 rounded-full bg-[#F4F6F4] border border-[#CCD8D2] flex items-center justify-center mb-4 text-[#536B65]">
        {icon || <ShieldAlert className="w-7 h-7 text-[#536B65]" />}
      </div>
      <h3 className="text-lg font-bold text-[#003C35] mb-2">{title}</h3>
      <p className="text-sm text-[#536B65] max-w-md mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
