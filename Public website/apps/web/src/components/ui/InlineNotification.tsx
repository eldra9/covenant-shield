import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface InlineNotificationProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const InlineNotification: React.FC<InlineNotificationProps> = ({
  variant = 'info',
  title,
  children,
  onDismiss,
  actionText,
  onAction,
  className = '',
}) => {
  const configs = {
    info: {
      container: 'bg-blue-50/90 border-blue-300 text-blue-950',
      icon: <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" aria-hidden="true" />,
      role: 'status',
      live: 'polite' as const,
    },
    success: {
      container: 'bg-emerald-50/90 border-emerald-300 text-[#002B26]',
      icon: <CheckCircle2 className="w-5 h-5 text-[#003C35] shrink-0 mt-0.5" aria-hidden="true" />,
      role: 'status',
      live: 'polite' as const,
    },
    warning: {
      container: 'bg-amber-50/90 border-amber-300 text-amber-950',
      icon: <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />,
      role: 'alert',
      live: 'polite' as const,
    },
    error: {
      container: 'bg-rose-50/90 border-rose-300 text-rose-950',
      icon: <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" aria-hidden="true" />,
      role: 'alert',
      live: 'assertive' as const,
    },
  };

  const current = configs[variant];

  return (
    <div
      role={current.role}
      aria-live={current.live}
      className={`p-4 rounded-xl border flex items-start gap-3.5 text-xs sm:text-sm leading-relaxed ${current.container} ${className}`}
    >
      {current.icon}
      <div className="flex-1 space-y-1">
        {title && <h4 className="font-bold text-sm">{title}</h4>}
        <div>{children}</div>
        {actionText && onAction && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onAction}
              className="text-xs font-bold underline hover:opacity-80 cursor-pointer"
            >
              {actionText}
            </button>
          </div>
        )}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-md text-gray-500 hover:text-gray-900 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
