import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, X, MessageSquare, Trash2, ArrowUpRight } from 'lucide-react';
import { api } from '../../../services/api';

interface HistoryDrawerProps {
  onClose: () => void;
  onSelectSession: (session: any) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  onClose,
  onSelectSession
}) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await api.getSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await api.deleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  return (
    <div className="w-80 bg-gis-panel border-r border-gis-border h-full flex flex-col z-20 shadow-2xl shadow-black/80 animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="p-3 border-b border-gis-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HistoryIcon className="w-4 h-4 text-gis-accent" />
          <h3 className="font-semibold text-xs text-gis-textBright uppercase tracking-wider">
            Conversation History
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-gis-textMuted hover:text-gis-textBright hover:bg-gis-hover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="text-[10px] text-gis-textMuted uppercase font-semibold tracking-wider">
          Recent Satellite Conversations
        </div>

        {sessions.length === 0 ? (
          <div className="p-4 text-center text-gis-textMuted text-xs space-y-1">
            <MessageSquare className="w-6 h-6 text-gis-textMuted/40 mx-auto" />
            <p>No recorded sessions yet.</p>
            <p className="text-[10px] text-gis-textMuted/70">Submit a query in the AI Copilot to start a session.</p>
          </div>
        ) : (
          sessions.map((sess) => (
            <div
              key={sess.id}
              onClick={() => onSelectSession(sess)}
              className="p-2.5 rounded-lg bg-gis-bg border border-gis-border hover:border-gis-border/80 hover:bg-gis-hover/50 cursor-pointer transition-all group"
            >
              <div className="flex items-start justify-between gap-1">
                <span className="font-medium text-xs text-gis-textBright group-hover:text-gis-accent transition-colors line-clamp-1">
                  {sess.title || sess.analysis_type}
                </span>
                <button
                  onClick={(e) => handleDelete(e, sess.id)}
                  className="p-1 rounded text-gis-textMuted/50 hover:text-gis-danger hover:bg-gis-danger/10 transition-colors"
                  title="Delete Session"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-gis-textMuted font-mono mt-1">
                <span>{sess.queries_count || 1} inquiries</span>
                <span>{new Date(sess.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
