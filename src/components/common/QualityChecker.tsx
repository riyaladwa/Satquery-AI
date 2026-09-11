import React, { useEffect, useState } from 'react';
import { QualityCheckResult } from '../../types';
import { api } from '../../services/api';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';

interface QualityCheckerProps {
  imageId?: string | null;
}

export const QualityChecker: React.FC<QualityCheckerProps> = ({ imageId }) => {
  const [quality, setQuality] = useState<QualityCheckResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!imageId) {
      setQuality(null);
      return;
    }

    setLoading(true);
    api.validateImage(imageId)
      .then((data) => setQuality(data))
      .catch((err) => console.error('Quality verification failed', err))
      .finally(() => setLoading(false));
  }, [imageId]);

  if (!imageId) return null;

  if (loading) {
    return (
      <div className="p-3 bg-gis-surface border border-gis-border rounded-md flex items-center justify-center gap-2 text-xs text-gis-textMuted">
        <Loader2 className="w-4 h-4 animate-spin text-gis-accent" />
        <span>Validating raster quality & CRS...</span>
      </div>
    );
  }

  if (!quality) return null;

  return (
    <div className="bg-gis-surface border border-gis-border rounded-md p-3 space-y-2">
      <div className="flex items-center justify-between pb-1.5 border-b border-gis-border">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-gis-success" />
          <span className="text-xs font-semibold text-gis-textBright uppercase tracking-wider">
            Quality Verification
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gis-textMuted">Score:</span>
          <span className="text-xs font-mono font-bold text-gis-success">
            {quality.overall_score}%
          </span>
        </div>
      </div>

      <div className="space-y-1.5 text-[11px]">
        {quality.checks.map((c) => (
          <div key={c.id} className="flex items-start justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              {c.status === 'pass' ? (
                <CheckCircle2 className="w-3 h-3 text-gis-success shrink-0" />
              ) : c.status === 'warning' ? (
                <AlertTriangle className="w-3 h-3 text-gis-warning shrink-0" />
              ) : (
                <XCircle className="w-3 h-3 text-gis-danger shrink-0" />
              )}
              <span className="text-gis-textBright">{c.name}</span>
            </div>
            <span className="text-[10px] text-gis-textMuted font-mono truncate max-w-[120px]">
              {c.details}
            </span>
          </div>
        ))}
      </div>

      {quality.warnings.length > 0 && (
        <div className="mt-2 pt-1.5 border-t border-gis-border/60">
          <div className="text-[10px] text-gis-warning space-y-0.5">
            {quality.warnings.map((w, idx) => (
              <div key={idx} className="flex items-start gap-1">
                <span>•</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
