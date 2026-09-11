import React from 'react';
import { ShieldCheck, Radar, Satellite, Zap, CheckCircle2 } from 'lucide-react';

interface SensorComparisonProps {
  opticalUrl: string;
  sarUrl: string;
  agreementPct: number;
  findingsOptical: string;
  findingsSar: string;
  synergyVerdict: string;
}

export const SensorComparison: React.FC<SensorComparisonProps> = ({
  opticalUrl,
  sarUrl,
  agreementPct,
  findingsOptical,
  findingsSar,
  synergyVerdict
}) => {
  return (
    <div className="space-y-4">
      {/* Agreement Metric Banner */}
      <div className="bg-gis-panel border border-gis-border rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-gis-accent" />
          <span className="text-xs font-semibold text-gis-textBright uppercase tracking-wider">
            Multi-Sensor Fusion Consensus
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gis-textMuted">Cross-Sensor Agreement:</span>
          <span className="px-2 py-0.5 rounded bg-gis-success/15 border border-gis-success/30 text-gis-success font-mono font-bold text-xs">
            {agreementPct}%
          </span>
        </div>
      </div>

      {/* Dual Sensor View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Optical Sensor Panel */}
        <div className="bg-gis-surface border border-gis-border rounded-lg overflow-hidden flex flex-col">
          <div className="p-2.5 bg-gis-panel border-b border-gis-border flex items-center justify-between">
            <span className="text-xs font-semibold text-gis-textBright flex items-center gap-1.5">
              <Satellite className="w-3.5 h-3.5 text-gis-accent" />
              <span>Sentinel-2 (Optical Channel)</span>
            </span>
            <span className="text-[10px] text-gis-textMuted font-mono">RGB + NIR (10m)</span>
          </div>
          <div className="h-64 bg-gis-bg relative overflow-hidden">
            <img src={opticalUrl} alt="Optical Imagery" className="w-full h-full object-cover" />
          </div>
          <div className="p-2.5 text-xs text-gis-textMuted leading-relaxed border-t border-gis-border bg-gis-surface">
            {findingsOptical}
          </div>
        </div>

        {/* SAR Sensor Panel */}
        <div className="bg-gis-surface border border-gis-border rounded-lg overflow-hidden flex flex-col">
          <div className="p-2.5 bg-gis-panel border-b border-gis-border flex items-center justify-between">
            <span className="text-xs font-semibold text-gis-textBright flex items-center gap-1.5">
              <Radar className="w-3.5 h-3.5 text-gis-sar" />
              <span>Sentinel-1 (C-SAR Radar Channel)</span>
            </span>
            <span className="text-[10px] text-gis-textMuted font-mono">VV + VH Backscatter</span>
          </div>
          <div className="h-64 bg-gis-bg relative overflow-hidden">
            <img src={sarUrl} alt="SAR Imagery" className="w-full h-full object-cover" />
          </div>
          <div className="p-2.5 text-xs text-gis-textMuted leading-relaxed border-t border-gis-border bg-gis-surface">
            {findingsSar}
          </div>
        </div>
      </div>

      {/* Joint Synergy Verdict Card */}
      <div className="p-3.5 bg-gis-surface border border-gis-border rounded-lg space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-gis-accentCyan uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-gis-accent" />
          <span>Cross-Modality Evidence Fusion</span>
        </div>
        <p className="text-xs text-gis-textBright leading-relaxed">
          {synergyVerdict}
        </p>
      </div>
    </div>
  );
};
