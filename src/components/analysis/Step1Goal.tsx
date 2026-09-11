import React from 'react';
import { ArrowRight, HelpCircle, Sparkles } from 'lucide-react';

interface Step1GoalProps {
  moduleName: string;
  query: string;
  onChangeQuery: (q: string) => void;
  onContinue: () => void;
}

export const Step1Goal: React.FC<Step1GoalProps> = ({
  moduleName,
  query,
  onChangeQuery,
  onContinue,
}) => {
  // Contextual suggested questions based on selected module
  const getSuggestions = (mod: string) => {
    switch (mod.toLowerCase()) {
      case 'urban':
      case 'urban growth':
        return [
          'Find new buildings and construction',
          'Show urban expansion between 2023 and 2026',
          'Calculate built-up surface area',
          'Show vegetation replaced by urban development',
          'Compare city boundaries across years'
        ];
      case 'agriculture':
        return [
          'Assess crop health and canopy vigor',
          'Identify parcels under water stress',
          'Calculate average NDVI across fields',
          'Check irrigation moisture patterns',
          'Compare seasonal crop growth'
        ];
      case 'disaster':
        return [
          'Map flood inundation extents',
          'Assess wildfire burn scar severity',
          'Identify submerged roadways and infrastructure',
          'Calculate total flooded area in hectares',
          'Compare pre- and post-disaster imagery'
        ];
      case 'environment':
        return [
          'Detect tree canopy loss and deforestation',
          'Identify changes in surface water reservoirs',
          'Map riparian wetland boundaries',
          'Track bare soil erosion zones',
          'Monitor land cover transitions'
        ];
      case 'change':
      case 'change detection':
        return [
          'Compare 2023 baseline against 2026 observation',
          'Show change heatmap of all transitions',
          'Detect new impervious ground surfaces',
          'Quantify total changed area in hectares',
          'Highlight high-confidence anomalies'
        ];
      default:
        return [
          'Analyze urban development and infrastructure',
          'Classify land cover surfaces into 8 classes',
          'Detect surface water and reservoirs',
          'Inspect multispectral band characteristics',
          'Perform bi-temporal change differencing'
        ];
    }
  };

  const suggestions = getSuggestions(moduleName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onContinue();
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full py-8 px-4 flex flex-col items-center">
      {/* Module Title */}
      <div className="text-center mb-6">
        <span className="text-xs font-mono uppercase tracking-widest text-[#38D9D1] bg-[#38D9D1]/10 px-3 py-1 rounded-full border border-[#38D9D1]/30">
          {moduleName.toUpperCase()}
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F7FA] mt-3">
          What would you like to know?
        </h2>
        <p className="text-xs text-[#9AA6B2] mt-1.5">
          Ask your question in natural language. SatQuery AI will automatically configure the analysis.
        </p>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="relative">
          <textarea
            rows={3}
            value={query}
            onChange={(e) => onChangeQuery(e.target.value)}
            placeholder={`Example: Has this city expanded between 2023 and 2026?`}
            className="w-full p-4 rounded-xl bg-[#121A22] border border-[#283541] focus:border-[#38D9D1] focus:ring-1 focus:ring-[#38D9D1] text-sm text-[#F5F7FA] placeholder-[#9AA6B2]/50 outline-none transition-all shadow-lg shadow-black/40 resize-none font-sans"
          />
          <div className="absolute right-3 bottom-3 flex items-center gap-1 text-[11px] text-[#9AA6B2]/70 font-mono">
            <Sparkles className="w-3 h-3 text-[#38D9D1]" />
            <span>AI Ready</span>
          </div>
        </div>

        {/* Suggested Questions */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-[#9AA6B2] uppercase tracking-wider block">
            Suggested questions:
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChangeQuery(s)}
                className={`text-xs px-3 py-1.5 rounded-lg border text-left transition-all ${
                  query === s
                    ? 'bg-[#38D9D1]/15 text-[#38D9D1] border-[#38D9D1] font-medium'
                    : 'bg-[#121A22] text-[#9AA6B2] hover:text-[#F5F7FA] border-[#283541] hover:border-[#38D9D1]/50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={!query.trim()}
            className="px-6 py-2.5 rounded-lg bg-[#38D9D1] hover:bg-[#2bc4bc] disabled:opacity-40 disabled:cursor-not-allowed text-[#080B10] font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
