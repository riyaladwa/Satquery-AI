import React from 'react';
import { Percent } from 'lucide-react';

interface ConfidenceScoreProps {
  score: number;
}

export const ConfidenceScore: React.FC<ConfidenceScoreProps> = ({ score }) => {
  const formatted = Math.round(score);
  const color =
    formatted >= 85 ? 'text-gis-success border-gis-success/30 bg-gis-success/10' :
    formatted >= 70 ? 'text-gis-warning border-gis-warning/30 bg-gis-warning/10' :
    'text-gis-danger border-gis-danger/30 bg-gis-danger/10';

  return (
    <div className="flex flex-col gap-1 p-2.5 rounded-md bg-gis-bg border border-gis-border">
      <div className="flex items-center justify-between text-[11px] text-gis-textMuted font-medium">
        <span>Model Confidence</span>
        <span className={`px-1.5 py-0.5 rounded text-xs font-mono font-bold border ${color}`}>
          {formatted}%
        </span>
      </div>
      {/* Progress Bar */}
      <div className="w-full bg-gis-surface h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            formatted >= 85 ? 'bg-gis-success' : formatted >= 70 ? 'bg-gis-warning' : 'bg-gis-danger'
          }`}
          style={{ width: `${formatted}%` }}
        />
      </div>
      <div className="text-[10px] text-gis-textMuted/70">
        Inference certainty of specialist model
      </div>
    </div>
  );
};
