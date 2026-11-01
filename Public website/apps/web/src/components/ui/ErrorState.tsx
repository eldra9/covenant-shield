import React from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';
import { Button } from './Button.tsx';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Records',
  message = 'A secure network error occurred while contacting the Covenant Shield database. Please check your reference credentials and retry.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center p-8 md:p-10 text-center bg-white rounded-xl border border-red-200 shadow-sm ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-red-900 mb-2">{title}</h3>
      <p className="text-sm text-red-700/90 max-w-md mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RotateCw className="w-4 h-4" />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
