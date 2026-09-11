import React from 'react';
import { EvidenceRegion } from '../../types';
import { MapPin, ZoomIn, Eye, Sparkles } from 'lucide-react';

interface EvidencePanelProps {
  evidenceRegions: EvidenceRegion[];
  selectedEvidenceId?: string | null;
  onSelectEvidence: (id: string) => void;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  evidenceRegions,
  selectedEvidenceId,
  onSelectEvidence
}) => {
  if (!evidenceRegions || evidenceRegions.length === 0) {
    return (
      <div className="p-3 bg-gis-bg rounded-md border border-gis-border text-center text-xs text-gis-textMuted">
        No specific spatial evidence regions delineated for this scene.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gis-textMuted font-semibold uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-gis-accent" />
          <span>Spatial Evidence ({evidenceRegions.length})</span>
        </span>
        <span className="text-[10px] text-gis-accentCyan lowercase font-mono">click to zoom</span>
      </div>

      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {evidenceRegions.map((ev, idx) => {
          const isSelected = selectedEvidenceId === ev.id;
          return (
            <div
              key={ev.id || idx}
              onClick={() => onSelectEvidence(ev.id)}
              className={`p-2 rounded-md border cursor-pointer transition select-none flex flex-col gap-1 ${
                isSelected
                  ? 'bg-gis-accent/15 border-gis-accent shadow-panel'
                  : 'bg-gis-bg border-gis-border hover:border-gis-accent/40 hover:bg-gis-hover'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gis-textBright flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gis-accent" />
                  {ev.label}
                </span>
                <span className="text-[11px] font-mono text-gis-success font-medium">
                  {ev.confidence}%
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gis-textMuted">
                <span>Class: <b className="text-gis-textBright font-normal">{ev.type}</b></span>
                <span>
                  {ev.area_hectares > 0 ? (
                    <span className="text-gis-accentCyan font-mono">{ev.area_hectares} ha</span>
                  ) : (
                    <span>Polygon</span>
                  )}
                </span>
              </div>

              {ev.description && (
                <div className="text-[10px] text-gis-textMuted/90 line-clamp-2 leading-tight">
                  {ev.description}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
