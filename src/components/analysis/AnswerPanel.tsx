import React, { useState } from 'react';
import { AnalyzeResponse, EvidenceRegion } from '../../types';
import { ConfidenceScore } from './ConfidenceScore';
import { ReliabilityScore } from './ReliabilityScore';
import { EvidencePanel } from './EvidencePanel';
import { AgentTimeline } from './AgentTimeline';
import { LandCoverChart } from './LandCoverChart';
import { VoiceOutput } from './VoiceOutput';
import { FileText, Cpu, CheckCircle2, ShieldCheck, HelpCircle, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AnswerPanelProps {
  analysis: AnalyzeResponse | null;
  selectedEvidenceId?: string | null;
  onSelectEvidence: (id: string) => void;
  onOpenReportModal: () => void;
}

export const AnswerPanel: React.FC<AnswerPanelProps> = ({
  analysis,
  selectedEvidenceId,
  onSelectEvidence,
  onOpenReportModal
}) => {
  const { t, i18n } = useTranslation();
  const [activeLangTab, setActiveLangTab] = useState<'current' | 'en' | 'hi' | 'kn'>('current');

  if (!analysis) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gis-textMuted select-none">
        <div className="w-12 h-12 rounded-full bg-gis-surface border border-gis-border flex items-center justify-center mb-3">
          <Cpu className="w-6 h-6 text-gis-accent" />
        </div>
        <div className="text-sm font-semibold text-gis-textBright mb-1">
          Satellite Vision-Language Assistant
        </div>
        <div className="text-xs max-w-xs leading-relaxed text-gis-textMuted/80">
          Select an image and enter a natural language query or use the microphone to initiate multi-modal geospatial reasoning.
        </div>
      </div>
    );
  }

  // Determine displayed text based on language tab
  let displayedAnswer = analysis.answer;
  if (activeLangTab === 'en') displayedAnswer = analysis.answer_en;
  else if (activeLangTab === 'hi') displayedAnswer = analysis.answer_hi || analysis.answer_en;
  else if (activeLangTab === 'kn') displayedAnswer = analysis.answer_kn || analysis.answer_en;

  const hasLandCover = analysis.metrics && analysis.metrics.classes;

  return (
    <div className="h-full flex flex-col overflow-y-auto space-y-3.5 pr-1 select-text">
      {/* Top Header Card */}
      <div className="bg-gis-surface border border-gis-border rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-gis-accent/15 border border-gis-accent/30 text-gis-accent">
              {analysis.task_type}
            </span>
            <span className="text-[11px] text-gis-textMuted font-medium">
              {analysis.model_name}
            </span>
          </div>

          {/* Voice Output Player */}
          <VoiceOutput text={displayedAnswer} />
        </div>

        {/* Language Tabs for Multi-Lingual Verification */}
        <div className="flex items-center gap-1 border-b border-gis-border/60 pb-1.5 pt-1">
          <button
            onClick={() => setActiveLangTab('current')}
            className={`px-2 py-0.5 text-[10px] font-medium rounded transition ${
              activeLangTab === 'current' ? 'bg-gis-panel text-gis-accent font-semibold border border-gis-border' : 'text-gis-textMuted hover:text-gis-textBright'
            }`}
          >
            Auto ({i18n.language.toUpperCase()})
          </button>
          <button
            onClick={() => setActiveLangTab('en')}
            className={`px-2 py-0.5 text-[10px] font-medium rounded transition ${
              activeLangTab === 'en' ? 'bg-gis-panel text-gis-accent font-semibold border border-gis-border' : 'text-gis-textMuted hover:text-gis-textBright'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setActiveLangTab('hi')}
            className={`px-2 py-0.5 text-[10px] font-medium rounded transition ${
              activeLangTab === 'hi' ? 'bg-gis-panel text-gis-accent font-semibold border border-gis-border' : 'text-gis-textMuted hover:text-gis-textBright'
            }`}
          >
            हिन्दी
          </button>
          <button
            onClick={() => setActiveLangTab('kn')}
            className={`px-2 py-0.5 text-[10px] font-medium rounded transition ${
              activeLangTab === 'kn' ? 'bg-gis-panel text-gis-accent font-semibold border border-gis-border' : 'text-gis-textMuted hover:text-gis-textBright'
            }`}
          >
            ಕನ್ನಡ
          </button>
        </div>

        {/* WHAT: AI Finding Narrative */}
        <div className="text-xs leading-relaxed text-gis-textBright pt-1">
          <div className="text-[10px] font-bold text-gis-accent tracking-wider uppercase mb-1">
            WHAT DID THE AI DETECT?
          </div>
          <p className="font-normal">{displayedAnswer}</p>
        </div>
      </div>

      {/* Confidence & Reliability Gauges */}
      <div className="grid grid-cols-2 gap-2">
        <ConfidenceScore score={analysis.confidence_score} />
        <ReliabilityScore
          score={analysis.reliability_score}
          reason={analysis.reliability_reason}
        />
      </div>

      {/* Land Cover Chart (if applicable) */}
      {hasLandCover && <LandCoverChart classes={analysis.metrics.classes} />}

      {/* WHERE & WHY: Spatial Evidence Panel */}
      <EvidencePanel
        evidenceRegions={analysis.evidence_regions}
        selectedEvidenceId={selectedEvidenceId}
        onSelectEvidence={onSelectEvidence}
      />

      {/* HOW: Agent Execution Timeline */}
      <AgentTimeline
        timeline={analysis.timeline}
        executionTimeMs={analysis.execution_time_ms}
      />

      {/* Generate PDF Intelligence Report Button */}
      <button
        onClick={onOpenReportModal}
        className="w-full py-2 px-3 rounded-md bg-gis-panel hover:bg-gis-hover border border-gis-border hover:border-gis-accent/50 text-xs font-semibold text-gis-textBright flex items-center justify-center gap-2 transition shadow-sm"
      >
        <FileText className="w-4 h-4 text-gis-accent" />
        <span>{t('explore.generatePdf')}</span>
      </button>
    </div>
  );
};
