import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
  Info, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Layers, 
  FileDown, 
  Maximize2,
  RefreshCw,
  HelpCircle,
  Database,
  Cpu
} from 'lucide-react';
import { AnalyzeResponse, EvidenceRegion } from '../../types';
import { CleanResultCard } from './CleanResultCard';

interface AiCopilotPanelProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSendQuery: (query: string) => void;
  analyzing: boolean;
  currentResponse: AnalyzeResponse | null;
  conversationHistory: { query: string; response: AnalyzeResponse }[];
  onSelectEvidence: (id: string) => void;
  selectedEvidenceId: string | null;
  onGenerateReport: () => void;
  onCompareImages?: () => void;
}

export const AiCopilotPanel: React.FC<AiCopilotPanelProps> = ({
  collapsed,
  onToggleCollapse,
  onSendQuery,
  analyzing,
  currentResponse,
  conversationHistory,
  onSelectEvidence,
  selectedEvidenceId,
  onGenerateReport,
  onCompareImages
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [whyExpanded, setWhyExpanded] = useState(false);
  const [areaUnit, setAreaUnit] = useState<'ha' | 'km2' | 'm2'>('ha');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new response arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentResponse, analyzing]);

  // Suggested prompt chips
  const suggestedQueries = [
    'Has urban development increased?',
    'Find buildings constructed after 2023.',
    'Show vegetation loss.',
    'Where is water present?',
    'Compare this area between 2023 and 2026.',
    'Identify possible flood affected regions.',
    'Calculate the built-up area.'
  ];

  // Speech Recognition (Web Speech API)
  const handleMicToggle = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInputQuery(transcript);
      setIsListening(false);
    };

    recognition.start();
  };

  // Text to Speech
  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim() && !analyzing) {
      onSendQuery(inputQuery.trim());
      setInputQuery('');
    }
  };

  if (collapsed) {
    return (
      <div className="w-12 bg-gis-panel border-l border-gis-border h-full flex flex-col items-center py-4 z-20 shrink-0 select-none">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg bg-gis-bg hover:bg-gis-hover border border-gis-border text-gis-accent hover:text-gis-textBright transition-colors"
          title="Expand AI Copilot Panel"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="mt-8 [writing-mode:vertical-lr] rotate-180 flex items-center gap-2 font-mono text-xs text-gis-accent tracking-widest uppercase font-bold">
          <Sparkles className="w-3.5 h-3.5 text-gis-accent" />
          <span>SATQUERY AI COPILOT</span>
        </div>
      </div>
    );
  }

  return (
    <aside className="w-96 bg-gis-panel border-l border-gis-border h-full flex flex-col z-20 shrink-0 select-none shadow-2xl shadow-black/80">
      {/* Header */}
      <div className="h-14 px-4 border-b border-gis-border flex items-center justify-between shrink-0 bg-gis-bg/40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gis-accent/15 border border-gis-accent/30 flex items-center justify-center text-gis-accent">
            <Sparkles className="w-4 h-4 text-gis-accent animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs text-gis-textBright tracking-wider">SATQUERY AI</span>
            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              <span className={`w-1.5 h-1.5 rounded-full ${analyzing ? 'bg-gis-warning animate-ping' : 'bg-gis-success'}`} />
              <span className={analyzing ? 'text-gis-warning' : 'text-gis-success'}>
                {analyzing ? 'Analyzing imagery...' : 'Ready to analyze'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-gis-textMuted hover:text-gis-textBright hover:bg-gis-hover transition-colors"
          title="Collapse Panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Conversation & Output Viewport */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome State when no conversation yet */}
        {!currentResponse && !analyzing && conversationHistory.length === 0 && (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-gis-bg border border-gis-border flex items-center justify-center mx-auto text-gis-accent shadow-inner">
              <Sparkles className="w-6 h-6 text-gis-accent" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-gis-textBright">Ask your satellite imagery anything</h4>
              <p className="text-xs text-gis-textMuted leading-relaxed px-2">
                Ask natural-language questions to analyze Sentinel-1 SAR and Sentinel-2 optical imagery with explainable AI.
              </p>
            </div>

            {/* Quick Prompts */}
            <div className="pt-2 text-left space-y-1.5">
              <span className="text-[10px] uppercase font-semibold text-gis-textMuted font-mono">
                Suggested Remote Sensing Queries
              </span>
              <div className="flex flex-col gap-1.5">
                {suggestedQueries.map((sq, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputQuery(sq);
                      onSendQuery(sq);
                    }}
                    className="p-2 rounded-lg bg-gis-bg hover:bg-gis-hover border border-gis-border hover:border-gis-accent/40 text-left text-xs text-gis-textBright transition-all flex items-center justify-between group"
                  >
                    <span>"{sq}"</span>
                    <ChevronRight className="w-3 h-3 text-gis-textMuted group-hover:text-gis-accent transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Prior Conversation History Items */}
        {conversationHistory.map((item, idx) => (
          <div key={idx} className="space-y-2 opacity-90 border-b border-gis-border/40 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono text-gis-accent">
              <span>Query:</span>
              <span className="text-gis-textBright font-semibold">"{item.query}"</span>
            </div>
            <div className="p-2.5 rounded-lg bg-gis-bg border border-gis-border text-xs text-gis-textMuted leading-relaxed">
              {item.response.answer}
            </div>
          </div>
        ))}

        {/* AI Agent Execution Timeline (While Analyzing or Current Response) */}
        {(analyzing || (currentResponse && currentResponse.timeline)) && (
          <div className="p-3 rounded-lg bg-gis-bg border border-gis-border space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-semibold text-gis-textMuted font-mono flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-gis-accent" />
                AI Agent Execution Timeline
              </span>
              <span className="text-[9px] font-mono text-gis-accent">
                {analyzing ? 'Executing specialist models...' : `${currentResponse?.execution_time_ms ?? 340}ms`}
              </span>
            </div>

            {/* Steps List */}
            <div className="space-y-1.5">
              {(currentResponse?.timeline ?? [
                { step: 'Understanding query', status: 'SUCCESS', details: 'Parsing NLP intent', timestamp_ms: 12 },
                { step: 'Detecting analysis type', status: 'SUCCESS', details: 'Task classified', timestamp_ms: 45 },
                { step: 'Selecting satellite imagery', status: 'SUCCESS', details: 'Sentinel-2 L2A', timestamp_ms: 90 },
                { step: 'Checking Sentinel-2 bands', status: 'SUCCESS', details: 'B02, B03, B04, B08, B11, B12', timestamp_ms: 140 },
                { step: 'Processing image', status: 'SUCCESS', details: 'Surface reflectance calibrated', timestamp_ms: 220 },
                { step: 'Detecting built-up regions', status: 'SUCCESS', details: 'Morphological segmentation', timestamp_ms: 280 },
                { step: 'Comparing historical imagery', status: 'SUCCESS', details: '2023 baseline delta', timestamp_ms: 310 },
                { step: 'Calculating area', status: 'SUCCESS', details: 'Geodesic area calculated', timestamp_ms: 330 },
                { step: 'Generating explanation', status: 'SUCCESS', details: 'Synthesis complete', timestamp_ms: 340 }
              ]).map((st, sidx) => (
                <div key={sidx} className="flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gis-success shrink-0" />
                    <span className="text-gis-textBright font-medium">{st.step}</span>
                  </div>
                  <span className="text-[10px] text-gis-textMuted">{st.details}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Structured Clean AI Analysis Result */}
        {currentResponse && (
          <div className="space-y-3 pt-1">
            <CleanResultCard
              response={currentResponse}
              onViewEvidence={() => {
                if (currentResponse.evidence_regions && currentResponse.evidence_regions.length > 0) {
                  onSelectEvidence(currentResponse.evidence_regions[0].id);
                }
              }}
              onCompareImages={() => {
                if (onCompareImages) onCompareImages();
              }}
              onGenerateReport={onGenerateReport}
            />

            {/* 3. Evidence Regions */}
            {currentResponse.evidence_regions && currentResponse.evidence_regions.length > 0 && (
              <div className="p-3 rounded-lg bg-gis-bg border border-gis-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-gis-textMuted font-mono">
                    EVIDENCE ({currentResponse.evidence_regions.length} Regions)
                  </span>
                  <div className="flex gap-1">
                    {(['ha', 'km2', 'm2'] as const).map((u) => (
                      <button
                        key={u}
                        onClick={() => setAreaUnit(u)}
                        className={`px-1 py-0.5 rounded text-[8px] font-mono uppercase ${
                          areaUnit === u ? 'bg-gis-accent text-gis-bg font-bold' : 'text-gis-textMuted'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  {currentResponse.evidence_regions.map((ev) => {
                    const isSelected = selectedEvidenceId === ev.id;
                    const areaStr = areaUnit === 'ha' 
                      ? `${ev.area_hectares.toFixed(2)} ha` 
                      : areaUnit === 'km2' 
                      ? `${ev.area_sqkm.toFixed(3)} km²` 
                      : `${(ev.area_hectares * 10000).toLocaleString()} m²`;

                    return (
                      <div
                        key={ev.id}
                        onClick={() => onSelectEvidence(ev.id)}
                        className={`p-2 rounded border cursor-pointer transition-all flex items-center justify-between text-xs ${
                          isSelected
                            ? 'bg-gis-accent/20 border-gis-accent text-gis-textBright font-semibold'
                            : 'bg-gis-panel border-gis-border hover:border-gis-border/80 text-gis-textBright'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-xs">{ev.label}</span>
                          <span className="text-[10px] text-gis-textMuted">{ev.type}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-gis-accent">
                          <span>{areaStr}</span>
                          <Maximize2 className="w-3 h-3 text-gis-textMuted" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Data Used & Technical Specs */}
            <div className="p-3 rounded-lg bg-gis-bg border border-gis-border space-y-2">
              <span className="text-[10px] uppercase font-bold text-gis-textMuted font-mono">
                DATA USED & SENSORS
              </span>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between text-gis-textBright">
                  <span className="text-gis-textMuted">Satellite:</span>
                  <span className="text-gis-accent">{currentResponse.data_used?.satellite || 'Sentinel-2 MSI'}</span>
                </div>
                <div className="flex justify-between text-gis-textBright">
                  <span className="text-gis-textMuted">Product Level:</span>
                  <span>{currentResponse.data_used?.product || 'L2A (Surface Reflectance)'}</span>
                </div>
                <div className="flex justify-between text-gis-textBright">
                  <span className="text-gis-textMuted">Tile / Orbit:</span>
                  <span>Tile 30UUE (Dublin)</span>
                </div>
                <div className="flex justify-between text-gis-textBright">
                  <span className="text-gis-textMuted">Acquisition Dates:</span>
                  <span>08 Sep 2026</span>
                </div>
                <div className="flex justify-between text-gis-textBright">
                  <span className="text-gis-textMuted">Bands / Polarization:</span>
                  <span className="text-[10px] text-gis-textBright">B02, B03, B04, B08, B11, B12</span>
                </div>
              </div>
            </div>

            {/* 5. Method Description */}
            <div className="p-3 rounded-lg bg-gis-bg border border-gis-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-gis-textMuted font-mono">
                METHOD
              </span>
              <p className="text-xs text-gis-textMuted leading-relaxed font-mono text-[11px]">
                {currentResponse.method || 'Multispectral band differencing & radiometric indices (NDVI/NDWI/NDBI) with morphological edge segmentation'}
              </p>
            </div>

            {/* 6. Expandable "Why this result?" */}
            <div className="rounded-lg bg-gis-bg border border-gis-border overflow-hidden">
              <button
                onClick={() => setWhyExpanded(!whyExpanded)}
                className="w-full p-2.5 text-left flex items-center justify-between text-xs font-medium text-gis-textBright hover:bg-gis-hover/50 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-gis-accent" />
                  <span className="font-semibold text-gis-accent">Why this result?</span>
                </div>
                {whyExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {whyExpanded && (
                <div className="p-3 pt-0 text-[11px] text-gis-textMuted leading-relaxed border-t border-gis-border/50 font-mono space-y-1.5">
                  <p>
                    {currentResponse.why_result || 
                      'Sentinel-1 VH backscatter decreased significantly compared with the reference image (-22 dB specular reflection), while Sentinel-2 NDWI increased in the same region, confirming surface boundary shifts.'}
                  </p>
                  <div className="text-[10px] text-gis-textMuted/70">
                    Reliability rationale: {currentResponse.reliability_reason}
                  </div>
                </div>
              )}
            </div>

            {/* Export PDF Report Button */}
            <button
              onClick={onGenerateReport}
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-gis-accent/15 to-gis-accentBlue/15 hover:from-gis-accent/25 hover:to-gis-accentBlue/25 border border-gis-accent/30 text-gis-accent font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5" />
              Generate Official PDF Geospatial Report
            </button>
          </div>
        )}
      </div>

      {/* Query Input Bar (Bottom) */}
      <div className="p-3 border-t border-gis-border bg-gis-bg shrink-0 space-y-2">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-1.5">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={analyzing}
            placeholder="Ask anything about this satellite image..."
            className="flex-1 h-9 pl-3 pr-9 bg-gis-panel border border-gis-border rounded-lg text-xs text-gis-textBright placeholder-gis-textMuted focus:outline-none focus:border-gis-accent disabled:opacity-50 transition-colors"
          />

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={handleMicToggle}
            className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${
              isListening
                ? 'bg-gis-danger text-white border-gis-danger animate-pulse'
                : 'bg-gis-panel border-gis-border text-gis-textMuted hover:text-gis-accent hover:border-gis-accent/40'
            }`}
            title={isListening ? 'Listening... click to stop' : 'Voice Input (Speech to Text)'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!inputQuery.trim() || analyzing}
            className="w-9 h-9 rounded-lg bg-gis-accent hover:bg-gis-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-gis-bg flex items-center justify-center transition-all shadow-sm shadow-gis-accent/20"
            title="Execute Remote Sensing Analysis"
          >
            {analyzing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-gis-textMuted font-mono px-1">
          <span>Multimodal VLM Copilot</span>
          <span>10m Spatial Resolution</span>
        </div>
      </div>
    </aside>
  );
};
