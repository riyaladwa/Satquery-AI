import React, { useState } from 'react';
import { Sprout, X, Droplet, Activity, Check, ArrowRight, ShieldCheck } from 'lucide-react';

interface AgriModeDrawerProps {
  onClose: () => void;
  onApplyAgriWorkflow: (workflow: string) => void;
}

export const AgriModeDrawer: React.FC<AgriModeDrawerProps> = ({
  onClose,
  onApplyAgriWorkflow
}) => {
  const [activeTab, setActiveTab] = useState<'health' | 'water' | 'stress'>('health');

  const parcels = [
    { id: 'p1', name: 'Field Sector A (Wheat)', status: 'Healthy', ndvi: 0.74, ndwi: -0.12, area_ha: 42.8, color: '#55D187' },
    { id: 'p2', name: 'Field Sector B (Barley)', status: 'Moderate', ndvi: 0.58, ndwi: -0.24, area_ha: 38.2, color: '#F4C95D' },
    { id: 'p3', name: 'Field Sector C (Canola)', status: 'Healthy', ndvi: 0.71, ndwi: -0.15, area_ha: 29.5, color: '#55D187' },
    { id: 'p4', name: 'Field Sector D (Fallow/Dry)', status: 'Stressed', ndvi: 0.32, ndwi: -0.42, area_ha: 14.6, color: '#FF6B6B' }
  ];

  return (
    <div className="w-80 bg-[#121A22] border-r border-[#283541] h-full flex flex-col z-20 shadow-2xl shadow-black/80 animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="p-3 border-b border-[#283541] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sprout className="w-4 h-4 text-[#55D187]" />
          <h3 className="font-semibold text-xs text-[#F5F7FA] uppercase tracking-wider">
            Agriculture Monitoring
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
        {/* Metric Selector */}
        <div className="grid grid-cols-3 gap-1">
          {[
            { id: 'health', label: 'Vegetation' },
            { id: 'water', label: 'Water Index' },
            { id: 'stress', label: 'Crop Stress' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-1.5 text-[11px] font-medium rounded transition-colors ${
                activeTab === t.id
                  ? 'bg-[#55D187]/20 text-[#55D187] border border-[#55D187]/40 font-semibold'
                  : 'bg-[#0D1117] border border-[#283541] text-[#9AA6B2] hover:text-[#F5F7FA]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Health Summary Gauge */}
        <div className="p-3.5 rounded-lg bg-[#0D1117] border border-[#283541] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#9AA6B2] uppercase text-[10px]">Mean Scene NDVI</span>
            <span className="font-bold text-[#55D187] text-sm">0.68 (Healthy)</span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[10px] text-[#9AA6B2]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#55D187]" /> Healthy (72.3 ha)
              </span>
              <span className="font-mono text-[#F5F7FA]">58%</span>
            </div>
            <div className="flex justify-between text-[10px] text-[#9AA6B2]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#F4C95D]" /> Moderate (38.2 ha)
              </span>
              <span className="font-mono text-[#F5F7FA]">30%</span>
            </div>
            <div className="flex justify-between text-[10px] text-[#9AA6B2]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#FF6B6B]" /> Stressed (14.6 ha)
              </span>
              <span className="font-mono text-[#F5F7FA]">12%</span>
            </div>
          </div>
        </div>

        {/* Field Parcels List */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-[#9AA6B2] uppercase font-semibold tracking-wider">
            Monitored Field Parcels ({parcels.length})
          </span>

          {parcels.map((p) => (
            <div
              key={p.id}
              className="p-2.5 rounded-lg bg-[#0D1117] border border-[#283541] space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-[#F5F7FA]">{p.name}</span>
                <span
                  className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${p.color}20`, color: p.color, border: `1px solid ${p.color}40` }}
                >
                  {p.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-[#9AA6B2] pt-1 border-t border-[#283541]/40">
                <div>NDVI: <span className="text-[#F5F7FA] font-bold">{p.ndvi}</span></div>
                <div>NDWI: <span className="text-[#F5F7FA] font-bold">{p.ndwi}</span></div>
                <div className="text-right">{p.area_ha} ha</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => onApplyAgriWorkflow('crops')}
          className="w-full py-2 rounded-lg bg-[#55D187] hover:bg-[#55D187]/90 text-[#080B10] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-[#55D187]/20"
        >
          <span>Calculate Field Irrigation Deficits</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
