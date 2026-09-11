import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SimpleNavBar } from '../components/navigation/SimpleNavBar';
import { AnalysisStepper } from '../components/analysis/AnalysisStepper';
import { Step1Goal } from '../components/analysis/Step1Goal';
import { Step2Data } from '../components/analysis/Step2Data';

export const AnalyzeFlow: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialModule = searchParams.get('module') || 'urban';
  const initialQuery = searchParams.get('query') || 'Has this city expanded between 2023 and 2026?';

  const [step, setStep] = useState<1 | 2>(1);
  const [moduleName, setModuleName] = useState<string>(initialModule);
  const [query, setQuery] = useState<string>(initialQuery);
  const [location, setLocation] = useState<string>('Dublin, Ireland (53.3472, -6.2439 • Tile 30UUE)');
  const [selectedSensor, setSelectedSensor] = useState<'auto' | 'Sentinel-2' | 'Sentinel-1' | 'multimodal'>('auto');

  const handleStartAnalysis = () => {
    // Navigate to Step 3: Main Analysis Workspace with parameters
    const params = new URLSearchParams({
      workflow: moduleName,
      query: query,
      location: location,
      sensor: selectedSensor,
    });
    navigate(`/workstation?${params.toString()}`);
  };

  return (
    <div className="min-h-screen w-screen bg-[#080B10] text-[#F5F7FA] font-sans flex flex-col select-none overflow-x-hidden">
      {/* Clean Top Navigation */}
      <SimpleNavBar />

      {/* 3-Step Stepper Header */}
      <AnalysisStepper currentStep={step} />

      {/* Stepper Content */}
      <main className="flex-1 flex flex-col justify-center px-4">
        {step === 1 && (
          <Step1Goal
            moduleName={moduleName}
            query={query}
            onChangeQuery={setQuery}
            onContinue={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <Step2Data
            moduleName={moduleName}
            location={location}
            onChangeLocation={setLocation}
            selectedSensor={selectedSensor}
            onChangeSensor={setSelectedSensor}
            onBack={() => setStep(1)}
            onStartAnalysis={handleStartAnalysis}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-[#283541]/40 text-center text-[11px] text-[#9AA6B2]/60">
        Step {step} of 3 • SatQuery AI Multimodal Remote Sensing
      </footer>
    </div>
  );
};
