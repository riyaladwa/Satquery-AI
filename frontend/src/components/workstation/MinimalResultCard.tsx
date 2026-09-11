import React, { useState } from 'react';
import { AnalyzeResponse } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { VoiceAudioPlayer } from './VoiceAudioPlayer';
import {
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';

interface MinimalResultCardProps {
  analysis: AnalyzeResponse;
  selectedEvidenceId?: string | null;
  onSelectEvidence?: (id: string) => void;
  className?: string;
  imageId?: string;
}

export const MinimalResultCard: React.FC<MinimalResultCardProps> = ({
  analysis,
  selectedEvidenceId,
  onSelectEvidence,
  className = '',
  imageId
}) => {
  const { language, currentLanguageOption } = useLanguage();
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [reportStatus, setReportStatus] = useState<'idle' | 'generating' | 'downloaded'>('idle');

  // Compute text answer in the user's active language
  let displayAnswer = analysis.answer;
  if (analysis.localized_answers && analysis.localized_answers[language]) {
    displayAnswer = analysis.localized_answers[language];
  } else if (language === 'hi' && analysis.answer_hi) {
    displayAnswer = analysis.answer_hi;
  } else if (language === 'kn' && analysis.answer_kn) {
    displayAnswer = analysis.answer_kn;
  } else if (analysis.answer_en) {
    displayAnswer = analysis.answer_en;
  }

  const handleDownloadPdf = async () => {
    try {
      setDownloadingReport(true);
      setReportStatus('generating');
      const targetImageId = imageId || (analysis as any).image_id || 'img-blr-2026';
      const res = await api.generateReport({
        image_id: targetImageId,
        query: analysis.query,
        answer_en: analysis.answer_en || analysis.answer,
        confidence_score: analysis.confidence_score || 94.0,
        reliability_score: analysis.reliability_score || 'HIGH',
        task_type: analysis.task_type || 'VQA',
        model_name: analysis.model_name || 'SatQuery RS-VLM Specialist',
        evidence_regions: analysis.evidence_regions || []
      });

      if (res && res.report_id) {
        // Direct reliable blob download without popup blocker interference
        await api.downloadReportBlob(res.report_id, `${res.report_id}.pdf`);
        setReportStatus('downloaded');
        setTimeout(() => setReportStatus('idle'), 4000);
      }
    } catch (err) {
      console.error('Failed to generate PDF report:', err);
      alert('PDF generation encountered an issue. Please retry or check backend.');
      setReportStatus('idle');
    } finally {
      setDownloadingReport(false);
    }
  };

  return (
    <div
      className={`bg-white border border-[#E3EAE5] rounded-xl shadow-xs overflow-hidden transition-all duration-200 text-[#17201B] ${className}`}
    >
      {/* Top Banner: AI RESULT + Specialist Metadata */}
      <div className="px-4 py-3 bg-[#FBFDFB] border-b border-[#E3EAE5] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EAF7F0] border border-[#167A4A]/20 text-[#167A4A] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#167A4A]" />
            AI Result
          </span>
          <span className="text-xs font-bold text-[#17201B]">
            {analysis.task_type}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-[#66736B]">
          <span className="bg-white px-2 py-0.5 rounded border border-[#E3EAE5] text-[#17201B] font-medium">
            {analysis.model_name}
          </span>
          <span className="font-semibold text-[#66736B]">{analysis.execution_time_ms}ms</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Main Natural Language Text Response */}
        <div className="bg-[#EAF7F0]/40 rounded-xl p-3.5 border border-[#167A4A]/20">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10.5px] font-bold text-[#167A4A] uppercase tracking-wider">
              Natural Language Response ({currentLanguageOption.nativeName})
            </span>
          </div>
          <p className="text-sm font-semibold text-[#17201B] leading-relaxed">
            {displayAnswer}
          </p>
        </div>

        {/* Multimodal Voice Answer Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-[#E3EAE5]">
          <VoiceAudioPlayer textToSpeak={displayAnswer} langCode={language} />

          {/* Quick PDF Report Trigger */}
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingReport}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold shadow-2xs transition-all cursor-pointer focus:outline-hidden disabled:opacity-50 ${
              reportStatus === 'downloaded'
                ? 'bg-[#EAF7F0] border-[#167A4A] text-[#167A4A]'
                : 'border-[#E3EAE5] bg-white hover:bg-[#FBFDFB] text-[#17201B]'
            }`}
            title="Download verified official report PDF"
            type="button"
          >
            {reportStatus === 'downloaded' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#167A4A]" />
                <span>PDF Downloaded!</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5 text-[#167A4A]" />
                <span>{downloadingReport ? 'Compiling PDF...' : 'Official PDF Report'}</span>
              </>
            )}
          </button>
        </div>

        {/* Visual Evidence Grounding List */}
        {analysis.evidence_regions && analysis.evidence_regions.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#17201B] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#167A4A]" />
                Visual Evidence Grounding ({analysis.evidence_regions.length})
              </span>
              <span className="text-[11px] text-[#66736B] font-medium">Click to zoom on map</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {analysis.evidence_regions.map((ev) => {
                const isSelected = selectedEvidenceId === ev.id;
                return (
                  <button
                    key={ev.id}
                    onClick={() => onSelectEvidence && onSelectEvidence(ev.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#EAF7F0] border-[#167A4A] text-[#17201B] shadow-xs ring-1 ring-[#167A4A]/20'
                        : 'bg-white border-[#E3EAE5] hover:border-[#167A4A] hover:bg-[#FBFDFB]'
                    }`}
                    type="button"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isSelected ? 'bg-[#167A4A] ring-2 ring-[#EAF7F0]' : 'bg-[#2E9B68]'
                          }`}
                        />
                        <span className="font-bold text-xs text-[#17201B]">{ev.label}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#167A4A]">
                        {ev.confidence}% Conf
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center gap-3 text-[11px] text-[#66736B] font-mono">
                      <span>Area: <b className="text-[#17201B]">{ev.area_hectares} ha</b></span>
                      <span>({ev.area_sqkm} km²)</span>
                      <span className="text-[#E3EAE5]">|</span>
                      <span>Type: <b className="text-[#17201B]">{ev.type}</b></span>
                    </div>

                    {ev.description && (
                      <p className="mt-1 text-[11px] text-[#66736B] leading-snug">
                        {ev.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Confidence & Reliability Card */}
        <div className="p-3 bg-[#FBFDFB] rounded-lg border border-[#E3EAE5] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#167A4A]" />
              <span className="text-xs font-bold text-[#17201B]">Confidence & Reliability</span>
            </div>
            <span className="text-xs font-bold text-[#167A4A] bg-[#EAF7F0] px-2 py-0.5 rounded-full border border-[#167A4A]/20">
              {analysis.reliability_score} Reliability
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#66736B] font-medium">Detection Confidence:</span>
              <span className="font-bold text-[#17201B]">{analysis.confidence_score}%</span>
            </div>
            <div className="w-full bg-[#E3EAE5] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#167A4A] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, analysis.confidence_score))}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-[#66736B] leading-normal pt-1 border-t border-[#E3EAE5]">
            {analysis.reliability_reason}
          </p>
        </div>

        {/* Observable Execution Timeline (Collapsible) */}
        {analysis.timeline && analysis.timeline.length > 0 && (
          <div className="border border-[#E3EAE5] rounded-lg overflow-hidden">
            <button
              onClick={() => setTimelineExpanded((prev) => !prev)}
              className="w-full flex items-center justify-between px-3 py-2 bg-[#FBFDFB] hover:bg-white text-xs font-semibold text-[#17201B] transition-colors cursor-pointer"
              type="button"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#167A4A]" />
                <span>Execution Timeline ({analysis.timeline.length} steps)</span>
              </div>
              {timelineExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-[#66736B]" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-[#66736B]" />
              )}
            </button>

            {timelineExpanded && (
              <div className="p-3 bg-white space-y-2 text-xs border-t border-[#E3EAE5]">
                {analysis.timeline.map((st, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11.5px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#167A4A] mt-1.5 shrink-0" />
                    <div>
                      <span className="font-bold text-[#17201B]">{st.step}</span>
                      <span className="text-[#66736B] text-[10.5px] ml-1.5 font-mono">
                        ({st.timestamp_ms}ms)
                      </span>
                      <p className="text-[#66736B] text-[11px]">{st.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
