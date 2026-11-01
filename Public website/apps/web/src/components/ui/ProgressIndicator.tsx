import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  id: string | number;
  label: string;
  sublabel?: string;
}

export interface ProgressIndicatorProps {
  steps: StepItem[];
  currentStepIndex: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStepIndex,
  onStepClick,
  className = '',
}) => {
  return (
    <nav aria-label="Progress Stepper" className={`w-full ${className}`}>
      <ol className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isClickable = !!onStepClick && isCompleted;

          return (
            <li
              key={step.id}
              className={`flex-1 relative flex flex-col items-center text-center ${
                index !== steps.length - 1 ? 'after:content-[\'\'] after:w-full after:h-0.5 after:top-4 after:left-1/2 after:absolute after:-z-0 ' + (isCompleted ? 'after:bg-[#003C35]' : 'after:bg-[#CCD8D2]') : ''
              }`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(index)}
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 select-none ${
                  isCurrent
                    ? 'bg-[#003C35] text-[#C9A04A] ring-4 ring-[#C9A04A]/30 font-extrabold'
                    : isCompleted
                    ? 'bg-[#003C35] text-white hover:bg-[#0A554C] cursor-pointer'
                    : 'bg-white text-[#536B65] border-2 border-[#CCD8D2] cursor-not-allowed'
                }`}
                aria-label={`Step ${index + 1}: ${step.label} (${isCurrent ? 'Current' : isCompleted ? 'Completed' : 'Upcoming'})`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : index + 1}
              </button>

              <span
                className={`mt-2 text-xs font-semibold max-w-[110px] truncate ${
                  isCurrent
                    ? 'text-[#003C35]'
                    : isCompleted
                    ? 'text-[#24332F]'
                    : 'text-[#536B65]'
                }`}
              >
                {step.label}
              </span>

              {step.sublabel && (
                <span className="hidden sm:inline-block text-[10px] text-[#536B65] mt-0.5">
                  {step.sublabel}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
