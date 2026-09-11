import React from 'react';
import { Check } from 'lucide-react';

interface AnalysisStepperProps {
  currentStep: 1 | 2 | 3;
}

export const AnalysisStepper: React.FC<AnalysisStepperProps> = ({ currentStep }) => {
  const steps = [
    { num: 1, label: 'Goal', desc: 'What to know' },
    { num: 2, label: 'Data', desc: 'Location & sensor' },
    { num: 3, label: 'Analysis', desc: 'Interactive workspace' },
  ];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-6 py-4 px-4 bg-[#0D1117] border-b border-[#283541]/70 select-none">
      {steps.map((s, idx) => {
        const isPast = currentStep > s.num;
        const isCurrent = currentStep === s.num;

        return (
          <React.Fragment key={s.num}>
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                  isPast
                    ? 'bg-[#10B981] text-[#080B10]'
                    : isCurrent
                    ? 'bg-[#38D9D1] text-[#080B10] ring-4 ring-[#38D9D1]/20'
                    : 'bg-[#17212B] text-[#9AA6B2] border border-[#283541]'
                }`}
              >
                {isPast ? <Check className="w-4 h-4 stroke-[2.5]" /> : `0${s.num}`}
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-xs font-medium leading-none ${
                    isCurrent ? 'text-[#F5F7FA]' : 'text-[#9AA6B2]'
                  }`}
                >
                  {s.label}
                </span>
                <span className="text-[10px] text-[#9AA6B2]/70 leading-tight hidden sm:inline">
                  {s.desc}
                </span>
              </div>
            </div>

            {idx < steps.length - 1 && (
              <div
                className={`w-8 sm:w-16 h-[2px] rounded-full transition-colors ${
                  currentStep > s.num ? 'bg-[#10B981]' : 'bg-[#283541]'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
