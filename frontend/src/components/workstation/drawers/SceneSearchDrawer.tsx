import React, { useState, useEffect } from 'react';
import { Search, Filter, Cloud, Calendar, Eye, Sparkles, X, Check } from 'lucide-react';
import { api } from '../../../services/api';
import { SceneCard } from '../../../types';

interface SceneSearchDrawerProps {
  onClose: () => void;
  onSelectScene: (scene: SceneCard, autoAnalyze?: boolean) => void;
  currentSceneId?: string;
}

export const SceneSearchDrawer: React.FC<SceneSearchDrawerProps> = ({
  onClose,
  onSelectScene,
  currentSceneId
}) => {
  const [scenes, setScenes] = useState<SceneCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSatellite, setSelectedSatellite] = useState<string>('All');
  const [maxCloud, setMaxCloud] = useState<number>(100);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchScenes();
  }, [selectedSatellite, maxCloud]);

  const fetchScenes = async () => {
    setLoading(true);
    try {
      const data = await api.searchScenes({
        satellite: selectedSatellite === 'All' ? undefined : selectedSatellite,
        max_cloud: maxCloud,
        query: searchQuery.trim() || undefined
      });
      setScenes(data);
    } catch (err) {
      console.error('Failed to fetch scenes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchScenes();
  };

  return (
    <div className="w-80 bg-gis-panel border-r border-gis-border h-full flex flex-col z-20 shadow-2xl shadow-black/80 animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="p-3 border-b border-gis-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gis-accent" />
          <h3 className="font-semibold text-xs text-gis-textBright uppercase tracking-wider">
            Satellite Scene Search
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-gis-textMuted hover:text-gis-textBright hover:bg-gis-hover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filters Section */}
      <div className="p-3 border-b border-gis-border space-y-3 bg-gis-bg/40">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tile, city, scene ID..."
            className="w-full h-8 pl-3 pr-8 bg-gis-panel border border-gis-border rounded-lg text-xs text-gis-textBright placeholder-gis-textMuted focus:outline-none focus:border-gis-accent"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gis-textMuted hover:text-gis-accent"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Satellite Filter */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-semibold text-gis-textMuted">Satellite Sensor</label>
          <div className="grid grid-cols-3 gap-1">
            {['All', 'Sentinel-2', 'Sentinel-1'].map((sat) => (
              <button
                key={sat}
                type="button"
                onClick={() => setSelectedSatellite(sat)}
                className={`py-1 text-[11px] rounded font-medium transition-colors ${
                  selectedSatellite === sat
                    ? 'bg-gis-accent/20 text-gis-accent border border-gis-accent/40'
                    : 'bg-gis-panel border border-gis-border text-gis-textMuted hover:text-gis-textBright'
                }`}
              >
                {sat === 'Sentinel-2' ? 'S2 Optical' : sat === 'Sentinel-1' ? 'S1 SAR' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Cloud Cover Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-gis-textMuted">
            <span>Max Cloud Coverage</span>
            <span className="font-mono text-gis-textBright">{maxCloud}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={maxCloud}
            onChange={(e) => setMaxCloud(Number(e.target.value))}
            className="w-full h-1 bg-gis-border rounded-lg appearance-none cursor-pointer accent-gis-accent"
          />
        </div>
      </div>

      {/* Scene Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        <div className="text-[10px] text-gis-textMuted uppercase font-semibold tracking-wider flex justify-between">
          <span>Available Scenes ({scenes.length})</span>
          {loading && <span className="text-gis-accent animate-pulse">Searching...</span>}
        </div>

        {scenes.map((scene) => {
          const isSelected = currentSceneId === scene.id;

          return (
            <div
              key={scene.id}
              className={`p-2.5 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-gis-accent/10 border-gis-accent/50 shadow-sm shadow-gis-accent/10'
                  : 'bg-gis-panel border-gis-border hover:border-gis-border/80 hover:bg-gis-hover'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {/* Scene Preview Thumbnail */}
                <div className="w-14 h-14 rounded bg-gis-bg border border-gis-border overflow-hidden shrink-0 relative">
                  <img
                    src={scene.thumbnail_url}
                    alt={scene.tile}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className={`absolute bottom-0 left-0 right-0 text-[8px] font-mono text-center py-0.5 ${
                    scene.satellite === 'Sentinel-2' ? 'bg-gis-accent/80 text-gis-bg font-bold' : 'bg-gis-sar/80 text-white font-bold'
                  }`}>
                    {scene.satellite === 'Sentinel-2' ? 'OPTICAL' : 'SAR'}
                  </span>
                </div>

                {/* Scene Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gis-textBright font-mono">{scene.tile}</span>
                    <span className="text-[10px] font-mono text-gis-accent">{scene.product}</span>
                  </div>
                  <div className="text-[11px] text-gis-textBright mt-0.5">{scene.date}</div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-gis-textMuted font-mono">
                    <span className="flex items-center gap-1">
                      <Cloud className="w-2.5 h-2.5" />
                      {scene.cloud_cover}%
                    </span>
                    <span>•</span>
                    <span>{scene.resolution}</span>
                    {scene.polarization && (
                      <>
                        <span>•</span>
                        <span>{scene.polarization}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-2.5 pt-2 border-t border-gis-border/50 flex items-center justify-end gap-1.5">
                <button
                  onClick={() => onSelectScene(scene, false)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                    isSelected
                      ? 'bg-gis-accent text-gis-bg font-semibold'
                      : 'bg-gis-bg hover:bg-gis-border text-gis-textBright border border-gis-border'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  {isSelected ? 'Viewing' : 'View'}
                </button>
                <button
                  onClick={() => onSelectScene(scene, true)}
                  className="px-2.5 py-1 rounded text-[11px] font-medium bg-gradient-to-r from-gis-accent/20 to-gis-accentBlue/20 text-gis-accent border border-gis-accent/30 hover:bg-gis-accent/30 transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Analyze
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
