import React, { useState } from 'react';
import { Target, X, Check, Eye, Sparkles } from 'lucide-react';

interface ObjectType {
  id: string;
  label: string;
  count: number;
  area_ha: number;
  confidence: number;
  color: string;
}

interface DetectObjectsDrawerProps {
  onClose: () => void;
  onDetectObject: (objectType: string) => void;
}

export const DetectObjectsDrawer: React.FC<DetectObjectsDrawerProps> = ({
  onClose,
  onDetectObject
}) => {
  const [selectedTarget, setSelectedTarget] = useState<string>('buildings');

  const targets: ObjectType[] = [
    { id: 'buildings', label: 'Buildings & Structures', count: 1248, area_ha: 482.0, confidence: 91.4, color: '#FF6B6B' },
    { id: 'water', label: 'Water Reservoirs & Rivers', count: 18, area_ha: 32.4, confidence: 96.2, color: '#38D9D1' },
    { id: 'roads', label: 'Road Networks & Arterials', count: 420, area_ha: 94.6, confidence: 89.0, color: '#6EA8FE' },
    { id: 'trees', label: 'Tree Canopy & Forest Clusters', count: 864, area_ha: 481.2, confidence: 93.5, color: '#55D187' },
    { id: 'construction', label: 'Active Construction Sites', count: 34, area_ha: 14.8, confidence: 88.7, color: '#F4C95D' },
    { id: 'farmland', label: 'Agricultural Parcels & Fields', count: 112, area_ha: 240.5, confidence: 92.1, color: '#F59E0B' },
    { id: 'flooded', label: 'Flooded / Submerged Lowlands', count: 12, area_ha: 68.2, confidence: 94.8, color: '#0EA5E9' }
  ];

  const handleSelect = (t: ObjectType) => {
    setSelectedTarget(t.id);
    onDetectObject(t.id);
  };

  return (
    <div className="w-80 bg-[#121A22] border-r border-[#283541] h-full flex flex-col z-20 shadow-2xl shadow-black/80 animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="p-3 border-b border-[#283541] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#38D9D1]" />
          <h3 className="font-semibold text-xs text-[#F5F7FA] uppercase tracking-wider">
            AI Object Highlighting
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-[#9AA6B2] hover:text-[#F5F7FA] hover:bg-[#17212B] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="p-3 rounded-lg bg-[#0D1117] border border-[#283541] space-y-1 text-xs">
          <span className="text-[#38D9D1] font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Neural Feature Segmentation
          </span>
          <p className="text-[11px] text-[#9AA6B2] leading-relaxed">
            Select a feature class to isolate spatial polygons and calculate surface coverage across the active satellite scene.
          </p>
        </div>

        {/* Target Objects List */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-[#9AA6B2] uppercase font-semibold tracking-wider">
            Supported Target Classes
          </span>

          {targets.map((t) => {
            const isSelected = selectedTarget === t.id;

            return (
              <button
                key={t.id}
                onClick={() => handleSelect(t)}
                className={`w-full p-2.5 rounded-lg border text-left transition-all flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-[#17212B] border-[#38D9D1] text-[#F5F7FA] shadow-sm'
                    : 'bg-[#0D1117] border-[#283541] hover:border-[#283541]/90 text-[#F5F7FA] hover:bg-[#151D26]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="font-medium text-xs text-[#F5F7FA]">{t.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#38D9D1] font-bold">
                    {t.confidence}% Conf
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#9AA6B2] pt-1 border-t border-[#283541]/50">
                  <span>Detected: {t.count.toLocaleString()}</span>
                  <span>Total Area: {t.area_ha.toFixed(1)} ha</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
