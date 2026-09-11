import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { VoiceInput } from './VoiceInput';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { ImageRecord } from '../../types';

interface QueryBarProps {
  onSendQuery: (queryText: string, source?: string) => void;
  isLoading: boolean;
  selectedImage?: ImageRecord | null;
}

export const QueryBar: React.FC<QueryBarProps> = ({
  onSendQuery,
  isLoading,
  selectedImage
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  // Context-adaptive suggestions
  const getSuggestions = () => {
    if (!selectedImage) {
      return [
        'Describe this satellite scene in detail',
        'Highlight water bodies and calculate coverage',
        'Show built-up areas and concrete structures'
      ];
    }
    const filename = selectedImage.filename.toLowerCase();
    if (filename.includes('urban') || filename.includes('bengaluru')) {
      return [
        'Has the built-up area increased between 2023 and 2026?',
        'Highlight newly developed concrete zones',
        'Calculate total built-up area in hectares',
        'Describe dominant arterial expansion corridors'
      ];
    } else if (filename.includes('flood') || filename.includes('kerala')) {
      return [
        'Assess flood inundation extent across lowlands',
        'Highlight submerged agricultural tracts',
        'Calculate total flooded area in km²',
        'Identify critical affected infrastructure'
      ];
    } else if (filename.includes('agri') || filename.includes('punjab')) {
      return [
        'Evaluate agricultural crop vigor and NDVI',
        'Detect potential moisture stress zones',
        'Calculate healthy vegetation acreage',
        'Delineate active cropland parcels'
      ];
    } else if (selectedImage.modality === 'SAR' || filename.includes('sar')) {
      return [
        'Analyze microwave C-band backscatter returns',
        'Cross-examine with Optical Sentinel-2 pair',
        'Detect surface roughness and dielectric boundaries',
        'Penetrate cloud layer to confirm water surfaces'
      ];
    }
    return [
      'Describe this scene and dominant land cover',
      'Highlight water bodies and compute area',
      'Show built-up infrastructure and roads',
      'Run 7-class land cover semantic segmentation'
    ];
  };

  const suggestions = getSuggestions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSendQuery(query.trim(), 'text');
    setQuery('');
  };

  const handleVoiceTranscript = (text: string) => {
    setQuery(text);
    onSendQuery(text, 'voice');
  };

  return (
    <div className="space-y-2 select-none">
      {/* Smart Contextual Suggestions Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
        <span className="flex items-center gap-1 text-gis-accent font-semibold shrink-0 pl-1">
          <Sparkles className="w-3 h-3" />
        </span>
        {suggestions.map((sug, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading}
            onClick={() => onSendQuery(sug, 'suggestion')}
            className="px-2.5 py-1 rounded-full bg-gis-panel hover:bg-gis-hover border border-gis-border hover:border-gis-accent/40 text-gis-textBright text-[11px] whitespace-nowrap transition shrink-0"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Main Query Input Bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            placeholder={isLoading ? t('explore.processing') : t('explore.askPlaceholder')}
            className="w-full bg-gis-surface border border-gis-border rounded-md px-3 py-2 text-xs text-gis-textBright placeholder-gis-textMuted/60 focus:outline-none focus:border-gis-accent transition pr-10 shadow-inner"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-gis-accent animate-spin" />
            </div>
          )}
        </div>

        {/* Voice Input Button */}
        <VoiceInput onTranscript={handleVoiceTranscript} disabled={isLoading} />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="p-2 rounded-md bg-gis-accent hover:bg-gis-accentCyan text-white disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center shrink-0 shadow-sm"
          title="Execute Query"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
