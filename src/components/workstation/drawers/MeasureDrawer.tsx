import React, { useState } from 'react';
import { Ruler, X, Trash2, Check } from 'lucide-react';

interface MeasureDrawerProps {
  onClose: () => void;
  activeMeasurement: boolean;
  onToggleMeasurement: (active: boolean) => void;
  measuredResult: {
    area_hectares: number;
    area_sqkm: number;
    perimeter_km: number;
    distance_m?: number;
  } | null;
  onClearMeasurement: () => void;
}

export const MeasureDrawer: React.FC<MeasureDrawerProps> = ({
  onClose,
  activeMeasurement,
  onToggleMeasurement,
  measuredResult,
  onClearMeasurement
}) => {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

  return (
    <div className="w-80 bg-gis-panel border-r border-gis-border h-full flex flex-col z-20 shadow-2xl shadow-black/80 animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="p-3 border-b border-gis-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4 text-gis-accent" />
          <h3 className="font-semibold text-xs text-gis-textBright uppercase tracking-wider">
            Geodesic Measurement
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
        {/* Trigger Tool */}
        <div className="p-3 rounded-lg bg-gis-bg border border-gis-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gis-textBright">Measurement Tool</span>
            <button
              onClick={() => onToggleMeasurement(!activeMeasurement)}
              className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                activeMeasurement
                  ? 'bg-gis-accent text-gis-bg'
                  : 'bg-gis-panel border border-gis-border text-gis-textBright hover:border-gis-accent'
              }`}
            >
              {activeMeasurement ? 'MEASURING (ACTIVE)' : 'START MEASURING'}
            </button>
          </div>
          <p className="text-[11px] text-gis-textMuted">
            Click 3 or more points on the satellite image to calculate geodesic area, perimeter, and polygon bounding envelope.
          </p>
        </div>

        {/* Results Card */}
        {measuredResult ? (
          <div className="p-3 rounded-lg bg-gis-panel border border-gis-border space-y-2.5">
            <span className="text-[10px] text-gis-textMuted uppercase font-semibold">Calculated Metrics</span>

            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="p-2 rounded bg-gis-bg border border-gis-border flex flex-col">
                <span className="text-[10px] text-gis-textMuted">Area (Hectares)</span>
                <span className="font-bold text-gis-accent text-sm mt-0.5">
                  {measuredResult.area_hectares.toFixed(2)} ha
                </span>
              </div>
              <div className="p-2 rounded bg-gis-bg border border-gis-border flex flex-col">
                <span className="text-[10px] text-gis-textMuted">Area (Sq Km)</span>
                <span className="font-bold text-gis-accent text-sm mt-0.5">
                  {measuredResult.area_sqkm.toFixed(3)} km²
                </span>
              </div>
              <div className="p-2 rounded bg-gis-bg border border-gis-border flex flex-col">
                <span className="text-[10px] text-gis-textMuted">Perimeter</span>
                <span className="font-bold text-gis-textBright text-sm mt-0.5">
                  {measuredResult.perimeter_km.toFixed(2)} km
                </span>
              </div>
              <div className="p-2 rounded bg-gis-bg border border-gis-border flex flex-col">
                <span className="text-[10px] text-gis-textMuted">Area (Sq Meters)</span>
                <span className="font-bold text-gis-textBright text-sm mt-0.5">
                  {(measuredResult.area_hectares * 10000).toLocaleString()} m²
                </span>
              </div>
            </div>

            <button
              onClick={onClearMeasurement}
              className="w-full mt-1 py-1.5 rounded bg-gis-danger/10 hover:bg-gis-danger/20 border border-gis-danger/30 text-gis-danger text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset Measurement
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-gis-panel border border-gis-border text-center text-gis-textMuted space-y-1">
            <Ruler className="w-6 h-6 text-gis-textMuted/40 mx-auto mb-1" />
            <span className="text-xs">No active measurement</span>
            <p className="text-[10px] text-gis-textMuted/70">Enable the tool and click points on the map.</p>
          </div>
        )}
      </div>
    </div>
  );
};
