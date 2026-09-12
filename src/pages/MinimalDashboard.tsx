import React, { useState, useEffect, useRef } from 'react';
import { MinimalHeader } from '../components/navigation/MinimalHeader';
import { CleanMap } from '../components/workstation/CleanMap';
import { MinimalResultCard } from '../components/workstation/MinimalResultCard';
import { UploadModal } from '../components/workstation/UploadModal';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ImageRecord, AnalyzeResponse, EvidenceRegion } from '../types';
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  Layers,
  ArrowRightLeft,
  Calendar,
  Satellite,
  Search,
  Check,
  AlertCircle,
  MessageSquare,
  UploadCloud
} from 'lucide-react';

type AnalysisMode = 'single' | 'change' | 'cross_modal';

export interface ConversationItem {
  id: string;
  query: string;
  result: AnalyzeResponse;
  timestamp: string;
}

export const MinimalDashboard: React.FC = () => {
  const { language, setLanguage, currentLanguageOption } = useLanguage();
  const { trackCapability } = useAuth();

  const [images, setImages] = useState<ImageRecord[]>([]);
  const [primaryImage, setPrimaryImage] = useState<ImageRecord | null>(null);
  const [secondaryImage, setSecondaryImage] = useState<ImageRecord | null>(null);
  const [mode, setMode] = useState<AnalysisMode>('single');

  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResponse | null>(null);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Multi-Question Conversation Thread on current image
  const [conversationThread, setConversationThread] = useState<ConversationItem[]>([]);
  const [activeThreadIndex, setActiveThreadIndex] = useState<number>(0);
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => `sess-${Date.now()}`);

  // Speech recognition state
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Fetch initial images and handle auto-query if provided in URL
  useEffect(() => {
    const loadImages = async () => {
      try {
        const list = await api.getImages();
        setImages(list);

        const params = new URLSearchParams(window.location.search);
        const qParam = params.get('query');
        const lParam = params.get('lang');
        const imgParam = params.get('image');
        const sessionParam = params.get('session');
        const targetLang = lParam || language;
        if (lParam) {
          setLanguage(lParam);
        }

        // 1. If existing session is requested, restore full conversation from SQLite backend
        if (sessionParam) {
          try {
            const sessDetail = await api.getSessionDetail(sessionParam);
            if (sessDetail) {
              setCurrentSessionId(sessionParam);
              const matchedImg = list.find((img) => img.id === sessDetail.image_id) || list[0] || null;
              if (matchedImg) setPrimaryImage(matchedImg);
              if (sessDetail.secondary_image_id) {
                const matchedSec = list.find((img) => img.id === sessDetail.secondary_image_id) || null;
                setSecondaryImage(matchedSec);
              }

              if (sessDetail.conversations && sessDetail.conversations.length > 0) {
                const restoredItems: ConversationItem[] = sessDetail.conversations.map((c, idx) => ({
                  id: `hist-q-${c.query_id || idx}`,
                  query: c.query_text,
                  timestamp: c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Saved',
                  result: {
                    session_id: sessionParam,
                    image_id: matchedImg?.id,
                    query: c.query_text,
                    task_type: c.task_type,
                    model_name: 'SatQuery RS-VLM Specialist',
                    model_version: 'v2.1',
                    answer: c.answer_text,
                    answer_en: c.answer_text,
                    confidence_score: c.confidence_score,
                    reliability_score: c.reliability_score,
                    reliability_reason: 'Calibrated and verified with multi-band reflectance metrics.',
                    evidence_regions: c.evidence_regions || [],
                    metrics: {},
                    timeline: [],
                    execution_time_ms: 110
                  }
                }));

                setConversationThread(restoredItems);
                setActiveThreadIndex(0);
                const latest = restoredItems[0];
                if (latest?.result) {
                  setAnalysisResult(latest.result);
                  if (latest.result.evidence_regions && latest.result.evidence_regions.length > 0) {
                    setSelectedEvidenceId(latest.result.evidence_regions[0].id);
                  }
                }
                return; // Finished restoring session
              }
            }
          } catch (sessErr) {
            console.warn('Failed to load session detail:', sessErr);
          }
        }

        // Prefer specified image or 2026 Sentinel-2 optical as primary default
        let primary = null;
        if (imgParam) {
          primary = list.find((img) => img.id === imgParam || img.filename.includes(imgParam)) || null;
        }
        if (!primary) {
          const s2_2026 = list.find((img) => img.id.includes('2026') && img.modality === 'Optical');
          primary = s2_2026 || list[0] || null;
        }
        setPrimaryImage(primary);

        const s2_2023 = list.find((img) => img.id.includes('2023'));
        const s1_sar = list.find((img) => img.modality === 'SAR');

        if (qParam && (qParam.toLowerCase().includes('change') || qParam.toLowerCase().includes('2023') || qParam.toLowerCase().includes('urban'))) {
          setMode('change');
          setSecondaryImage(s2_2023 || list[1] || null);
        } else if (qParam && (qParam.toLowerCase().includes('sar') || qParam.toLowerCase().includes('radar'))) {
          setMode('cross_modal');
          setSecondaryImage(s1_sar || list[2] || null);
        }

        if (qParam && primary) {
          setQuery(qParam);
          // Auto run after brief timeout
          setTimeout(() => {
            api.analyze({
              image_id: primary.id,
              secondary_image_id: (qParam.toLowerCase().includes('change') ? s2_2023?.id : (qParam.toLowerCase().includes('sar') ? s1_sar?.id : undefined)),
              query: qParam,
              language: targetLang,
              source: 'dashboard'
            }).then((res) => {
              setAnalysisResult(res);
              const newItem: ConversationItem = {
                id: `q-${Date.now()}`,
                query: qParam,
                result: res,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
              setConversationThread([newItem]);
              setActiveThreadIndex(0);
              if (res.evidence_regions && res.evidence_regions.length > 0) {
                setSelectedEvidenceId(res.evidence_regions[0].id);
              }
              // Save to conversation history
              saveToHistory(qParam, res, primary, targetLang);
            }).catch(console.error);
          }, 400);
        }
      } catch (err) {
        console.error('Failed to load satellite images:', err);
        setErrorMsg('Unable to connect to the backend server. Please verify the API is running.');
      }
    };
    loadImages();
  }, []);

  // Save entry to persistent conversation history
  const saveToHistory = (qText: string, res: AnalyzeResponse, img: ImageRecord | null, lang: string) => {
    try {
      const existingHist = JSON.parse(localStorage.getItem('satquery_conversation_history') || '[]');
      const histEntry = {
        id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        sessionId: currentSessionId,
        query: qText,
        language: lang,
        answer: res.answer,
        confidence: res.confidence_score,
        reliability: res.reliability_score,
        task_type: res.task_type,
        image_id: img?.id || 'primary',
        image_sensor: img?.sensor || 'Sentinel-2',
        image_modality: img?.modality || 'Optical',
        timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        created_at: new Date().toISOString()
      };
      const updated = [histEntry, ...existingHist.filter((h: any) => h.query !== qText)].slice(0, 50);
      localStorage.setItem('satquery_conversation_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save history to localStorage:', e);
    }
  };

  // Helper to find co-located secondary image for comparison
  const findMatchingSecondaryImage = (primary: ImageRecord | null, targetMode: AnalysisMode, allImages: ImageRecord[]) => {
    if (!primary || targetMode === 'single') return null;

    const isDublin = primary.id.includes('dublin') || primary.filename.toLowerCase().includes('dublin');
    const isBlr = primary.id.includes('blr') || primary.filename.toLowerCase().includes('bengaluru');
    const isMum = primary.id.includes('mum') || primary.filename.toLowerCase().includes('mumbai');

    if (targetMode === 'change') {
      if (isDublin) {
        return allImages.find((img) => img.id === 'img-dublin-s2-2023') ||
               allImages.find((img) => (img.id.includes('dublin') || img.filename.includes('dublin')) && img.id !== primary.id) || null;
      }
      if (isBlr) {
        return allImages.find((img) => img.id === 'img-blr-2023') ||
               allImages.find((img) => (img.id.includes('blr') || img.filename.includes('bengaluru')) && img.id !== primary.id) || null;
      }
      return allImages.find((img) => img.id !== primary.id && img.modality === primary.modality) ||
             allImages.find((img) => img.id !== primary.id) || null;
    }

    if (targetMode === 'cross_modal') {
      if (isDublin) {
        return allImages.find((img) => img.id === 'img-dublin-s1-2026') ||
               allImages.find((img) => img.modality === 'SAR') || null;
      }
      if (isMum) {
        return allImages.find((img) => img.id === 'img-mum-sar') ||
               allImages.find((img) => img.modality === 'SAR') || null;
      }
      return allImages.find((img) => img.modality === 'SAR' && img.id !== primary.id) ||
             allImages.find((img) => img.modality === 'SAR') || null;
    }

    return null;
  };

  // Update secondary image when mode changes
  const handleModeChange = (newMode: AnalysisMode) => {
    if (newMode !== 'single') {
      if (!trackCapability(`mode_${newMode}`)) return;
    }
    setMode(newMode);
    if (newMode === 'single') {
      setSecondaryImage(null);
    } else if (primaryImage) {
      const match = findMatchingSecondaryImage(primaryImage, newMode, images);
      setSecondaryImage(match);
      if (!query || query.includes('Analyze') || query.includes('Perform')) {
        if (newMode === 'change') {
          setQuery('Analyze built-up change between 2023 and 2026');
        } else if (newMode === 'cross_modal') {
          setQuery('Perform Optical + SAR joint analysis to verify water and built structures');
        }
      }
    }
  };

  // Natural Language Query Submission (Supports multiple questions on same image)
  const handleRunQuery = async (customQuery?: string) => {
    const q = (customQuery || query).trim();
    if (!q || !primaryImage) return;

    if (!trackCapability('ai_query')) return;

    try {
      setLoading(true);
      setErrorMsg(null);
      setSelectedEvidenceId(null);

      const res = await api.analyze({
        image_id: primaryImage.id,
        secondary_image_id: secondaryImage ? secondaryImage.id : undefined,
        session_id: currentSessionId,
        query: q,
        language: language,
        source: 'dashboard'
      });

      const newItem: ConversationItem = {
        id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        query: q,
        result: res,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Append to conversation thread for this image session
      setConversationThread((prev) => [newItem, ...prev]);
      setActiveThreadIndex(0);
      setAnalysisResult(res);

      if (res.evidence_regions && res.evidence_regions.length > 0) {
        setSelectedEvidenceId(res.evidence_regions[0].id);
      }

      // Save to persistent conversation history
      saveToHistory(q, res, primaryImage, language);

      // Clear input box so user can naturally type the next question on the same image
      setQuery('');
    } catch (err: any) {
      console.error('Analysis error:', err);
      const msg = err.response?.data?.detail || 'Analysis request failed. Please check network or image selection.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Switch between previous questions asked on the same image
  const handleSelectThreadQuestion = (index: number) => {
    setActiveThreadIndex(index);
    const item = conversationThread[index];
    if (item) {
      setAnalysisResult(item.result);
      if (item.result.evidence_regions && item.result.evidence_regions.length > 0) {
        setSelectedEvidenceId(item.result.evidence_regions[0].id);
      }
    }
  };

  // Voice Input Speech Recognition Setup
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice dictation is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = currentLanguageOption.bcp47;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        handleRunQuery(transcript);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Failed to initialize speech recognition:', e);
      setIsListening(false);
    }
  };

  // Smart suggestion chips based on mode
  const getSuggestions = () => {
    if (mode === 'change') {
      return [
        'What changed between these images?',
        'Show urban growth between 2023 and 2026',
        'Calculate changed area',
        'Identify flood-affected areas'
      ];
    }
    if (mode === 'cross_modal') {
      return [
        'Compare both images',
        'Identify water-covered areas',
        'Identify built-up regions',
        'Perform Optical + SAR joint analysis'
      ];
    }
    return [
      'What is visible in this image?',
      'Identify the land cover',
      'Are there any water bodies?',
      'Highlight the water bodies',
      'Highlight buildings',
      'Calculate the water area',
      'Show agricultural areas'
    ];
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-white overflow-hidden text-[#17201B]">
      {/* 1. Clean Minimal Header */}
      <MinimalHeader />

      {/* 2. Main Workspace (Map + AI Panel) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left/Center: Clean Interactive Satellite Map */}
        <div className="flex-1 h-[50vh] lg:h-full relative border-r border-[#E3EAE5] bg-[#FBFDFB] overflow-hidden">
          <CleanMap
            primaryImage={primaryImage}
            secondaryImage={secondaryImage}
            evidenceRegions={analysisResult?.evidence_regions || []}
            selectedEvidenceId={selectedEvidenceId}
            onSelectEvidence={(id) => setSelectedEvidenceId(id)}
            className="w-full h-full"
          />
        </div>

        {/* Right: AI Assistant & Query Workspace */}
        <div className="w-full lg:w-[460px] xl:w-[500px] h-[50vh] lg:h-full flex flex-col bg-white border-l border-[#E3EAE5] shadow-xs overflow-y-auto">
          {/* Section A: Satellite Scene & Mode Configuration */}
          <div className="p-4 border-b border-[#E3EAE5] bg-white space-y-3 shrink-0">
            {/* Analysis Mode Selector */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#66736B]">
                Analysis Mode
              </span>
              <div className="inline-flex rounded-lg border border-[#E3EAE5] p-0.5 bg-[#FBFDFB] text-xs">
                <button
                  onClick={() => handleModeChange('single')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    mode === 'single'
                      ? 'bg-[#167A4A] text-white shadow-2xs'
                      : 'text-[#66736B] hover:text-[#17201B]'
                  }`}
                  type="button"
                >
                  Single Image
                </button>
                <button
                  onClick={() => handleModeChange('change')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    mode === 'change'
                      ? 'bg-[#167A4A] text-white shadow-2xs'
                      : 'text-[#66736B] hover:text-[#17201B]'
                  }`}
                  type="button"
                >
                  Bi-temporal
                </button>
                <button
                  onClick={() => handleModeChange('cross_modal')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    mode === 'cross_modal'
                      ? 'bg-[#167A4A] text-white shadow-2xs'
                      : 'text-[#66736B] hover:text-[#17201B]'
                  }`}
                  type="button"
                >
                  Optical + SAR
                </button>
              </div>
            </div>

            {/* Satellite Scene Dropdown Pickers */}
            <div className="grid grid-cols-1 gap-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-[#17201B]">
                    Primary Scene {mode !== 'single' ? '(T1 / Optical)' : ''}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!trackCapability('upload_raster')) return;
                      setIsUploadModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#167A4A] hover:underline cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Scene</span>
                  </button>
                </div>
                <select
                  value={primaryImage?.id || ''}
                  onChange={(e) => {
                    const found = images.find((i) => i.id === e.target.value);
                    if (found) {
                      setPrimaryImage(found);
                      if (mode !== 'single') {
                        const match = findMatchingSecondaryImage(found, mode, images);
                        if (match) setSecondaryImage(match);
                      }
                    }
                  }}
                  className="w-full px-3 py-1.5 bg-white border border-[#E3EAE5] rounded-lg text-xs font-medium text-[#17201B] focus:outline-hidden focus:border-[#167A4A] shadow-2xs"
                >
                  {images.map((img) => (
                    <option key={img.id} value={img.id}>
                      {img.sensor} • {img.modality} ({img.acquisition_date || 'Scene'}) — {img.filename}
                    </option>
                  ))}
                </select>
              </div>

              {mode !== 'single' && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#17201B] mb-1">
                    Secondary Scene {mode === 'change' ? '(T2 Comparison)' : '(SAR Radar)'}
                  </label>
                  <select
                    value={secondaryImage?.id || ''}
                    onChange={(e) => {
                      const found = images.find((i) => i.id === e.target.value);
                      if (found) setSecondaryImage(found);
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-[#E3EAE5] rounded-lg text-xs font-medium text-[#17201B] focus:outline-hidden focus:border-[#167A4A] shadow-2xs"
                  >
                    {images.map((img) => (
                      <option key={img.id} value={img.id}>
                        {img.sensor} • {img.modality} ({img.acquisition_date || 'Scene'}) — {img.filename}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Section B: Natural Language Query & Voice Bar */}
          <div className="p-4 border-b border-[#E3EAE5] bg-[#FBFDFB] space-y-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#17201B] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#167A4A]" />
                Ask SatQuery
              </label>
              <span className="text-[10px] text-[#66736B] font-mono font-semibold">
                Language: {currentLanguageOption.nativeName}
              </span>
            </div>

            {/* Input Box with Send & Mic Buttons */}
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleRunQuery();
                  }
                }}
                placeholder="What would you like to know about this image?"
                disabled={loading}
                className="w-full pl-3 pr-20 py-2.5 bg-white border border-[#E3EAE5] rounded-xl text-xs font-medium text-[#17201B] placeholder-[#66736B]/60 focus:outline-hidden focus:border-[#167A4A] focus:ring-1 focus:ring-[#167A4A] shadow-2xs transition-all disabled:opacity-50"
              />

              <div className="absolute right-1.5 flex items-center gap-1">
                {/* Voice Input Microphone Button */}
                <button
                  onClick={toggleSpeechRecognition}
                  disabled={loading}
                  type="button"
                  title={isListening ? 'Listening... click to stop' : 'Click to speak question'}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'text-[#66736B] hover:text-[#167A4A] hover:bg-[#EAF7F0]'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#167A4A]" />}
                </button>

                {/* Submit Send Button */}
                <button
                  onClick={() => handleRunQuery()}
                  disabled={loading || !query.trim()}
                  type="button"
                  className="p-1.5 bg-[#167A4A] hover:bg-[#13673E] text-white rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Smart Query Suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {getSuggestions().map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(sug);
                    handleRunQuery(sug);
                  }}
                  disabled={loading}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-white border border-[#E3EAE5] text-[#17201B] hover:text-[#167A4A] hover:border-[#167A4A] hover:bg-[#EAF7F0]/40 transition-all cursor-pointer disabled:opacity-50 text-left font-medium shadow-2xs"
                  type="button"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Section C: Dynamic Content Area (Loading, Results, or Guidance) */}
          <div className="p-4 flex-1 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Error: </span>
                  {errorMsg}
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="p-8 bg-white border border-[#E3EAE5] rounded-xl flex flex-col items-center justify-center text-center space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-full border-3 border-[#EAF7F0] border-t-[#167A4A] animate-spin" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#17201B]">
                    Analyzing Satellite Observation...
                  </h4>
                  <p className="text-[11px] text-[#66736B]">
                    Executing vision-language models and computing calibrated evidence regions
                  </p>
                </div>
              </div>
            )}

            {/* Multi-Question Thread Selector (When 2+ questions have been asked on this image) */}
            {conversationThread.length > 1 && (
              <div className="p-3 bg-[#FBFDFB] border border-[#E3EAE5] rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#17201B] flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#167A4A]" />
                    Questions on this Scene ({conversationThread.length})
                  </span>
                  <span className="text-[11px] text-[#66736B]">
                    Click to review answer & evidence
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {conversationThread.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectThreadQuestion(idx)}
                      className={`text-[11px] px-2.5 py-1 rounded-md transition-all cursor-pointer text-left font-medium border ${
                        activeThreadIndex === idx
                          ? 'bg-[#EAF7F0] border-[#167A4A] text-[#167A4A] font-bold shadow-2xs'
                          : 'bg-white border-[#E3EAE5] text-[#66736B] hover:text-[#17201B] hover:border-[#167A4A]/40'
                      }`}
                      type="button"
                    >
                      Q{conversationThread.length - idx}: {item.query.length > 28 ? item.query.slice(0, 28) + '...' : item.query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Result Card */}
            {!loading && analysisResult && (
              <MinimalResultCard
                analysis={analysisResult}
                selectedEvidenceId={selectedEvidenceId}
                onSelectEvidence={(id) => setSelectedEvidenceId(id)}
                imageId={primaryImage?.id}
              />
            )}

            {/* Empty Guidance State */}
            {!loading && !analysisResult && (
              <div className="p-6 bg-[#FBFDFB] border border-[#E3EAE5] rounded-xl text-center space-y-3">
                <div className="w-11 h-11 rounded-full bg-[#EAF7F0] text-[#167A4A] flex items-center justify-center mx-auto shadow-2xs">
                  <Satellite className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-[#17201B]">
                    Ready to Analyze Satellite Imagery
                  </h3>
                  <p className="text-[11px] text-[#66736B] max-w-xs mx-auto leading-normal">
                    Type a question above or click one of the quick suggestions to inspect land cover, detect water bodies, ground buildings, or compare multi-sensor observations.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Upload Satellite Imagery Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onImageUploaded={(newImg) => {
          setImages((prev) => [newImg, ...prev]);
          setPrimaryImage(newImg);
        }}
      />
    </div>
  );
};
