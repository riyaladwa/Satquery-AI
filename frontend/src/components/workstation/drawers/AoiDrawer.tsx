import React, { useState } from 'react';
import { BoxSelect, Square, Circle, PenTool, Upload, Trash2, X, Check } from 'lucide-react';

interface AoiDrawerProps {
  onClose: () => void;
  activeDrawMode: 'none' | 'rectangle' | 'polygon' | 'circle';
  onSelectDrawMode: (mode: 'none' | 'rectangle' | 'polygon' | 'circle') => void;
  aoiAreaHectares: number | null;
  onClearAoi: () => void;
  onAoiFileLoaded: (geojson: any) => void;
}

export const AoiDrawer: React.FC<AoiDrawerProps> = ({
  onClose,
  activeDrawMode,
  onSelectDrawMode,
  aoiAreaHectares,
  onClearAoi,
  onAoiFileLoaded
}) => {
  const [unit, setUnit] = useState<'ha' | 'km2' | 'm2'>('ha');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        onAoiFileLoaded(parsed);
      } catch (err) {
        alert('Invalid GeoJSON file format. Please upload valid GeoJSON.');
      }
    };
    reader.readAsText(file);
  };

  const getFormattedArea = () => {
    if (aoiAreaHectares === null) return '0.00';
    if (unit === 'ha') return `${aoiAreaHectares.toFixed(2)} ha`;
    if (unit === 'km2') return `${(aoiAreaHectares / 100).toFixed(3)} km²`;
    return `${(aoiAreaHectares * 10000).toLocaleString()} m²`;
  };

  return (
    <div className="w-80 bg-gis-panel border-r border-gis-border h-full flex flex-col z-20 shadow-2xl shadow-black/80 animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="p-3 border-b border-gis-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BoxSelect className="w-4 h-4 text-gis-accent" />
          <h3 className="font-semibold text-xs text-gis-textBright uppercase tracking-wider">
            Area of Interest (AOI)
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
        {/* Draw Tools */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-gis-textMuted uppercase font-semibold">Interactive Drawing Tools</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'polygon', icon: PenTool, label: 'Polygon' },
              { id: 'rectangle', icon: Square, label: 'Rectangle' },
              { id: 'circle', icon: Circle, label: 'Circle' }
            ].map((tool) => {
              const Icon = tool.icon;
              const isActive = activeDrawMode === tool.id;

              return (
                <button
                  key={tool.id}
                  onClick={() => onSelectDrawMode(isActive ? 'none' : (tool.id as any))}
                  className={`p-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                    isActive
                      ? 'bg-gis-accent/20 border-gis-accent text-gis-accent shadow-sm shadow-gis-accent/20'
                      : 'bg-gis-panel border-gis-border hover:border-gis-border/80 text-gis-textBright hover:bg-gis-hover'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px]">{tool.label}</span>
                </button>
              );
            })}
          </div>
          {activeDrawMode !== 'none' && (
            <p className="text-[10px] text-gis-accent animate-pulse font-mono mt-1">
              Click on the map to define vertices for {activeDrawMode}.
            </p>
          )}
        </div>

        {/* Upload AOI Boundary */}
        <div className="p-3 rounded-lg bg-gis-bg border border-gis-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gis-textMuted uppercase font-semibold">Import Spatial Boundary</span>
            <span className="text-[9px] font-mono text-gis-textMuted">KML • GeoJSON • SHP</span>
          </div>

          <label className="border border-dashed border-gis-border/80 hover:border-gis-accent/60 rounded-lg p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-gis-panel/50 hover:bg-gis-hover/50 transition-colors">
            <Upload className="w-4 h-4 text-gis-accent" />
            <span className="text-xs text-gis-textBright font-medium">Upload AOI File</span>
            <span className="text-[10px] text-gis-textMuted">Drag & drop or browse</span>
            <input
              type="file"
              accept=".geojson,.json,.kml"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Current AOI Area Calculation */}
        <div className="p-3 rounded-lg bg-gis-panel border border-gis-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gis-textMuted uppercase font-semibold">Calculated AOI Surface</span>
            <div className="flex gap-1">
              {(['ha', 'km2', 'm2'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase transition-colors ${
                    unit === u
                      ? 'bg-gis-accent text-gis-bg font-bold'
                      : 'bg-gis-bg text-gis-textMuted hover:text-gis-textBright'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div className="font-mono text-lg font-bold text-gis-accent">
            {getFormattedArea()}
          </div>

          {aoiAreaHectares !== null && (
            <button
              onClick={onClearAoi}
              className="w-full mt-2 py-1.5 px-3 rounded bg-gis-danger/10 hover:bg-gis-danger/20 border border-gis-danger/30 text-gis-danger text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear AOI Selection
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
