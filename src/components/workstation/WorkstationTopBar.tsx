import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Radio, 
  Search, 
  Calendar, 
  Cloud, 
  User, 
  Settings as SettingsIcon, 
  ChevronDown,
  Layers,
  Sparkles,
  Home
} from 'lucide-react';

interface WorkstationTopBarProps {
  selectedSensor: 'Sentinel-2' | 'Sentinel-1' | 'Multimodal';
  onSelectSensor: (sensor: 'Sentinel-2' | 'Sentinel-1' | 'Multimodal') => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  cloudCover: number;
  tileId: string;
  onSearchSelect: (query: string) => void;
  onGenerateReport?: () => void;
  onSaveAnalysis?: () => void;
}

export const WorkstationTopBar: React.FC<WorkstationTopBarProps> = ({
  selectedSensor,
  onSelectSensor,
  selectedDate,
  onSelectDate,
  cloudCover,
  tileId,
  onSearchSelect,
  onGenerateReport,
  onSaveAnalysis
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const searchSuggestions = [
    { label: 'Dublin, Ireland (Flagship Demo)', coords: '53.3472, -6.2439', tile: '30UUE' },
    { label: 'Dublin Silicon Docks & Port', coords: '53.3440, -6.2300', tile: '30UUE' },
    { label: 'Bengaluru Urban Growth, India', coords: '12.95, 77.62', tile: '43PGN' },
    { label: 'Kerala Flood Inundation, India', coords: '9.98, 76.30', tile: '43PFR' },
    { label: 'Mumbai Coastal Radar SAR, India', coords: '18.96, 72.86', tile: '43QDA' },
    { label: 'Tile 30UUE (Sentinel-2 L2A)', coords: '53.3472, -6.2439', tile: '30UUE' }
  ];

  const availableDates = [
    { date: '08 Sep 2026', label: '08 Sep 2026 (Latest Sentinel-2 L2A • 0% Cloud)' },
    { date: '15 Sep 2023', label: '15 Sep 2023 (Historical Baseline • 1.2% Cloud)' },
    { date: '05 Mar 2026', label: '05 Mar 2026 (Bengaluru S2 MSI • 0.8% Cloud)' },
    { date: '18 Aug 2024', label: '18 Aug 2024 (Kerala Monsoon Crest • 4.8% Cloud)' }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSelect(searchQuery.trim());
      setShowSearchDropdown(false);
    }
  };

  return (
    <header className="h-14 bg-gis-bg border-b border-gis-border px-4 flex items-center justify-between select-none z-30 relative shrink-0">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 group hover:opacity-90 transition-opacity"
          title="Return to Dashboard Home"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gis-panel to-gis-border border border-gis-accent/40 flex items-center justify-center text-gis-accent shadow-sm shadow-gis-accent/20">
            <Radio className="w-4 h-4 text-gis-accent animate-pulse" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-wider text-gis-textBright">SATQUERY</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gis-accent/15 text-gis-accent border border-gis-accent/30 font-semibold">
                AI
              </span>
            </div>
            <span className="text-[10px] text-gis-textMuted tracking-tight hidden sm:inline">
              Multimodal Earth Observation Intelligence
            </span>
          </div>
        </button>

        <button
          onClick={() => navigate('/')}
          className="p-1.5 rounded text-gis-textMuted hover:text-gis-textBright hover:bg-gis-panel transition-colors ml-1"
          title="Onboarding & Workflow Selection"
        >
          <Home className="w-3.5 h-3.5" />
        </button>

        <div className="hidden xl:flex items-center gap-1.5 pl-3 border-l border-gis-border/70 text-xs">
          <span className="text-gis-textMuted">Project:</span>
          <span className="font-semibold text-gis-textBright">Satellite Analysis</span>
        </div>

        {/* Demo Indicator Tag */}
        <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded bg-gis-panel border border-gis-border text-[11px] font-mono text-gis-accent">
          <span className="w-1.5 h-1.5 rounded-full bg-gis-accent animate-ping" />
          <span>DEMO DATA • Tile {tileId}</span>
        </div>
      </div>

      {/* Center: Global Search Input */}
      <div className="flex-1 max-w-xl mx-4 relative">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-gis-textMuted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearchDropdown(true)}
            placeholder="Search location, coordinates (53.3472, -6.2439), Dublin, 30UUE..."
            className="w-full h-8 pl-9 pr-8 bg-gis-panel border border-gis-border rounded-lg text-xs text-gis-textBright placeholder-gis-textMuted/60 focus:outline-none focus:border-gis-accent focus:ring-1 focus:ring-gis-accent/30 font-mono transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gis-textMuted hover:text-gis-textBright"
            >
              &times;
            </button>
          )}
        </form>

        {/* Search Autocomplete Dropdown */}
        {showSearchDropdown && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowSearchDropdown(false)} 
            />
            <div className="absolute top-10 left-0 w-full bg-gis-panel border border-gis-border rounded-lg shadow-xl shadow-black/80 py-1 z-50 overflow-hidden">
              <div className="px-3 py-1 text-[10px] font-semibold text-gis-textMuted uppercase tracking-wider border-b border-gis-border/60">
                Suggested Remote Sensing Locations
              </div>
              {searchSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(item.coords);
                    onSearchSelect(item.coords);
                    setShowSearchDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-gis-hover flex items-center justify-between text-gis-textBright transition-colors group"
                >
                  <div className="flex flex-col">
                    <span className="font-medium group-hover:text-gis-accent transition-colors">{item.label}</span>
                    <span className="text-[10px] text-gis-textMuted font-mono">{item.coords}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gis-bg border border-gis-border text-gis-textMuted">
                    {item.tile}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right: Sensor, Date, Cloud, Profile Controls */}
      <div className="flex items-center gap-2.5">
        {/* Sensor Toggle: Optical vs SAR vs Multimodal */}
        <div className="flex items-center bg-gis-panel p-0.5 rounded-lg border border-gis-border">
          <button
            onClick={() => onSelectSensor('Sentinel-2')}
            className={`px-2 py-1 rounded text-xs font-medium transition-all ${
              selectedSensor === 'Sentinel-2'
                ? 'bg-gis-accent text-gis-bg font-semibold shadow-sm'
                : 'text-gis-textMuted hover:text-gis-textBright'
            }`}
            title="Sentinel-2 Multispectral Optical (10m - 60m bands)"
          >
            S-2 Optical
          </button>
          <button
            onClick={() => onSelectSensor('Sentinel-1')}
            className={`px-2 py-1 rounded text-xs font-medium transition-all ${
              selectedSensor === 'Sentinel-1'
                ? 'bg-gis-accent text-gis-bg font-semibold shadow-sm'
                : 'text-gis-textMuted hover:text-gis-textBright'
            }`}
            title="Sentinel-1 C-Band SAR Synthetic Aperture Radar"
          >
            S-1 SAR
          </button>
          <button
            onClick={() => onSelectSensor('Multimodal')}
            className={`px-2 py-1 rounded text-xs font-medium transition-all ${
              selectedSensor === 'Multimodal'
                ? 'bg-gis-accent text-gis-bg font-semibold shadow-sm'
                : 'text-gis-textMuted hover:text-gis-textBright'
            }`}
            title="Multimodal Fusion: Simultaneous S-1 SAR + S-2 Optical"
          >
            S-1 + S-2
          </button>
        </div>

        {/* Date Selector */}
        <div className="relative">
          <button
            onClick={() => setShowDateDropdown(!showDateDropdown)}
            className="h-8 px-2.5 bg-gis-panel border border-gis-border hover:border-gis-border/80 rounded-lg text-xs font-mono text-gis-textBright flex items-center gap-1.5 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-gis-accent" />
            <span>{selectedDate}</span>
            <ChevronDown className="w-3 h-3 text-gis-textMuted" />
          </button>

          {showDateDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDateDropdown(false)} />
              <div className="absolute right-0 top-10 w-64 bg-gis-panel border border-gis-border rounded-lg shadow-xl shadow-black/80 py-1 z-50">
                <div className="px-3 py-1 text-[10px] font-semibold text-gis-textMuted uppercase tracking-wider border-b border-gis-border/60">
                  Select Acquisition Scene
                </div>
                {availableDates.map((d, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectDate(d.date);
                      setShowDateDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-gis-hover flex items-center justify-between transition-colors ${
                      selectedDate === d.date ? 'text-gis-accent bg-gis-accent/10 font-semibold' : 'text-gis-textBright'
                    }`}
                  >
                    <span>{d.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Cloud Coverage Indicator */}
        <div 
          className="h-8 px-2.5 bg-gis-panel border border-gis-border rounded-lg text-xs font-mono text-gis-textBright hidden md:flex items-center gap-1.5"
          title={`Cloud Cover: ${cloudCover}%`}
        >
          <Cloud className="w-3.5 h-3.5 text-gis-textMuted" />
          <span>{cloudCover}%</span>
        </div>

        {/* Quick Actions: Save Analysis & Generate PDF */}
        {onGenerateReport && (
          <button
            onClick={onGenerateReport}
            className="h-8 px-2.5 bg-[#17212B] hover:bg-[#1E2B38] border border-[#283541] hover:border-[#38D9D1]/50 rounded-lg text-xs font-medium text-[#F5F7FA] hidden lg:flex items-center gap-1.5 transition-all shadow-sm"
            title="Generate & Export PDF Intelligence Dossier"
          >
            <span className="w-2 h-2 rounded-full bg-[#38D9D1]" />
            <span>Export Report</span>
          </button>
        )}

        {/* Settings & User Icons */}
        <button 
          onClick={() => navigate('/settings')}
          className="w-8 h-8 rounded-lg bg-gis-panel border border-gis-border flex items-center justify-center text-gis-textMuted hover:text-gis-textBright hover:border-gis-accent/40 transition-colors"
          title="Geospatial Settings & Model Registry"
        >
          <SettingsIcon className="w-3.5 h-3.5" />
        </button>

        <div 
          className="w-8 h-8 rounded-lg bg-gradient-to-br from-gis-panel to-gis-border border border-gis-accent/30 flex items-center justify-center text-gis-accent font-mono text-xs font-bold"
          title="Satellite Analyst Profile"
        >
          SQ
        </div>
      </div>
    </header>
  );
};
