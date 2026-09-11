import React, { useState } from 'react';
import { Building2, X, TrendingUp, AlertCircle, Layers, CheckCircle2, ArrowUpRight, Compass } from 'lucide-react';

interface UrbanMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  positive: boolean;
  unit: string;
  details: string;
}

interface UrbanModeDrawerProps {
  onClose: () => void;
  onHighlightUrbanLayer?: (layerId: string) => void;
}

export const UrbanModeDrawer: React.FC<UrbanModeDrawerProps> = ({
  onClose,
  onHighlightUrbanLayer
}) => {
  const [selectedLayer, setSelectedLayer] = useState<string>('built_up');
  const [baselineYear, setBaselineYear] = useState<'2023' | '2024' | '2025'>('2023');

  const metrics: UrbanMetric[] = [
    {
      id: 'built_up',
      label: 'Impervious / Built-up Area',
      value: '142.5',
      change: '+14.2%',
      positive: false,
      unit: 'ha',
      details: 'Dense commercial and residential rooftops detected via NDBI & high SAR backscatter.'
    },
    {
      id: 'structures',
      label: 'Building Footprint Count',
      value: '1,420',
      change: '+184',
      positive: false,
      unit: 'units',
      details: 'Polygonal building outlines extracted with morphological dilation and edge enhancement.'
    },
    {
      id: 'roads',
      label: 'Transport Network Length',
      value: '38.4',
      change: '+4.2',
      positive: true,
      unit: 'km',
      details: 'Asphalt & paved arterial roadways identified through continuous linear spectral signatures.'
    },
    {
      id: 'construction',
      label: 'Active Construction Sites',
      value: '14',
      change: '+6 active',
      positive: false,
      unit: 'zones',
      details: 'Identified via high temporal SAR interferometric decorrelation and exposed soil signatures.'
    },
    {
      id: 'vegetation_loss',
      label: 'Vegetation Replaced by Urban',
      value: '-8.4',
      change: '-6.2%',
      positive: false,
      unit: 'ha',
      details: 'Net loss of tree canopy and grassland converted to paved ground surfaces since baseline.'
    }
  ];

  const handleSelectLayer = (id: string) => {
    setSelectedLayer(id);
    onHighlightUrbanLayer?.(id);
  };

  return (
    <div className="w-80 bg-[#121A22] border-r border-[#283541] h-full flex flex-col z-20 shadow-2xl shadow-black/80 animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="p-3 border-b border-[#283541] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#38D9D1]" />
          <h3 className="font-semibold text-xs text-[#F5F7FA] uppercase tracking-wider">
            Urban Growth & Infrastructure
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-[#9AA6B2] hover:text-[#F5F7FA] hover:bg-[#17212B] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {/* Baseline Comparison Banner */}
        <div className="p-3 rounded-lg bg-[#0D1117] border border-[#283541] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#9AA6B2] tracking-wider">
              Growth vs Baseline
            </span>
            <div className="flex gap-1">
              {(['2023', '2024', '2025'] as const).map((year) => (
                <button
                  key={year}
                  onClick={() => setBaselineYear(year)}
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                    baselineYear === year
                      ? 'bg-[#38D9D1] text-[#080B10] font-bold'
                      : 'bg-[#17212B] text-[#9AA6B2] hover:text-[#F5F7FA]'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="text-xl font-bold font-mono text-[#F5F7FA] flex items-center gap-1.5">
                +14.2%
                <TrendingUp className="w-4 h-4 text-[#E11D48]" />
              </div>
              <div className="text-[10px] text-[#9AA6B2]">
                Net Urban Expansion ({baselineYear} &rarr; 2026)
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#E11D48]/15 text-[#E11D48] border border-[#E11D48]/30">
                HIGH RATE
              </span>
              <div className="text-[10px] text-[#9AA6B2] mt-0.5">+17.8 ha total</div>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="space-y-2">
          <span className="text-[10px] text-[#9AA6B2] uppercase font-semibold tracking-wider">
            Infrastructure Metrics
          </span>

          {metrics.map((m) => {
            const isSelected = selectedLayer === m.id;
            return (
              <div
                key={m.id}
                onClick={() => handleSelectLayer(m.id)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#17212B] border-[#38D9D1] shadow-sm'
                    : 'bg-[#0D1117] border-[#283541] hover:border-[#283541]/80 hover:bg-[#151D26]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#F5F7FA]">{m.label}</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-xs font-bold text-[#F5F7FA]">
                      {m.value} <span className="text-[10px] font-normal text-[#9AA6B2]">{m.unit}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-[#38D9D1]">{m.change}</span>
                  </div>
                </div>

                <p className="text-[10px] text-[#9AA6B2] mt-1 line-clamp-2 leading-relaxed">
                  {m.details}
                </p>

                {isSelected && (
                  <div className="mt-2 pt-2 border-t border-[#283541] flex items-center justify-between text-[10px]">
                    <span className="text-[#38D9D1] flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Active on Map
                    </span>
                    <span className="text-[#9AA6B2] font-mono text-[9px]">S1 SAR + S2 NDBI</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* AI Insight Box */}
        <div className="p-3 rounded-lg bg-[#17212B]/70 border border-[#38D9D1]/30 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-[#38D9D1] font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>AI Urban Morphology Assessment</span>
          </div>
          <p className="text-[11px] text-[#C4D0DC] leading-relaxed">
            Major expansion is clustered east along the Dublin Port logistics corridor. Cross-referencing Sentinel-1 SAR coherence confirms high structural stability in completed warehouse footprints, while 3 active construction parcels show continuous earthmoving disturbance.
          </p>
        </div>
      </div>
    </div>
  );
};
