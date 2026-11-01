import React from 'react';
import { Check, ShieldCheck } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface StatusStepperProps {
  steps: Step[];
  currentStepId: string;
  onSelectStep?: (stepId: string) => void;
  allowedTransitions?: string[];
}

export const StatusStepper: React.FC<StatusStepperProps> = ({
  steps,
  currentStepId,
  onSelectStep,
  allowedTransitions = [],
}) => {
  const currentIndex = steps.findIndex((s) => s.id === currentStepId);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;
  const progressRatio = steps.length > 1 ? activeIndex / (steps.length - 1) : 1;

  return (
    <div className="py-3 px-4 bg-[#071F1C] rounded-lg border border-[#003C35] space-y-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-[#C9A04A] uppercase tracking-wider text-[11px]">
          Lifecycle Transition Stepper
        </span>
        <span className="font-mono text-[#A0B2AC] text-[11px]">
          Step {activeIndex + 1} of {steps.length}
        </span>
      </div>

      <div className="relative">
        {/* Track Background */}
        <div className="absolute top-4 left-4 right-4 h-[2px] bg-[#123D37]" />

        {/* Animated Progress Line */}
        <div
          className="absolute top-4 left-4 right-4 h-[2px] bg-gradient-to-r from-[#1E6B45] via-[#C9A04A] to-[#E6CB8A] origin-left transition-transform duration-400 ease-[var(--e-silk)]"
          style={{ transform: `scaleX(${progressRatio})` }}
        />

        {/* Step Nodes */}
        <div className="relative flex justify-between">
          {steps.map((step, idx) => {
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            const isTransitionAllowed = allowedTransitions.includes(step.id);

            return (
              <div
                key={step.id}
                className="flex flex-col items-center text-center max-w-[100px] cursor-pointer group"
                onClick={() => {
                  if (isTransitionAllowed && onSelectStep) {
                    onSelectStep(step.id);
                  }
                }}
              >
                {/* Node Seal */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                    isCurrent
                      ? 'bg-[#C9A04A] text-[#003C35] shadow-[0_0_12px_rgba(201,160,74,0.4)] border-2 border-[#E6CB8A] scale-110'
                      : isCompleted
                      ? 'bg-[#1E6B45] text-[#FFFFFF] border border-[#1E6B45]'
                      : 'bg-[#0D322D] text-[#52625D] border border-[#123D37]'
                  } ${isTransitionAllowed ? 'hover:border-[#C9A04A] hover:scale-105' : ''}`}
                >
                  {isCurrent ? (
                    /* SealStamp */
                    <ShieldCheck className="w-4 h-4 animate-pulse" />
                  ) : isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <span className="text-[10px] font-mono">{idx + 1}</span>
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`text-[11px] mt-2 font-medium leading-tight ${
                    isCurrent
                      ? 'text-[#E6CB8A] font-semibold'
                      : isCompleted
                      ? 'text-[#F4F6F4]'
                      : 'text-[#52625D]'
                  }`}
                >
                  {step.label}
                </span>

                {isTransitionAllowed && (
                  <span className="text-[9px] font-mono text-[#C9A04A] mt-0.5 bg-[#0D322D] px-1 rounded border border-[#C9A04A]/30">
                    Next Allowed
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
