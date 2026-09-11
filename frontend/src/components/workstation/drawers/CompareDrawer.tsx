import React, { useState } from 'react';
import { SlidersHorizontal, X, ArrowLeftRight, TrendingUp, TrendingDown, Layers, Check } from 'lucide-react';

interface CompareDrawerProps {
  onClose: () => void;
  sliderPosition: number;
  onSliderChange: (val: number) => void;
  compareMode: 'slider' | 'split' | 'overlay';
  onCompareModeChange: (mode: 'slider' | 'split' | 'overlay') => void;
  showHeatmap: boolean;
  onToggleHeatmap: (show: boolean) => void;
  heatmapOpacity: number;
  onHeatmapOpacityChange: (val: number) => void;
}

export const CompareDrawer: React.FC<CompareDrawerProps> = ({
  onClose,
  sliderPosition,
  onSliderChange,
  compareMode,
  onCompareModeChange,
  showHeatmap,
  onToggleHeatmap,
  heatmapOpacity,
  onHeatmapOpacityChange
}) => {
  const [beforeYear, setBeforeYear] = useState('2023');
  const [afterYear, setAfterYear] = useState('2026');

  return (
    <div className="w-80 bg-gis-panel border-r border-gis-border h-full flex flex-col z-20 shadow-2xl shadow-black/80 animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="p-3 border-b border-gis-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gis-accent" />
          <h3 className="font-semibold text-xs text-gis-textBright uppercase tracking-wider">
            Bi-Temporal Change Analysis
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-gis-textMuted hover:text-gis-textBright hover:bg-gis-hover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {/* Date Selector */}
        <div className="p-2.5 rounded-lg bg-gis-bg border border-gis-border space-y-2">
          <span className="text-[10px] text-gis-textMuted uppercase font-semibold">Temporal Comparison Window</span>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-gis-textMuted">Before (Baseline)</label>
              <select
                value={beforeYear}
                onChange={(e) => setBeforeYear(e.target.value)}
                className="w-full h-8 px-2 bg-gis-panel border border-gis-border rounded text-xs font-mono text-gis-textBright focus:outline-none focus:border-gis-accent"
              >
                <option value="2022">12 Mar 2022</option>
                <option value="2023">15 Sep 2023</option>
                <option value="2024">18 Aug 2024</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gis-textMuted">After (Observation)</label>
              <select
                value={afterYear}
                onChange={(e) => setAfterYear(e.target.value)}
                className="w-full h-8 px-2 bg-gis-panel border border-gis-border rounded text-xs font-mono text-gis-textBright focus:outline-none focus:border-gis-accent"
              >
                <option value="2025">10 May 2025</option>
                <option value="2026">08 Sep 2026</option>
              </select>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-gis-textMuted uppercase font-semibold">Comparison Mode</label>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: 'slider', label: 'Swipe Slider' },
              { id: 'split', label: 'Split Screen' },
              { id: 'overlay', label: 'Alpha Blend' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => onCompareModeChange(m.id as any)}
                className={`py-1.5 text-[11px] font-medium rounded transition-colors ${
                  compareMode === m.id
                    ? 'bg-gis-accent/20 text-gis-accent border border-gis-accent/40 font-semibold'
                    : 'bg-gis-panel border border-gis-border text-gis-textMuted hover:text-gis-textBright'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Swipe Slider Position Control */}
        <div className="p-2.5 rounded-lg bg-gis-panel border border-gis-border space-y-2">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-gis-textMuted">{beforeYear} Baseline</span>
            <span className="text-gis-accent font-semibold">{sliderPosition}%</span>
            <span className="text-gis-textMuted">{afterYear} Current</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => onSliderChange(Number(e.target.value))}
            className="w-full h-1.5 bg-gis-bg rounded-lg appearance-none cursor-pointer accent-gis-accent"
          />
        </div>

        {/* AI Detected Change Statistics */}
        <div className="p-2.5 rounded-lg bg-gis-panel border border-gis-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gis-textMuted uppercase font-semibold tracking-wider">
              AI Change Vector Metrics
            </span>
            <span className="text-[9px] font-mono text-gis-accent">91% Confidence</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded bg-gis-bg border border-gis-border text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gis-danger" />
                <span className="text-gis-textBright font-medium">New Buildings / Urban</span>
              </div>
              <span className="text-gis-danger font-mono font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                +14.2%
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-gis-bg border border-gis-border text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gis-warning" />
                <span className="text-gis-textBright font-medium">Vegetation Loss</span>
              </div>
              <span className="text-gis-warning font-mono font-bold flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" />
                -8.7%
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-gis-bg border border-gis-border text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gis-accent" />
                <span className="text-gis-textBright font-medium">Water Extent Delta</span>
              </div>
              <span className="text-gis-accent font-mono font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                +3.2%
              </span>
            </div>
          </div>
        </div>

        {/* AI Change Heatmap Toggle & Opacity */}
        <div className="p-2.5 rounded-lg bg-gis-panel border border-gis-border space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gis-textMuted uppercase font-semibold tracking-wider">
              AI Change Heatmap
            </span>
            <button
              onClick={() => onToggleHeatmap(!showHeatmap)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                showHeatmap
                  ? 'bg-gis-accent text-gis-bg font-bold'
                  : 'bg-gis-bg border border-gis-border text-gis-textMuted'
              }`}
            >
              {showHeatmap ? 'ACTIVE' : 'OFF'}
            </button>
          </div>

          {showHeatmap && (
            <div className="space-y-2 pt-1 border-t border-gis-border/50">
              <div className="flex justify-between text-[10px] text-gis-textMuted font-mono">
                <span>Heatmap Opacity</span>
                <span>{Math.round(heatmapOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={heatmapOpacity * 100}
                onChange={(e) => onHeatmapOpacityChange(Number(e.target.value) / 100)}
                className="w-full h-1 bg-gis-bg rounded-lg appearance-none cursor-pointer accent-gis-accent"
              />

              {/* Scientific Heatmap Legend */}
              <div className="pt-1.5 space-y-1">
                <span className="text-[9px] text-gis-textMuted uppercase font-semibold">Change Intensity Legend</span>
                <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-center">
                  <div className="p-1 rounded bg-gis-bg text-gis-textMuted border border-gis-border">
                    <span className="w-2 h-2 rounded-full bg-gray-500 inline-block mr-1" />
                    None
                  </div>
                  <div className="p-1 rounded bg-gis-bg text-gis-textBright border border-gis-border">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block mr-1" />
                    Low
                  </div>
                  <div className="p-1 rounded bg-gis-bg text-gis-textBright border border-gis-border">
                    <span className="w-2 h-2 rounded-full bg-orange-500 inline-block mr-1" />
                    Mod
                  </div>
                  <div className="p-1 rounded bg-gis-bg text-gis-danger border border-gis-border font-bold">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block mr-1" />
                    High
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
