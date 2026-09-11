import React from 'react';
import { Layers, Eye, EyeOff } from 'lucide-react';

interface LayerManagerProps {
  layers: {
    satellite: boolean;
    evidence: boolean;
    changeHeatmap: boolean;
    landCover: boolean;
  };
  onToggleLayer: (layerName: string) => void;
}

export const LayerManager: React.FC<LayerManagerProps> = ({ layers, onToggleLayer }) => {
  const layerDefs = [
    { key: 'satellite', label: 'Optical Satellite Imagery', color: '#0EA5E9' },
    { key: 'evidence', label: 'AI Evidence Regions', color: '#06B6D4' },
    { key: 'changeHeatmap', label: 'Change Heatmap', color: '#E11D48' },
    { key: 'landCover', label: 'Land Cover Segmentation', color: '#10B981' }
  ];

  return (
    <div className="bg-gis-panel border border-gis-border rounded-md p-3 shadow-gis">
      <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-gis-border">
        <Layers className="w-3.5 h-3.5 text-gis-accent" />
        <span className="text-xs font-semibold text-gis-textBright uppercase tracking-wider">Map Layers</span>
      </div>

      <div className="space-y-2">
        {layerDefs.map((l) => {
          const isVisible = (layers as any)[l.key];
          return (
            <div
              key={l.key}
              onClick={() => onToggleLayer(l.key)}
              className="flex items-center justify-between p-1.5 rounded hover:bg-gis-hover cursor-pointer transition text-xs select-none"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                <span className={isVisible ? 'text-gis-textBright font-medium' : 'text-gis-textMuted line-through'}>
                  {l.label}
                </span>
              </div>
              <button className="text-gis-textMuted hover:text-gis-textBright">
                {isVisible ? <Eye className="w-3.5 h-3.5 text-gis-accent" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
