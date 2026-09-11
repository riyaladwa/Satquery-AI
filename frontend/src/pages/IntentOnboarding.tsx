import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Radio, 
  Building2, 
  Mountain, 
  Sprout, 
  Trees, 
  AlertTriangle, 
  GraduationCap, 
  Check, 
  ArrowRight, 
  HelpCircle, 
  Search, 
  MapPin, 
  Compass, 
  Upload, 
  Sparkles,
  Layers,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

interface WorkflowCard {
  id: string;
  icon: any;
  title: string;
  description: string;
  defaultPrompt: string;
  recommendedSensor: 'auto' | 'Sentinel-2' | 'Sentinel-1' | 'multimodal';
  defaultLocation: { name: string; coords: string; tile: string };
}

export const IntentOnboarding: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>('agri');
  const [isCustomIntent, setIsCustomIntent] = useState(false);
  const [customIntentText, setCustomIntentText] = useState('');

  // Step 2 Form State
  const [analysisQuery, setAnalysisQuery] = useState('Monitor crop health, vegetation stress, and irrigation patterns.');
  const [selectedLocation, setSelectedLocation] = useState('Dublin, Ireland (53.3472, -6.2439 • Tile 30UUE)');
  const [selectedSensor, setSelectedSensor] = useState<'auto' | 'Sentinel-2' | 'Sentinel-1' | 'multimodal'>('auto');
  const [customLocationQuery, setCustomLocationQuery] = useState('');

  const workflows: WorkflowCard[] = [
    {
      id: 'construction',
      icon: Building2,
      title: 'Construction & Infrastructure',
      description: 'Monitor buildings, construction sites, roads, industrial facilities, dams and infrastructure changes.',
      defaultPrompt: 'Find new buildings and calculate urban expansion between 2023 and 2026.',
      recommendedSensor: 'Sentinel-2',
      defaultLocation: { name: 'Dublin Metropolitan Area, Ireland', coords: '53.3472, -6.2439', tile: '30UUE' }
    },
    {
      id: 'terrain',
      icon: Mountain,
      title: 'Terrain & Land Resources',
      description: 'Analyze terrain, land characteristics, surface anomalies and geological patterns.',
      defaultPrompt: 'Analyze land characteristics, elevation boundaries, and surface anomalies.',
      recommendedSensor: 'multimodal',
      defaultLocation: { name: 'Dublin Coastal Bay Corridor', coords: '53.3472, -6.2439', tile: '30UUE' }
    },
    {
      id: 'agri',
      icon: Sprout,
      title: 'Agriculture & Vegetation',
      description: 'Monitor crop health, vegetation stress, irrigation patterns, water availability and seasonal changes.',
      defaultPrompt: 'Monitor crop health, calculate NDVI vegetation vigor, and assess water availability.',
      recommendedSensor: 'Sentinel-2',
      defaultLocation: { name: 'Punjab Agricultural Tracts, India', coords: '30.93, 75.84', tile: '43RFL' }
    },
    {
      id: 'deforestation',
      icon: Trees,
      title: 'Deforestation & Land Use',
      description: 'Detect forest loss, vegetation change, land conversion, urban expansion and environmental changes.',
      defaultPrompt: 'Detect forest canopy loss, land conversion, and urban encroachment over the last 3 years.',
      recommendedSensor: 'Sentinel-2',
      defaultLocation: { name: 'Dublin Western Radial Forest Canopy', coords: '53.32, -6.35', tile: '30UUE' }
    },
    {
      id: 'disaster',
      icon: AlertTriangle,
      title: 'Disaster & Damage Assessment',
      description: 'Analyze floods, wildfire damage, drought, landslides, infrastructure damage and disaster-affected regions.',
      defaultPrompt: 'Identify flood inundated zones, estimate submerged area, and compare with Sentinel-1 SAR.',
      recommendedSensor: 'multimodal',
      defaultLocation: { name: 'Kerala Flood Inundated Basin', coords: '9.98, 76.30', tile: '43PFR' }
    },
    {
      id: 'research',
      icon: GraduationCap,
      title: 'Research & Earth Observation',
      description: 'Explore satellite imagery, perform remote-sensing experiments, academic studies and student projects.',
      defaultPrompt: 'Explore multispectral band combinations and analyze pixel reflectances across Sentinel-1 & 2.',
      recommendedSensor: 'auto',
      defaultLocation: { name: 'Dublin Multimodal Test Observatory', coords: '53.3472, -6.2439', tile: '30UUE' }
    }
  ];

  const handleSelectWorkflow = (wf: WorkflowCard) => {
    setSelectedWorkflowId(wf.id);
    setIsCustomIntent(false);
    setAnalysisQuery(wf.defaultPrompt);
    setSelectedSensor(wf.recommendedSensor);
    setSelectedLocation(`${wf.defaultLocation.name} (${wf.defaultLocation.coords})`);
  };

  const handleCustomIntentSelect = () => {
    setSelectedWorkflowId('custom');
    setIsCustomIntent(true);
    if (!analysisQuery || analysisQuery.includes('crop health')) {
      setAnalysisQuery('');
    }
  };

  const handleContinueToStep2 = () => {
    if (!selectedWorkflowId && !isCustomIntent) return;
    setStep(2);
  };

  const handleLaunchWorkspace = () => {
    const params = new URLSearchParams();
    if (analysisQuery.trim()) {
      params.set('query', analysisQuery.trim());
    }
    if (selectedWorkflowId) {
      params.set('workflow', selectedWorkflowId);
    }
    if (selectedSensor !== 'auto') {
      params.set('sensor', selectedSensor === 'multimodal' ? 'multimodal' : selectedSensor);
    }
    params.set('demo', 'dublin');

    navigate(`/workstation?${params.toString()}`);
  };

  const getSelectedWorkflowTitle = () => {
    if (isCustomIntent) return customIntentText ? `Custom: "${customIntentText.slice(0, 30)}..."` : 'Custom Investigation';
    const found = workflows.find(w => w.id === selectedWorkflowId);
    return found ? found.title : '';
  };

  return (
    <div className="min-h-screen w-screen bg-[#080B10] text-[#F5F7FA] font-sans flex flex-col items-center justify-center p-4 sm:p-6 select-none relative overflow-x-hidden">
      {/* Background Subtle GIS Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111820_1px,transparent_1px),linear-gradient(to_bottom,#111820_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Top Header Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between py-4 mb-4 z-10 border-b border-[#283541]/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#121A22] border border-[#38D9D1]/40 flex items-center justify-center text-[#38D9D1] shadow-sm shadow-[#38D9D1]/20">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-widest text-[#F5F7FA]">SATQUERY</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#38D9D1]/15 text-[#38D9D1] border border-[#38D9D1]/30 font-bold">
              AI
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => navigate('/workstation')}
            className="text-[#9AA6B2] hover:text-[#38D9D1] transition-colors font-mono"
          >
            Direct to Map &rarr;
          </button>
        </div>
      </div>

      {/* Main Centered Panel */}
      <div className="w-full max-w-5xl bg-[#121A22] border border-[#283541] rounded-2xl shadow-2xl p-6 sm:p-8 z-10 flex flex-col space-y-6">
        {step === 1 ? (
          <>
            {/* Step 1 Header */}
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
                Tell us what you're working on
              </h1>
              <p className="text-xs sm:text-sm text-[#9AA6B2] leading-relaxed">
                Choose what you want to analyze so SatQuery can automatically select the right satellite data, analysis methods, and AI workflow.
              </p>
            </div>

            {/* 3 x 2 Grid of 6 Use-Case Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {workflows.map((card) => {
                const isSelected = selectedWorkflowId === card.id && !isCustomIntent;
                const Icon = card.icon;

                return (
                  <button
                    key={card.id}
                    onClick={() => handleSelectWorkflow(card)}
                    className={`p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between group relative ${
                      isSelected
                        ? 'bg-[#17212B] border-[#38D9D1] shadow-lg shadow-[#38D9D1]/10 ring-1 ring-[#38D9D1]/30'
                        : 'bg-[#0D1117] border-[#283541] hover:border-[#283541]/90 hover:bg-[#151D26]'
                    }`}
                  >
                    {/* Top row: Icon + Checkmark */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-[#38D9D1]/20 text-[#38D9D1]' : 'bg-[#121A22] text-[#9AA6B2] group-hover:text-[#F5F7FA]'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#38D9D1] text-[#080B10] flex items-center justify-center animate-in zoom-in duration-150">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-1.5">
                      <h3 className={`font-bold text-sm leading-snug transition-colors ${
                        isSelected ? 'text-[#38D9D1]' : 'text-[#F5F7FA] group-hover:text-[#F5F7FA]'
                      }`}>
                        {card.title}
                      </h3>
                      <p className="text-xs text-[#9AA6B2] leading-relaxed line-clamp-3">
                        {card.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Seventh Option: Something else? */}
            <div className={`p-4 rounded-xl border transition-all ${
              isCustomIntent
                ? 'bg-[#17212B] border-[#38D9D1] shadow-md shadow-[#38D9D1]/10'
                : 'bg-[#0D1117] border-[#283541] hover:border-[#283541]/90'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#121A22] border border-[#283541] flex items-center justify-center text-[#38D9D1] shrink-0 mt-0.5 sm:mt-0">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#F5F7FA]">Something else?</h4>
                    <p className="text-xs text-[#9AA6B2]">
                      Have a different satellite analysis problem? Describe what you want to investigate.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCustomIntentSelect}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isCustomIntent
                      ? 'bg-[#38D9D1] text-[#080B10]'
                      : 'bg-[#121A22] hover:bg-[#161D26] border border-[#283541] text-[#38D9D1]'
                  }`}
                >
                  Let's describe it
                </button>
              </div>

              {isCustomIntent && (
                <div className="mt-3 pt-3 border-t border-[#283541]/60">
                  <input
                    type="text"
                    value={customIntentText}
                    onChange={(e) => {
                      setCustomIntentText(e.target.value);
                      setAnalysisQuery(e.target.value);
                    }}
                    placeholder="Describe your research inquiry or satellite problem..."
                    className="w-full h-9 px-3 bg-[#121A22] border border-[#38D9D1]/60 rounded-lg text-xs text-[#F5F7FA] placeholder-[#9AA6B2] focus:outline-none focus:ring-1 focus:ring-[#38D9D1]"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Bottom Bar: Selected Workflow & Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#283541]/60">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-[#9AA6B2]">Selected workflow:</span>
                <span className="text-[#38D9D1] font-bold">
                  {getSelectedWorkflowTitle() || 'None selected'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/workstation?demo=dublin')}
                  className="px-4 py-2 text-xs text-[#9AA6B2] hover:text-[#F5F7FA] transition-colors"
                >
                  Skip to Explorer
                </button>

                <button
                  onClick={handleContinueToStep2}
                  disabled={!selectedWorkflowId && !isCustomIntent}
                  className="px-6 py-2.5 rounded-lg bg-[#38D9D1] hover:bg-[#38D9D1]/90 disabled:opacity-40 disabled:cursor-not-allowed text-[#080B10] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-[#38D9D1]/20"
                >
                  <span>Continue to SatQuery</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* STEP 2: Collect Useful Analysis Information */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Step 2 Header */}
            <div className="flex items-center justify-between border-b border-[#283541]/60 pb-3">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-xs text-[#9AA6B2] hover:text-[#38D9D1] transition-colors font-mono"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Workflows</span>
              </button>

              <span className="text-xs font-mono text-[#38D9D1]">
                Step 2 of 2 • Analysis Configuration
              </span>
            </div>

            <div className="space-y-4">
              {/* Question 1: What do you want to analyze? */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#F5F7FA] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#38D9D1]/20 text-[#38D9D1] flex items-center justify-center font-mono text-[11px]">1</span>
                  <span>What do you want to analyze?</span>
                </label>
                <textarea
                  value={analysisQuery}
                  onChange={(e) => setAnalysisQuery(e.target.value)}
                  placeholder="Example: Has this city expanded between 2023 and 2026? or Identify flood-affected regions..."
                  rows={2}
                  className="w-full p-3 bg-[#0D1117] border border-[#283541] focus:border-[#38D9D1] rounded-lg text-xs text-[#F5F7FA] placeholder-[#9AA6B2] focus:outline-none focus:ring-1 focus:ring-[#38D9D1] transition-all resize-none"
                />
              </div>

              {/* Question 2: Where is the area? */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#F5F7FA] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#38D9D1]/20 text-[#38D9D1] flex items-center justify-center font-mono text-[11px]">2</span>
                  <span>Where is the area?</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { label: 'Dublin, Ireland (Demo Scene)', sub: '53.3472° N, 6.2439° W • Tile 30UUE', val: 'dublin' },
                    { label: 'Bengaluru Urban Growth', sub: '12.95° N, 77.62° E • Tile 43PGN', val: 'bengaluru' },
                    { label: 'Kerala Flood Inundation', sub: '9.98° N, 76.30° E • Tile 43PFR', val: 'kerala' },
                    { label: 'Enter Coordinates / Search', sub: 'Search location or paste coordinates', val: 'custom' }
                  ].map((loc) => {
                    const isSelected = selectedLocation.includes(loc.label.slice(0, 6));

                    return (
                      <button
                        key={loc.val}
                        type="button"
                        onClick={() => setSelectedLocation(`${loc.label} (${loc.sub})`)}
                        className={`p-3 rounded-lg border text-left transition-all flex items-start justify-between ${
                          isSelected
                            ? 'bg-[#17212B] border-[#38D9D1] text-[#F5F7FA]'
                            : 'bg-[#0D1117] border-[#283541] hover:border-[#283541]/90 text-[#9AA6B2]'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-xs text-[#F5F7FA]">{loc.label}</div>
                          <div className="text-[11px] text-[#9AA6B2] font-mono mt-0.5">{loc.sub}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#38D9D1] shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 3: What data would you like to use? */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#F5F7FA] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#38D9D1]/20 text-[#38D9D1] flex items-center justify-center font-mono text-[11px]">3</span>
                  <span>What satellite data would you like to use?</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'auto', label: 'Let SatQuery decide', sub: 'AI selects optimal sensor' },
                    { id: 'Sentinel-2', label: 'Sentinel-2 Optical', sub: '10m 12-Band Multispectral' },
                    { id: 'Sentinel-1', label: 'Sentinel-1 SAR', sub: 'C-Band Radar Penetration' },
                    { id: 'multimodal', label: 'Sentinel-1 + Sentinel-2', sub: 'Joint Optical + Radar Fusion' }
                  ].map((sen) => {
                    const isSelected = selectedSensor === sen.id;

                    return (
                      <button
                        key={sen.id}
                        type="button"
                        onClick={() => setSelectedSensor(sen.id as any)}
                        className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#17212B] border-[#38D9D1] text-[#F5F7FA]'
                            : 'bg-[#0D1117] border-[#283541] hover:border-[#283541]/90 text-[#9AA6B2]'
                        }`}
                      >
                        <div className="font-semibold text-xs text-[#F5F7FA]">{sen.label}</div>
                        <div className="text-[10px] text-[#9AA6B2] font-mono mt-1">{sen.sub}</div>
                        {isSelected && (
                          <div className="mt-1 text-[10px] font-mono text-[#38D9D1] font-bold">
                            &bull; Selected
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Launch Workspace Button */}
            <div className="pt-4 border-t border-[#283541]/60 flex items-center justify-between">
              <div className="text-xs text-[#9AA6B2] font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#38D9D1]" />
                <span>AI will orchestrate specialist models automatically</span>
              </div>

              <button
                onClick={handleLaunchWorkspace}
                className="px-6 py-2.5 rounded-lg bg-[#38D9D1] hover:bg-[#38D9D1]/90 text-[#080B10] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-[#38D9D1]/20"
              >
                <span>Start Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-xs font-mono text-[#9AA6B2]/70 flex items-center gap-4">
        <span>SatQuery AI Multimodal Remote Sensing</span>
        <span>&bull;</span>
        <span>Sentinel-1 SAR &amp; Sentinel-2 Optical</span>
      </div>
    </div>
  );
};
