import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Sprout,
  Waves,
  Globe2,
  Calendar,
  ArrowRight,
  Sparkles,
  Trash2,
  Loader2,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { MinimalHeader } from '../components/navigation/MinimalHeader';
import { api } from '../services/api';
import { HistorySession } from '../types';

interface DisplayRecord {
  id: string;
  sessionId: string;
  title: string;
  sensor: string;
  dateRange: string;
  resultSummary: string;
  lastAnalyzed: string;
  workflow: string;
  query: string;
  queryCount: number;
  confidence: number;
  reliability: string;
  icon: any;
  isBackend: boolean;
}

export const MyWork: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [sessions, setSessions] = useState<DisplayRecord[]>([]);

  const defaultAnalyses: DisplayRecord[] = [
    {
      id: 'a1',
      sessionId: 'demo-sess-1',
      title: 'Dublin Urban Growth',
      sensor: 'Sentinel-2 L2A',
      dateRange: '2023 → 2026',
      resultSummary: '14.8% expansion • 2.8 km² new built-up area',
      lastAnalyzed: 'Recent',
      workflow: 'urban',
      query: 'Has this city expanded between 2023 and 2026?',
      queryCount: 2,
      confidence: 94.2,
      reliability: 'High',
      icon: Building2,
      isBackend: false
    },
    {
      id: 'a2',
      sessionId: 'demo-sess-2',
      title: 'Crop Health — Karnataka Basin',
      sensor: 'Sentinel-2 Multispectral',
      dateRange: 'Season 2026',
      resultSummary: '42.8 ha monitored • 84% healthy canopy vigor',
      lastAnalyzed: 'Recent',
      workflow: 'agriculture',
      query: 'Assess crop health and canopy vigor',
      queryCount: 1,
      confidence: 91.0,
      reliability: 'High',
      icon: Sprout,
      isBackend: false
    },
    {
      id: 'a3',
      sessionId: 'demo-sess-3',
      title: 'Flood Assessment — Kerala',
      sensor: 'Sentinel-1 C-SAR (Radar)',
      dateRange: 'August 2024 Crest',
      resultSummary: 'High inundation • 18 flood polygons identified',
      lastAnalyzed: 'Recent',
      workflow: 'disaster',
      query: 'Map flood inundation extents and affected area',
      queryCount: 3,
      confidence: 96.5,
      reliability: 'High',
      icon: Waves,
      isBackend: false
    },
    {
      id: 'a4',
      sessionId: 'demo-sess-4',
      title: 'Land Cover — Dublin Bay',
      sensor: 'Sentinel-2 L2A',
      dateRange: '08 Sep 2026',
      resultSummary: '8 discrete surface classes classified',
      lastAnalyzed: 'Recent',
      workflow: 'environment',
      query: 'Classify land cover surfaces into 8 classes',
      queryCount: 1,
      confidence: 89.4,
      reliability: 'High',
      icon: Globe2,
      isBackend: false
    }
  ];

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const backendSessions = await api.getSessions();

      if (backendSessions && backendSessions.length > 0) {
        const mapped: DisplayRecord[] = backendSessions.map((s: HistorySession) => {
          let Icon = Globe2;
          const qLower = s.title.toLowerCase();
          if (qLower.includes('change') || qLower.includes('urban') || qLower.includes('grow')) Icon = Building2;
          else if (qLower.includes('crop') || qLower.includes('agri') || qLower.includes('plant')) Icon = Sprout;
          else if (qLower.includes('flood') || qLower.includes('water') || qLower.includes('disaster')) Icon = Waves;

          const createdDate = s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Today';

          return {
            id: s.id,
            sessionId: s.id,
            title: s.title.replace('Analysis: ', ''),
            sensor: s.analysis_type || 'Agentic VLM',
            dateRange: createdDate,
            resultSummary: `${s.query_count} query log${s.query_count > 1 ? 's' : ''} recorded • Confidence: ${s.latest_confidence}%`,
            lastAnalyzed: s.updated_at ? new Date(s.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Saved',
            workflow: s.analysis_type,
            query: s.title.replace('Analysis: ', ''),
            queryCount: s.query_count,
            confidence: s.latest_confidence,
            reliability: s.latest_reliability,
            icon: Icon,
            isBackend: true
          };
        });

        setSessions(mapped);
      } else {
        // Fallback to demo items if no sessions have been logged yet
        setSessions(defaultAnalyses);
      }
    } catch (err) {
      console.error('Failed to load history sessions:', err);
      setSessions(defaultAnalyses);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleOpenAnalysis = (rec: DisplayRecord) => {
    if (rec.isBackend) {
      navigate(`/app?session=${encodeURIComponent(rec.sessionId)}`);
    } else {
      navigate(`/app?query=${encodeURIComponent(rec.query)}`);
    }
  };

  const handleDelete = async (id: string, isBackend: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this analysis session?')) return;

    if (isBackend) {
      try {
        await api.deleteSession(id);
        setSessions((prev) => prev.filter((s) => s.id !== id));
      } catch (err) {
        console.error('Failed to delete session:', err);
        alert('Failed to delete session from server.');
      }
    } else {
      setSessions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="min-h-screen w-screen bg-white text-[#17201B] font-sans flex flex-col select-none overflow-x-hidden">
      <MinimalHeader />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#E3EAE5]">
          <div>
            <h1 className="text-2xl font-bold text-[#17201B] flex items-center gap-2">
              <span>Conversation History</span>
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-[#EAF7F0] border border-[#167A4A]/20 text-[#167A4A] font-semibold">
                {sessions.length} Recorded Sessions
              </span>
            </h1>
            <p className="text-xs text-[#66736B] mt-1">
              Persistent multi-turn conversations, spatial evidence bounding boxes, and calibrated satellite findings.
            </p>
          </div>

          <button
            onClick={() => navigate('/app')}
            className="px-4 py-2 rounded-lg bg-[#167A4A] hover:bg-[#13673E] text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Query in Dashboard</span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#167A4A]" />
            <span className="text-xs font-semibold text-[#66736B]">Loading sessions from database...</span>
          </div>
        ) : sessions.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center rounded-xl bg-white border border-[#E3EAE5] max-w-md mx-auto my-12 space-y-3 shadow-xs">
            <h3 className="text-sm font-semibold text-[#17201B]">No analyses yet</h3>
            <p className="text-xs text-[#66736B]">
              Start by querying your satellite imagery in the dashboard.
            </p>
            <button
              onClick={() => navigate('/app')}
              className="px-5 py-2 rounded-lg bg-[#167A4A] text-white font-semibold text-xs inline-flex items-center gap-1.5 mt-2 cursor-pointer shadow-xs"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((rec) => {
              const Icon = rec.icon;
              return (
                <div
                  key={rec.id}
                  onClick={() => handleOpenAnalysis(rec)}
                  className="p-4 rounded-xl bg-white border border-[#E3EAE5] hover:border-[#167A4A] hover:shadow-xs cursor-pointer transition-all duration-200 group flex flex-col justify-between shadow-2xs"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-[#EAF7F0] border border-[#167A4A]/20 group-hover:bg-[#167A4A] group-hover:text-white flex items-center justify-center text-[#167A4A] transition-all">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-[#17201B] group-hover:text-[#167A4A] transition-colors line-clamp-1">
                            {rec.title}
                          </h3>
                          <span className="text-[11px] font-mono text-[#66736B]">
                            {rec.sensor} &bull; {rec.dateRange}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDelete(rec.id, rec.isBackend, e)}
                        className="text-[#66736B] hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-[#17201B] font-mono bg-[#FBFDFB] p-2.5 rounded-lg border border-[#E3EAE5]">
                      {rec.resultSummary}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E3EAE5] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#66736B] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#167A4A]" />
                      <span>Updated: {rec.lastAnalyzed}</span>
                    </span>

                    <span className="text-xs font-semibold text-[#167A4A] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      <span>Resume in Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
