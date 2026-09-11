import React from 'react';
import { Layers, Eye, EyeOff, X, Sliders } from 'lucide-react';

export interface LayerState {
  id: string;
  name: string;
  category: 'base' | 'imagery' | 'vector' | 'analysis';
  visible: boolean;
  opacity: number;
}

interface LayerManagerDrawerProps {
  onClose: () => void;
  layers: LayerState[];
  onToggleLayer: (id: string) => void;
  onChangeOpacity: (id: string, opacity: number) => void;
}

export const LayerManagerDrawer: React.FC<LayerManagerDrawerProps> = ({
  onClose,
  layers,
  onToggleLayer,
  onChangeOpacity
}) => {
  return (
    <div className="w-80 bg-gis-panel border-r border-gis-border h-full flex flex-col z-20 shadow-2xl shadow-black/80 animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="p-3 border-b border-gis-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gis-accent" />
          <h3 className="font-semibold text-xs text-gis-textBright uppercase tracking-wider">
            Layer Management
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-gis-textMuted hover:text-gis-textBright hover:bg-gis-hover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        <div className="text-[10px] text-gis-textMuted uppercase font-semibold tracking-wider">
          Active GIS Map Layers ({layers.filter(l => l.visible).length}/{layers.length})
        </div>

        {layers.map((layer) => (
          <div
            key={layer.id}
            className="p-2.5 rounded-lg bg-gis-panel border border-gis-border hover:border-gis-border/80 space-y-2 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleLayer(layer.id)}
                  className={`p-1 rounded transition-colors ${
                    layer.visible
                      ? 'text-gis-accent bg-gis-accent/15'
                      : 'text-gis-textMuted/50 hover:text-gis-textMuted'
                  }`}
                  title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                >
                  {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <span className={`text-xs font-medium ${layer.visible ? 'text-gis-textBright' : 'text-gis-textMuted'}`}>
                  {layer.name}
                </span>
              </div>

              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-gis-bg border border-gis-border text-gis-textMuted uppercase">
                {layer.category}
              </span>
            </div>

            {layer.visible && (
              <div className="flex items-center gap-2 pt-1 border-t border-gis-border/40">
                <Sliders className="w-3 h-3 text-gis-textMuted shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={layer.opacity * 100}
                  onChange={(e) => onChangeOpacity(layer.id, Number(e.target.value) / 100)}
                  className="w-full h-1 bg-gis-bg rounded-lg appearance-none cursor-pointer accent-gis-accent"
                />
                <span className="text-[10px] font-mono text-gis-textMuted w-7 text-right">
                  {Math.round(layer.opacity * 100)}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
