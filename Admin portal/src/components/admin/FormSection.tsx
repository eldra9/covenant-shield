import React from 'react';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-3 pt-3 border-t border-slate-800/80 first:border-t-0 first:pt-0 ${className}`}>
      <div>
        <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider font-mono">
          {title}
        </h4>
        {description && (
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
};
