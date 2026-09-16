import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Compass, Sparkles, Send, GitCompare, Users, X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

export interface TourStep {
  id: string;
  targetId: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route?: string;
  position?: 'bottom' | 'top' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'locate',
    targetId: 'tour-locate',
    title: 'Locate',
    description: 'Explore available satellite observations for your current or selected location.',
    icon: <Compass className="w-4 h-4 text-[#167A4A]" />,
    route: '/app'
  },
  {
    id: 'ask',
    targetId: 'tour-ask',
    title: 'Ask SatQuery',
    description: 'Ask questions about satellite imagery using natural language.',
    icon: <Sparkles className="w-4 h-4 text-[#167A4A]" />,
    route: '/app'
  },
  {
    id: 'analyze',
    targetId: 'tour-analyze',
    title: 'Analyze',
    description: 'SatQuery AI understands your question and selects the appropriate analysis.',
    icon: <Send className="w-4 h-4 text-[#167A4A]" />,
    route: '/app'
  },
  {
    id: 'compare',
    targetId: 'tour-compare',
    title: 'Compare & Explain',
    description: 'Compare satellite observations, detect changes, and understand the evidence.',
    icon: <GitCompare className="w-4 h-4 text-[#167A4A]" />
  },
  {
    id: 'collaborate',
    targetId: 'tour-collaborate',
    title: 'Collaborate & Share',
    description: 'Save investigations, work with others, and share your results.',
    icon: <Users className="w-4 h-4 text-[#167A4A]" />
  }
];

export const ProductTour: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 100, left: 100 });

  // Check if tour should run automatically on first visit
  useEffect(() => {
    const tourSeen = localStorage.getItem('satquery_tour_completed');
    if (!tourSeen) {
      // Delay slightly so DOM can settle
      const timer = setTimeout(() => {
        setActiveStepIndex(0);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for replay requests (from Help button or SatQuery Assistant)
  useEffect(() => {
    const handleReplay = () => {
      if (location.pathname !== '/app') {
        navigate('/app');
      }
      setTimeout(() => {
        setActiveStepIndex(0);
      }, 300);
    };

    window.addEventListener('replay-satquery-tour', handleReplay);
    return () => window.removeEventListener('replay-satquery-tour', handleReplay);
  }, [location.pathname, navigate]);

  const currentStep = activeStepIndex >= 0 && activeStepIndex < TOUR_STEPS.length ? TOUR_STEPS[activeStepIndex] : null;

  const closeTour = useCallback(() => {
    localStorage.setItem('satquery_tour_completed', 'true');
    setActiveStepIndex(-1);
    setCoords(null);
  }, []);

  const updateTargetCoordinates = useCallback(() => {
    if (!currentStep) return;

    const el = document.getElementById(currentStep.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });

      // Compute tooltip placement
      const tooltipWidth = Math.min(360, window.innerWidth - 32);
      const tooltipHeight = 180;
      let top = rect.bottom + 12;
      let left = rect.left + rect.width / 2 - tooltipWidth / 2;

      // Adjust if off-screen vertically
      if (top + tooltipHeight > window.innerHeight) {
        top = Math.max(16, rect.top - tooltipHeight - 12);
      }

      // Clamp horizontally
      left = Math.max(16, Math.min(window.innerWidth - tooltipWidth - 16, left));

      setTooltipPos({ top, left });
    } else {
      // Fallback: center of screen
      setCoords(null);
      setTooltipPos({
        top: Math.max(100, window.innerHeight / 2 - 90),
        left: Math.max(16, window.innerWidth / 2 - 180)
      });
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep) {
      updateTargetCoordinates();
      window.addEventListener('resize', updateTargetCoordinates);
      window.addEventListener('scroll', updateTargetCoordinates, true);
      return () => {
        window.removeEventListener('resize', updateTargetCoordinates);
        window.removeEventListener('scroll', updateTargetCoordinates, true);
      };
    }
  }, [currentStep, updateTargetCoordinates]);

  if (!currentStep) return null;

  const isFirst = activeStepIndex === 0;
  const isLast = activeStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      closeTour();
    } else {
      setActiveStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirst) {
      setActiveStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto">
      {/* Subtle Backdrop Dimming */}
      <div
        className="absolute inset-0 bg-black/25 backdrop-blur-[1px] transition-opacity duration-200"
        onClick={closeTour}
      />

      {/* Target Highlight Box if element exists */}
      {coords && (
        <div
          className="absolute rounded-xl border-2 border-[#167A4A] shadow-[0_0_20px_rgba(22,122,74,0.4)] pointer-events-none transition-all duration-300 z-50 animate-pulse"
          style={{
            top: coords.top - 4,
            left: coords.left - 4,
            width: coords.width + 8,
            height: coords.height + 8
          }}
        />
      )}

      {/* Floating Tooltip Window */}
      <div
        className="fixed z-50 w-[90vw] max-w-[360px] bg-white border border-[#E3EAE5] rounded-2xl p-4 shadow-xl text-[#17201B] select-none transition-all duration-200 animate-in fade-in zoom-in-95"
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left
        }}
      >
        {/* Header with Step Indicator and Close */}
        <div className="flex items-center justify-between border-b border-[#E3EAE5]/60 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#EAF7F0] border border-[#167A4A]/20 flex items-center justify-center">
              {currentStep.icon}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#167A4A]">
              Step {activeStepIndex + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          <button
            type="button"
            onClick={closeTour}
            className="w-6 h-6 rounded-md text-[#66736B] hover:text-[#17201B] hover:bg-[#F4F6F5] flex items-center justify-center cursor-pointer transition-colors"
            title="Skip Tour"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-1.5 mb-4">
          <h4 className="text-sm font-bold text-[#17201B]">
            {currentStep.title}
          </h4>
          <p className="text-xs text-[#66736B] leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E3EAE5]/60">
          {/* Back or Skip Tour */}
          {isFirst ? (
            <button
              type="button"
              onClick={closeTour}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#66736B] hover:text-[#17201B] hover:bg-[#F4F6F5] transition cursor-pointer"
            >
              Skip Tour
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleBack}
                className="px-2.5 py-1.5 rounded-lg border border-[#E3EAE5] bg-white hover:bg-[#F4F6F5] text-xs font-bold text-[#17201B] flex items-center gap-1 cursor-pointer transition"
              >
                <ChevronLeft className="w-3 h-3" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={closeTour}
                className="px-2.5 py-1.5 text-xs text-[#66736B] hover:text-[#17201B] cursor-pointer"
              >
                Skip
              </button>
            </div>
          )}

          {/* Next or Finish Button */}
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-1.5 rounded-lg bg-[#167A4A] hover:bg-[#13673E] text-white text-xs font-bold transition shadow-xs flex items-center gap-1 cursor-pointer"
          >
            {isLast ? (
              <>
                <span>Finish</span>
                <Check className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
