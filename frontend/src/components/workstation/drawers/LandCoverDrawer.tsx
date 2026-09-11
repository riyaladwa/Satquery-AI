import React, { useState } from 'react';
import { Globe2, X, Check, Eye, EyeOff } from 'lucide-react';

interface LandCoverClass {
  id: string;
  name: string;
  color: string;
  area_ha: number;
  percentage: number;
}

interface LandCoverDrawerProps {
  onClose: () => void;
  onHighlightClass?: (classId: string) => void;
}

export const LandCoverDrawer: React.FC<LandCoverDrawerProps> = ({
  onClose,
  onHighlightClass
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [unit, setUnit] = useState<'ha' | 'km2' | 'pct'>('ha');

  const classes: LandCoverClass[] = [
    { id: 'built_up', name: 'Built-up / Urban Structures', color: '#E11D48', area_ha: 142.5, percentage: 34.2 },
    { id: 'vegetation', name: 'Vegetation / Tree Canopy', color: '#10B981', area_ha: 118.8, percentage: 28.5 },
    { id: 'agriculture', name: 'Cropland & Agriculture', color: '#F59E0B', area_ha: 80.8, percentage: 19.4 },
    { id: 'water', name: 'Water Bodies & Marine Basin', color: '#0EA5E9', area_ha: 50.4, percentage: 12.1 },
    { id: 'forest', name: 'Forest & Woodland', color: '#059669', area_ha: 32.1, percentage: 7.7 },
    { id: 'bare_land', name: 'Bare Land & Soil Anomalies', color: '#8B5CF6', area_ha: 24.2, percentage: 5.8 },
    { id: 'roads', name: 'Roadways & Transport Corridors', color: '#94A3B8', area_ha: 18.6, percentage: 4.5 },
    { id: 'wetlands', name: 'Wetlands & Riparian Marshes', color: '#14B8A6', area_ha: 12.4, percentage: 3.0 }
  ];

  const totalAreaHa = classes.reduce((sum, c) => sum + c.area_ha, 0);

  const handleClassClick = (id: string) => {
    const next = selectedClassId === id ? null : id;
    setSelectedClassId(next);
    onHighlightClass?.(next || '');
  };

  return (
    <div className="w-80 bg-[#121A22] border-r border-[#283541] h-full flex flex-col z-20 shadow-2xl shadow-black/80 animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="p-3 border-b border-[#283541] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-[#38D9D1]" />
          <h3 className="font-semibold text-xs text-[#F5F7FA] uppercase tracking-wider">
            Land Cover Classification
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
        {/* Total Summary */}
        <div className="p-3 rounded-lg bg-[#0D1117] border border-[#283541] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#9AA6B2]">Total Classified Surface:</span>
            <span className="font-mono font-bold text-[#38D9D1]">
              {totalAreaHa.toFixed(1)} ha ({(totalAreaHa / 100).toFixed(2)} km²)
            </span>
          </div>

          {/* Mini Stacked Percentage Bar */}
          <div className="h-2 w-full rounded-full overflow-hidden flex bg-[#121A22]">
            {classes.map((c) => (
              <div
                key={c.id}
                style={{ width: `${c.percentage}%`, backgroundColor: c.color }}
                title={`${c.name}: ${c.percentage}%`}
              />
            ))}
          </div>

          <div className="flex justify-between items-center text-[10px] text-[#9AA6B2] pt-1">
            <span>Click any class to isolate on map</span>
            <div className="flex gap-1 font-mono">
              {(['ha', 'km2', 'pct'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`px-1 rounded uppercase ${
                    unit === u ? 'bg-[#38D9D1] text-[#080B10] font-bold' : 'text-[#9AA6B2]'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Classes List */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-[#9AA6B2] uppercase font-semibold tracking-wider">
            Surface Classes ({classes.length})
          </span>

          {classes.map((c) => {
            const isSelected = selectedClassId === c.id;
            const valStr = unit === 'ha'
              ? `${c.area_ha.toFixed(1)} ha`
              : unit === 'km2'
              ? `${(c.area_ha / 100).toFixed(2)} km²`
              : `${c.percentage}%`;

            return (
              <button
                key={c.id}
                onClick={() => handleClassClick(c.id)}
                className={`w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#17212B] border-[#38D9D1] text-[#F5F7FA] shadow-sm'
                    : 'bg-[#0D1117] border-[#283541] hover:border-[#283541]/90 text-[#F5F7FA] hover:bg-[#151D26]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-xs text-[#F5F7FA]">{c.name}</span>
                    <span className="text-[10px] text-[#9AA6B2] font-mono">{c.percentage}% of AOI</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-[#38D9D1]">
                    {valStr}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#38D9D1]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
