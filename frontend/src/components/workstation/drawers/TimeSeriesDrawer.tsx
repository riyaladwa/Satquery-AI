import React, { useState, useEffect } from 'react';
import { LineChart as ChartIcon, X, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '../../../services/api';
import { TimeSeriesData } from '../../../types';

interface TimeSeriesDrawerProps {
  onClose: () => void;
  currentYear: string;
  onSelectYear: (year: string) => void;
  tileId: string;
}

export const TimeSeriesDrawer: React.FC<TimeSeriesDrawerProps> = ({
  onClose,
  currentYear,
  onSelectYear,
  tileId
}) => {
  const [data, setData] = useState<TimeSeriesData | null>(null);
  const [activeMetric, setActiveMetric] = useState<'ndvi' | 'built_up' | 'water'>('built_up');

  useEffect(() => {
    fetchTimeSeries();
  }, [tileId]);

  const fetchTimeSeries = async () => {
    try {
      const res = await api.getTimeSeries({ tile: tileId });
      setData(res);
    } catch (err) {
      console.error('Failed to fetch time series:', err);
    }
  };

  const years = ['2022', '2023', '2024', '2025', '2026'];

  return (
    <div className="w-80 bg-gis-panel border-r border-gis-border h-full flex flex-col z-20 shadow-2xl shadow-black/80 animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="p-3 border-b border-gis-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChartIcon className="w-4 h-4 text-gis-accent" />
          <h3 className="font-semibold text-xs text-gis-textBright uppercase tracking-wider">
            Multi-Temporal Time Series
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
        {/* Timeline Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-gis-textMuted uppercase font-semibold">Temporal Timeline (2022 - 2026)</label>
          <div className="grid grid-cols-5 gap-1">
            {years.map((yr) => {
              const isSelected = currentYear.includes(yr);

              return (
                <button
                  key={yr}
                  onClick={() => onSelectYear(yr)}
                  className={`py-1.5 text-xs font-mono font-medium rounded transition-colors ${
                    isSelected
                      ? 'bg-gis-accent text-gis-bg font-bold shadow-sm'
                      : 'bg-gis-bg border border-gis-border text-gis-textMuted hover:text-gis-textBright hover:border-gis-border/80'
                  }`}
                >
                  {yr}
                </button>
              );
            })}
          </div>
        </div>

        {/* Metric Switcher */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-gis-textMuted uppercase font-semibold">Trend Metric</label>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: 'built_up', label: 'Built-up Area' },
              { id: 'ndvi', label: 'NDVI Index' },
              { id: 'water', label: 'Water Area' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveMetric(m.id as any)}
                className={`py-1 text-[10px] font-medium rounded transition-colors ${
                  activeMetric === m.id
                    ? 'bg-gis-accent/20 text-gis-accent border border-gis-accent/40 font-semibold'
                    : 'bg-gis-panel border border-gis-border text-gis-textMuted hover:text-gis-textBright'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Minimal Dark Trend Bar Chart */}
        {data && (
          <div className="p-3 rounded-lg bg-gis-bg border border-gis-border space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gis-textMuted uppercase text-[10px]">
                {activeMetric === 'built_up' ? 'Built-up (km²)' : activeMetric === 'ndvi' ? 'Mean NDVI' : 'Water Extent (ha)'}
              </span>
              <span className="text-gis-accent font-bold">
                {activeMetric === 'built_up' ? '+14.2% Growth' : activeMetric === 'ndvi' ? '-8.7% Loss' : 'Stable'}
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div className="space-y-2">
              {data.data_points.map((pt) => {
                const val = activeMetric === 'built_up' 
                  ? pt.built_up_km2 
                  : activeMetric === 'ndvi' 
                  ? pt.ndvi 
                  : pt.water_area_ha;

                const maxVal = activeMetric === 'built_up' ? 60 : activeMetric === 'ndvi' ? 1.0 : 400;
                const pct = Math.min(100, Math.max(10, (val / maxVal) * 100));
                const isSelected = currentYear.includes(pt.year);

                return (
                  <div key={pt.year} className="space-y-0.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className={isSelected ? 'text-gis-accent font-bold' : 'text-gis-textMuted'}>{pt.year}</span>
                      <span className={isSelected ? 'text-gis-accent font-bold' : 'text-gis-textBright'}>
                        {val} {activeMetric === 'built_up' ? 'km²' : activeMetric === 'water' ? 'ha' : ''}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gis-panel rounded-full overflow-hidden border border-gis-border/60">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isSelected ? 'bg-gis-accent' : 'bg-gis-accent/40'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Trend Summary */}
            <p className="text-[11px] text-gis-textMuted leading-relaxed pt-2 border-t border-gis-border/50">
              {data.trend_summary}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
