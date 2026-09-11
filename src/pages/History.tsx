import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { History as HistoryIcon, MessageSquare, Trash2, ExternalLink, Calendar, ShieldCheck, Loader2 } from 'lucide-react';

export const History: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<any>(null);

  const fetchSessions = () => {
    setLoading(true);
    api.getSessions()
      .then((data) => setSessions(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleOpenSession = (sessId: string) => {
    api.getSessionDetail(sessId)
      .then((data) => setSelectedSessionDetail(data))
      .catch((err) => console.error(err));
  };

  const handleDeleteSession = async (sessId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteSession(sessId);
      if (selectedSessionDetail?.session_id === sessId) {
        setSelectedSessionDetail(null);
      }
      fetchSessions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 select-none bg-gis-bg">
      <div className="border-b border-gis-border pb-4">
        <h1 className="text-xl font-bold text-gis-textBright flex items-center gap-2">
          <HistoryIcon className="w-5 h-5 text-gis-accent" />
          <span>Analysis Sessions & Conversation History</span>
        </h1>
        <p className="text-xs text-gis-textMuted mt-1">
          Historical record of multi-turn conversational queries, spatial evidence delineations, and reliability audits
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List of Sessions */}
        <div className="lg:col-span-1 space-y-2.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-gis-textMuted">
            Recorded Sessions ({sessions.length})
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-gis-textMuted flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-gis-accent" />
              <span>Loading session registry...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-6 bg-gis-surface border border-gis-border rounded-lg text-center text-xs text-gis-textMuted">
              No previous analysis sessions recorded yet. Launch an inquiry from Explore.
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {sessions.map((s) => {
                const isSelected = selectedSessionDetail?.session_id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => handleOpenSession(s.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-gis-accent/15 border-gis-accent'
                        : 'bg-gis-surface border-gis-border hover:bg-gis-hover'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-gis-textBright line-clamp-1">
                        {s.title}
                      </span>
                      <button
                        onClick={(e) => handleDeleteSession(s.id, e)}
                        className="text-gis-textMuted hover:text-gis-danger p-1"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gis-textMuted">
                      <span>Type: <b className="text-gis-textBright font-normal">{s.analysis_type}</b></span>
                      <span className="font-mono text-gis-success">{s.latest_confidence}% conf</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gis-textMuted pt-1 border-t border-gis-border/40 font-mono">
                      <span>{s.query_count} queries</span>
                      <span>{s.updated_at ? s.updated_at.split('T')[0] : ''}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Session Details Viewer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-gis-textMuted">
            Session Conversation Log
          </div>

          {!selectedSessionDetail ? (
            <div className="p-12 bg-gis-surface border border-gis-border rounded-lg text-center text-xs text-gis-textMuted">
              Select a session on the left to inspect multi-turn conversation exchanges and evidence details.
            </div>
          ) : (
            <div className="bg-gis-surface border border-gis-border rounded-lg p-4 space-y-4 select-text">
              <div className="flex items-center justify-between pb-3 border-b border-gis-border">
                <div>
                  <h2 className="text-sm font-bold text-gis-textBright">{selectedSessionDetail.title}</h2>
                  <div className="text-[10px] text-gis-textMuted font-mono">Session ID: {selectedSessionDetail.session_id}</div>
                </div>
                <button
                  onClick={() => navigate('/explore')}
                  className="px-3 py-1 rounded bg-gis-accent hover:bg-gis-accentCyan text-white text-xs font-semibold flex items-center gap-1 transition"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Resume in Explore</span>
                </button>
              </div>

              {/* Conversational Stream */}
              <div className="space-y-4">
                {selectedSessionDetail.conversations.map((item: any, idx: number) => (
                  <div key={idx} className="space-y-2 pb-3 border-b border-gis-border/50 last:border-0">
                    {/* User Query Bubble */}
                    <div className="flex items-start gap-2 text-xs">
                      <div className="w-6 h-6 rounded bg-gis-panel border border-gis-border flex items-center justify-center text-gis-accent shrink-0 font-bold text-[10px]">
                        Q
                      </div>
                      <div className="p-2.5 rounded-md bg-gis-panel border border-gis-border text-gis-textBright font-medium">
                        "{item.query_text}"
                      </div>
                    </div>

                    {/* AI Answer Bubble */}
                    <div className="flex items-start gap-2 text-xs pl-4">
                      <div className="w-6 h-6 rounded bg-gis-accent text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                        AI
                      </div>
                      <div className="p-3 rounded-md bg-gis-bg border border-gis-border text-gis-textBright space-y-2 flex-1">
                        <div className="flex items-center justify-between text-[11px] text-gis-textMuted">
                          <span className="font-semibold text-gis-accent">{item.task_type}</span>
                          <span className="font-mono text-gis-success">{item.confidence_score}% Confidence</span>
                        </div>
                        <p className="leading-relaxed">{item.answer_text}</p>

                        {item.evidence_regions && item.evidence_regions.length > 0 && (
                          <div className="pt-2 border-t border-gis-border/60 text-[11px] text-gis-accentCyan font-mono">
                            Delineated {item.evidence_regions.length} verified evidence regions
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
