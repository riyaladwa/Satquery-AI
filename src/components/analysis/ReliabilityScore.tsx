import React from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

interface ReliabilityScoreProps {
  score: string; // 'High', 'Medium', 'Low'
  reason?: string;
}

export const ReliabilityScore: React.FC<ReliabilityScoreProps> = ({ score, reason }) => {
  const isHigh = score.toLowerCase() === 'high';
  const isMed = score.toLowerCase() === 'medium';

  const badgeColor = isHigh
    ? 'text-gis-accentCyan border-gis-accentCyan/30 bg-gis-accentCyan/10'
    : isMed
    ? 'text-gis-warning border-gis-warning/30 bg-gis-warning/10'
    : 'text-gis-danger border-gis-danger/30 bg-gis-danger/10';

  const Icon = isHigh ? ShieldCheck : isMed ? Shield : ShieldAlert;

  return (
    <div className="flex flex-col gap-1 p-2.5 rounded-md bg-gis-bg border border-gis-border">
      <div className="flex items-center justify-between text-[11px] text-gis-textMuted font-medium">
        <span>Data Reliability</span>
        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold border ${badgeColor}`}>
          <Icon className="w-3 h-3" />
          <span>{score}</span>
        </div>
      </div>
      <div className="text-[10px] text-gis-textMuted line-clamp-2 leading-tight">
        {reason || 'Factored from GSD resolution, radiometric contrast, and sensor alignment.'}
      </div>
    </div>
  );
};
