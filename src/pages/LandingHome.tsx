import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Sprout, 
  Waves, 
  Trees, 
  GitCompare, 
  GraduationCap, 
  Sparkles, 
  ArrowRight, 
  Compass, 
  Send,
  HelpCircle,
  ShieldCheck,
  Search
} from 'lucide-react';
import { SimpleNavBar } from '../components/navigation/SimpleNavBar';
import { ModuleCard } from '../components/home/ModuleCard';

export const LandingHome: React.FC = () => {
  const navigate = useNavigate();
  const [askQuery, setAskQuery] = useState('');
  const [showAskBox, setShowAskBox] = useState(false);

  const modules = [
    {
      id: 'urban',
      icon: Building2,
      title: 'Urban Growth',
      description: 'Detect buildings, road networks, and city expansion over time.',
      badge: 'Optical + SAR',
      defaultQuestion: 'Has this city expanded between 2023 and 2026?',
    },
    {
      id: 'agriculture',
      icon: Sprout,
      title: 'Agriculture',
      description: 'Monitor crop vigor, vegetation stress, and irrigation patterns.',
      badge: 'Multispectral',
      defaultQuestion: 'Monitor crop health and identify stressed vegetation.',
    },
    {
      id: 'disaster',
      icon: Waves,
      title: 'Disaster',
      description: 'Analyze flood inundation, wildfire burn scars, and damage.',
      badge: 'All-Weather SAR',
      defaultQuestion: 'Map flood inundation extents and calculate affected area.',
    },
    {
      id: 'environment',
      icon: Trees,
      title: 'Environment',
      description: 'Monitor forest cover loss, water bodies, and land changes.',
      badge: 'Land Cover',
      defaultQuestion: 'Detect forest loss and environmental degradation.',
    },
    {
      id: 'change',
      icon: GitCompare,
      title: 'Change Detection',
      description: 'Compare two dates with interactive split slider and heatmap.',
      badge: 'Bi-Temporal',
      defaultQuestion: 'Compare satellite imagery between 2023 and 2026.',
    },
    {
      id: 'research',
      icon: GraduationCap,
      title: 'Research',
      description: 'Explore raw imagery, band indices, and pixel reflectance curves.',
      badge: 'Full GIS',
      defaultQuestion: 'Inspect surface reflectance and spectral characteristics.',
    },
  ];

  const handleSelectModule = (modId: string, defaultQ: string) => {
    navigate(`/analyze?module=${modId}&query=${encodeURIComponent(defaultQ)}`);
  };

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askQuery.trim()) return;

    // Simple intelligent router for user's query
    const q = askQuery.toLowerCase();
    let mod = 'urban';
    if (q.includes('crop') || q.includes('farm') || q.includes('wheat') || q.includes('ndvi')) {
      mod = 'agriculture';
    } else if (q.includes('flood') || q.includes('water') || q.includes('fire') || q.includes('damage')) {
      mod = 'disaster';
    } else if (q.includes('forest') || q.includes('tree') || q.includes('land')) {
      mod = 'environment';
    } else if (q.includes('compare') || q.includes('change') || q.includes('difference')) {
      mod = 'change';
    }

    navigate(`/analyze?module=${mod}&query=${encodeURIComponent(askQuery.trim())}`);
  };

  return (
    <div className="min-h-screen w-screen bg-[#080B10] text-[#F5F7FA] font-sans flex flex-col select-none overflow-x-hidden">
      {/* 5-Link Navigation */}
      <SimpleNavBar />

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12 max-w-5xl mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center max-w-2xl space-y-3.5 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121A22] border border-[#38D9D1]/30 text-xs font-mono text-[#38D9D1] shadow-sm shadow-cyan-950/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Copilot for Satellite Imagery</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#F5F7FA] tracking-tight">
            Understand Earth from <span className="text-[#38D9D1]">satellite imagery</span>.
          </h1>

          <p className="text-sm sm:text-base text-[#9AA6B2] leading-relaxed max-w-xl mx-auto">
            Ask questions about Sentinel-1 radar and Sentinel-2 optical imagery using natural language.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/analyze')}
              className="px-6 py-2.5 rounded-lg bg-[#38D9D1] hover:bg-[#2bc4bc] text-[#080B10] font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 flex items-center gap-2"
            >
              <span>Start an Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/explore')}
              className="px-6 py-2.5 rounded-lg bg-[#121A22] hover:bg-[#17212B] text-[#F5F7FA] border border-[#283541] hover:border-[#38D9D1]/40 font-medium text-sm transition-colors"
            >
              Explore Satellite Imagery
            </button>
          </div>
        </div>

        {/* Section Heading */}
        <div className="w-full mb-4 flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#9AA6B2]">
            What do you want to do?
          </h2>
          <span className="text-[11px] text-[#9AA6B2]/70">Choose a workflow to begin</span>
        </div>

        {/* 6 Clean Module Cards (3x2 Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full mb-8">
          {modules.map((mod) => (
            <ModuleCard
              key={mod.id}
              id={mod.id}
              icon={mod.icon}
              title={mod.title}
              description={mod.description}
              badge={mod.badge}
              onClick={() => handleSelectModule(mod.id, mod.defaultQuestion)}
            />
          ))}
        </div>

        {/* "Not sure what to choose? Ask SatQuery" */}
        <div className="w-full p-4 sm:p-5 rounded-xl bg-[#121A22]/80 border border-[#283541] max-w-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#17212B] border border-[#38D9D1]/40 flex items-center justify-center text-[#38D9D1]">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[#F5F7FA]">Not sure what to choose?</h3>
                <p className="text-[11px] text-[#9AA6B2]">
                  Type your goal in plain English, and SatQuery will choose the right satellite analysis for you.
                </p>
              </div>
            </div>

            {!showAskBox && (
              <button
                onClick={() => setShowAskBox(true)}
                className="px-3 py-1.5 rounded-lg bg-[#17212B] hover:bg-[#1C2834] border border-[#38D9D1]/40 text-xs text-[#38D9D1] font-medium transition-colors shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask SatQuery</span>
              </button>
            )}
          </div>

          {showAskBox && (
            <form onSubmit={handleAskSubmit} className="relative mt-2">
              <input
                type="text"
                value={askQuery}
                onChange={(e) => setAskQuery(e.target.value)}
                placeholder="Example: Is this forest losing trees, or has the nearby town expanded?"
                autoFocus
                className="w-full h-11 pl-4 pr-24 rounded-lg bg-[#0D1117] border border-[#38D9D1]/60 text-xs text-[#F5F7FA] placeholder-[#9AA6B2]/60 focus:outline-none focus:ring-1 focus:ring-[#38D9D1]"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md bg-[#38D9D1] text-[#080B10] font-bold text-xs flex items-center gap-1 hover:bg-[#2bc4bc] transition-colors"
              >
                <span>Guide me</span>
                <Send className="w-3 h-3" />
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Clean, subtle footer */}
      <footer className="py-4 border-t border-[#283541]/40 text-center text-[11px] text-[#9AA6B2]/60">
        SatQuery AI • Sentinel-1 SAR & Sentinel-2 Optical Remote Sensing Assistant
      </footer>
    </div>
  );
};
