import React, { useState } from 'react';
import { api } from '../../services/api';
import { AnalyzeResponse, ImageRecord, ReportItem } from '../../types';
import { FileText, Download, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';

interface ReportGeneratorProps {
  image: ImageRecord | null;
  analysis: AnalyzeResponse | null;
  onClose: () => void;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  image,
  analysis,
  onClose
}) => {
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<ReportItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!image || !analysis) return;

    setGenerating(true);
    setError(null);

    try {
      const rep = await api.generateReport({
        image_id: image.id,
        query: analysis.query,
        answer_en: analysis.answer_en,
        confidence_score: analysis.confidence_score,
        reliability_score: analysis.reliability_score,
        task_type: analysis.task_type,
        model_name: analysis.model_name,
        evidence_regions: analysis.evidence_regions
      });
      setReport(rep);
    } catch (err: any) {
      console.error('Report generation failed', err);
      setError('Failed to generate PDF report.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gis-surface border border-gis-border rounded-lg max-w-md w-full p-5 space-y-4 shadow-gis select-none">
        <div className="flex items-center justify-between pb-2 border-b border-gis-border">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gis-accent" />
            <span className="text-sm font-bold text-gis-textBright">
              Generate Intelligence Report (PDF)
            </span>
          </div>
          <button onClick={onClose} className="text-xs text-gis-textMuted hover:text-gis-textBright">
            ✕
          </button>
        </div>

        {report ? (
          <div className="space-y-3 py-2 text-center">
            <div className="w-12 h-12 rounded-full bg-gis-success/15 border border-gis-success/30 flex items-center justify-center mx-auto text-gis-success">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-gis-textBright">
              PDF Report Generated Successfully
            </div>
            <div className="text-xs text-gis-textMuted max-w-xs mx-auto">
              Publication-grade geospatial intelligence report including executive narrative, spatial evidence coordinates, and audit trail.
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <a
                href={report.download_url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-md bg-gis-accent hover:bg-gis-accentCyan text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </a>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-gis-panel border border-gis-border text-xs text-gis-textBright hover:bg-gis-hover transition"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <div className="bg-gis-panel border border-gis-border/60 rounded p-3 space-y-1.5 text-[11px]">
              <div><b>Scene:</b> {image?.filename}</div>
              <div><b>Query:</b> "{analysis?.query}"</div>
              <div><b>Assessment:</b> {analysis?.task_type} • {analysis?.confidence_score}% Confidence</div>
              <div><b>Evidence:</b> {analysis?.evidence_regions.length} verified regions</div>
            </div>

            {error && (
              <div className="text-gis-danger text-xs p-2 bg-gis-danger/10 border border-gis-danger/30 rounded">
                {error}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={generating}
                className="px-3 py-1.5 rounded bg-gis-panel border border-gis-border text-gis-textMuted hover:text-gis-textBright"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="px-4 py-1.5 rounded bg-gis-accent hover:bg-gis-accentCyan text-white font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Compiling ReportLab PDF...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    <span>Generate PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
