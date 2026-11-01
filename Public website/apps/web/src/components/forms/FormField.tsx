import React from 'react';

export interface FormFieldProps {
  id?: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  required = false,
  error,
  hint,
  children,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-[#003C35] flex items-center gap-1">
          {label}
          {required && <span className="text-[#C9A04A]" title="Required field">*</span>}
        </label>
        {!required && (
          <span className="text-[11px] text-[#536B65] italic">Optional</span>
        )}
      </div>

      <div>{children}</div>

      {hint && !error && (
        <p className="text-xs text-[#536B65] mt-0.5">{hint}</p>
      )}

      {error && (
        <p role="alert" className="text-xs font-medium text-red-600 flex items-center gap-1 mt-0.5 animate-fadeIn">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
