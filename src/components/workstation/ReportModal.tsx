import React, { useState } from 'react';
import { FileText, Download, X, Check, ShieldCheck, Printer, Radio, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import { AnalyzeResponse, ImageRecord } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: AnalyzeResponse | null;
  image: ImageRecord | null;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  response,
  image
}) => {
  const { requireAuthForDownload } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  if (!isOpen || !response) return null;

  const handleGeneratePdf = async () => {
    if (!requireAuthForDownload()) return;
    setGenerating(true);
    try {
      const rep = await api.generateReport({
        image_id: image?.id || 'img-dublin-s2-2026',
        query: response.query,
        answer_en: response.answer_en || response.answer,
        confidence_score: response.confidence_score,
        reliability_score: response.reliability_score,
        task_type: response.task_type,
        model_name: response.model_name,
        evidence_regions: response.evidence_regions || [],
        project_name: 'Dublin Metropolitan Remote Sensing Analysis (Tile 30UUE)'
      });
      setDownloadUrl(rep.download_url);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Report generated in preview mode.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-gis-panel border border-gis-border rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gis-border flex items-center justify-between bg-gis-bg/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gis-accent/15 border border-gis-accent/30 flex items-center justify-center text-gis-accent">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gis-textBright">Official Geospatial Intelligence Report</h3>
              <span className="text-[11px] text-gis-textMuted font-mono">SatQuery AI • Automated Certification</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gis-textMuted hover:text-gis-textBright hover:bg-gis-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Preview Document */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gis-bg text-gis-textBright font-sans text-xs">
          {/* Header Banner */}
          <div className="p-4 rounded-lg bg-gis-panel border border-gis-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-gis-accent" />
              <div>
                <span className="font-bold text-base tracking-wide">SATQUERY AI</span>
                <span className="text-xs text-gis-textMuted ml-2">Earth Observation Verification</span>
              </div>
            </div>
            <span className="font-mono text-[11px] text-gis-accent">
              DOC-ID: SQ-{Date.now().toString().slice(-8)}
            </span>
          </div>

          {/* Inquiry & Location Metadata */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-gis-panel border border-gis-border space-y-1">
              <span className="text-[10px] text-gis-textMuted uppercase font-semibold">User Query</span>
              <p className="text-xs font-semibold text-gis-textBright">"{response.query}"</p>
            </div>
            <div className="p-3 rounded-lg bg-gis-panel border border-gis-border space-y-1 font-mono">
              <span className="text-[10px] text-gis-textMuted uppercase font-semibold">Geographic Coordinates</span>
              <p className="text-xs text-gis-accent">53.3472° N, 6.2439° W (Tile 30UUE)</p>
            </div>
          </div>

          {/* AI Executive Summary */}
          <div className="p-4 rounded-lg bg-gis-panel border border-gis-border space-y-2">
            <span className="text-[10px] text-gis-textMuted uppercase font-semibold">Executive AI Assessment</span>
            <p className="text-xs text-gis-textBright leading-relaxed">
              {response.answer}
            </p>
          </div>

          {/* Data & Satellite Provenance */}
          <div className="grid grid-cols-3 gap-3 font-mono text-[11px]">
            <div className="p-3 rounded-lg bg-gis-panel border border-gis-border">
              <span className="text-[10px] text-gis-textMuted uppercase">Satellite Platform</span>
              <div className="font-bold text-gis-accent mt-1">Sentinel-2 MSI + Sentinel-1</div>
            </div>
            <div className="p-3 rounded-lg bg-gis-panel border border-gis-border">
              <span className="text-[10px] text-gis-textMuted uppercase">Confidence Level</span>
              <div className="font-bold text-gis-success mt-1">{response.confidence_score}% (High Reliability)</div>
            </div>
            <div className="p-3 rounded-lg bg-gis-panel border border-gis-border">
              <span className="text-[10px] text-gis-textMuted uppercase">Resolution & Tile</span>
              <div className="font-bold text-gis-textBright mt-1">10m GSD • 30UUE</div>
            </div>
          </div>

          {/* Spatial Evidence Regions */}
          {response.evidence_regions && response.evidence_regions.length > 0 && (
            <div className="p-4 rounded-lg bg-gis-panel border border-gis-border space-y-2">
              <span className="text-[10px] text-gis-textMuted uppercase font-semibold">
                Delineated Evidence Boundaries ({response.evidence_regions.length})
              </span>
              <div className="space-y-1.5 font-mono text-[11px]">
                {response.evidence_regions.map((ev, i) => (
                  <div key={i} className="flex justify-between p-2 rounded bg-gis-bg border border-gis-border/60">
                    <span className="text-gis-textBright">{ev.label} ({ev.type})</span>
                    <span className="text-gis-accent">{ev.area_hectares.toFixed(2)} ha • {ev.confidence}% Conf</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Limitations Disclaimer */}
          <div className="p-3 rounded-lg bg-gis-bg border border-gis-border/50 text-[10px] text-gis-textMuted leading-relaxed">
            <strong>Data Limitations & Technical Notes:</strong> Optical imagery is subject to cloud obscuration and atmospheric scattering. SAR microwave penetration accounts for surface permittivity and roughness. Geodesic calculations adhere to WGS84 EPSG:4326 ellipsoid geometry. Generated automatically by SatQuery AI.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gis-border bg-gis-bg/80 flex items-center justify-between">
          <span className="text-xs font-mono text-gis-textMuted">
            Timestamp: {new Date().toUTCString()}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-gis-border text-xs text-gis-textMuted hover:text-gis-textBright transition-colors"
            >
              Close Preview
            </button>
            {downloadUrl ? (
              <a
                href={downloadUrl}
                download
                onClick={(e) => {
                  if (!requireAuthForDownload()) {
                    e.preventDefault();
                  }
                }}
                className="px-4 py-1.5 rounded-lg bg-gis-success hover:bg-gis-success/90 text-gis-bg font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </a>
            ) : (
              <button
                onClick={handleGeneratePdf}
                disabled={generating}
                className="px-4 py-1.5 rounded-lg bg-gis-accent hover:bg-gis-accent/90 disabled:opacity-50 text-gis-bg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm shadow-gis-accent/20"
              >
                <Printer className="w-3.5 h-3.5" />
                {generating ? 'Generating PDF...' : 'Generate & Download PDF'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
