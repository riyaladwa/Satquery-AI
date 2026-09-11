import React, { useState } from 'react';
import { AlertTriangle, Flame, Droplets, Wind, Mountain, Activity, X, Check, ArrowRight } from 'lucide-react';

interface DisasterType {
  id: string;
  name: string;
  icon: any;
  sensorWorkflow: string;
  description: string;
  metricLabel: string;
  metricValue: string;
  affectedArea: string;
  confidence: number;
}

interface DisasterModeDrawerProps {
  onClose: () => void;
  onActivateDisasterWorkflow: (disasterId: string) => void;
}

export const DisasterModeDrawer: React.FC<DisasterModeDrawerProps> = ({
  onClose,
  onActivateDisasterWorkflow
}) => {
  const [selectedDisaster, setSelectedDisaster] = useState<string>('flood');

  const disasters: DisasterType[] = [
    {
      id: 'flood',
      name: 'Flood & Inundation',
      icon: Droplets,
      sensorWorkflow: 'Sentinel-1 SAR (VV/VH) + Sentinel-2 NDWI',
      description: 'Penetrates cloud cover using C-band radar backscatter to delineate submerged lowland basins and standing water boundaries.',
      metricLabel: 'Inundated Area',
      metricValue: '68.4 ha (+24.1%)',
      affectedArea: '68.4 hectares (0.68 km²)',
      confidence: 94.8
    },
    {
      id: 'wildfire',
      name: 'Wildfire Burn Severity',
      icon: Flame,
      sensorWorkflow: 'Sentinel-2 NBR (B08/B12) Differencing',
      description: 'Analyzes Normalized Burn Ratio drop between pre-fire and post-fire passes to categorize high, moderate, and low burn severity.',
      metricLabel: 'Burn Scars',
      metricValue: '142.0 ha',
      affectedArea: '142.0 hectares (1.42 km²)',
      confidence: 93.1
    },
    {
      id: 'drought',
      name: 'Drought & Moisture Stress',
      icon: AlertTriangle,
      sensorWorkflow: 'Sentinel-2 NDDI + SWIR Soil Moisture',
      description: 'Combines Normalized Difference Drought Index with SWIR water absorption to identify depleted reservoirs and crop water deficits.',
      metricLabel: 'Severe Drought Zone',
      metricValue: '310.5 ha',
      affectedArea: '310.5 hectares',
      confidence: 89.5
    },
    {
      id: 'landslide',
      name: 'Landslide & Mudflow',
      icon: Mountain,
      sensorWorkflow: 'Optical Multi-temporal Co-registration',
      description: 'Identifies slope failure, scarp displacement, and debris flow deposition along mountain valleys.',
      metricLabel: 'Displaced Slope',
      metricValue: '18.2 ha',
      affectedArea: '18.2 hectares',
      confidence: 91.0
    },
    {
      id: 'cyclone',
      name: 'Cyclone / Storm Surge',
      icon: Wind,
      sensorWorkflow: 'Sentinel-1 High-Wind Marine Backscatter',
      description: 'Maps coastal erosion, sea storm surge intrusion, and roof destruction across exposed settlements.',
      metricLabel: 'Surge Inundation',
      metricValue: '95.4 ha',
      affectedArea: '95.4 hectares',
      confidence: 90.2
    },
    {
      id: 'earthquake',
      name: 'Earthquake Structural Damage',
      icon: Activity,
      sensorWorkflow: 'SAR InSAR Interferometric Coherence',
      description: 'Calculates phase decorrelation and microwave backscatter disruption in dense built-up zones.',
      metricLabel: 'Damaged Blocks',
      metricValue: '42 Zones',
      affectedArea: '38.6 hectares',
      confidence: 88.4
    }
  ];

  const current = disasters.find(d => d.id === selectedDisaster) || disasters[0];

  const handleApply = (id: string) => {
    setSelectedDisaster(id);
    onActivateDisasterWorkflow(id);
  };

  return (
    <div className="w-80 bg-[#121A22] border-r border-[#283541] h-full flex flex-col z-20 shadow-2xl shadow-black/80 animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="p-3 border-b border-[#283541] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#FF6B6B]" />
          <h3 className="font-semibold text-xs text-[#F5F7FA] uppercase tracking-wider">
            Disaster Analysis Mode
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
        {/* Disaster Type Selector */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-[#9AA6B2] uppercase font-semibold tracking-wider">
            Select Hazard Model
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {disasters.map((d) => {
              const isSelected = selectedDisaster === d.id;
              const Icon = d.icon;

              return (
                <button
                  key={d.id}
                  onClick={() => handleApply(d.id)}
                  className={`p-2 rounded-lg border text-left transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#17212B] border-[#FF6B6B] text-[#F5F7FA] shadow-sm'
                      : 'bg-[#0D1117] border-[#283541] hover:border-[#283541]/90 text-[#9AA6B2] hover:bg-[#151D26]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#FF6B6B]' : ''}`} />
                  <span className="text-[11px] font-medium truncate">{d.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Disaster Workflow Card */}
        <div className="p-3.5 rounded-lg bg-[#0D1117] border border-[#283541] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F5F7FA]">{current.name} Assessment</span>
            <span className="text-[10px] font-mono text-[#55D187] font-semibold">
              {current.confidence}% Confidence
            </span>
          </div>

          <div className="text-[11px] font-mono text-[#38D9D1] bg-[#121A22] p-2 rounded border border-[#283541]">
            <span className="text-[#9AA6B2] block text-[9px] uppercase">Multimodal Pipeline</span>
            {current.sensorWorkflow}
          </div>

          <p className="text-xs text-[#9AA6B2] leading-relaxed">
            {current.description}
          </p>

          <div className="grid grid-cols-2 gap-2 font-mono text-xs pt-1 border-t border-[#283541]/60">
            <div className="p-2 rounded bg-[#121A22] border border-[#283541] flex flex-col">
              <span className="text-[9px] text-[#9AA6B2] uppercase">{current.metricLabel}</span>
              <span className="font-bold text-[#FF6B6B] mt-0.5">{current.metricValue}</span>
            </div>
            <div className="p-2 rounded bg-[#121A22] border border-[#283541] flex flex-col">
              <span className="text-[9px] text-[#9AA6B2] uppercase">Spatial Footprint</span>
              <span className="font-bold text-[#F5F7FA] mt-0.5">{current.affectedArea}</span>
            </div>
          </div>

          <button
            onClick={() => onActivateDisasterWorkflow(current.id)}
            className="w-full mt-2 py-2 rounded-lg bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-[#FF6B6B]/20"
          >
            <span>Run {current.name} Workflow</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
