import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Loader2,
  Compass,
  ArrowRight,
  HelpCircle,
  Minimize2,
  Maximize2,
  RotateCcw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  actionLinks?: { label: string; to: string }[];
  timestamp: string;
}

export const SatQueryAssistant: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/':
        return 'Home';
      case '/explore':
        return 'Explore Imagery';
      case '/app':
      case '/analyze':
      case '/dashboard':
        return 'Analyze Workstation';
      case '/compare':
        return 'Compare Scenes';
      case '/history':
      case '/my-work':
        return 'Analysis History';
      case '/reports':
        return 'Intelligence Reports';
      case '/collaborate':
        return 'Collaborative Projects';
      default:
        return 'SatQuery AI';
    }
  };

  const pageName = getPageTitle(location.pathname);

  // Initialize initial greeting when first opened
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'msg-welcome',
          role: 'assistant',
          text: `Hello! I'm your SatQuery Assistant. You are currently on ${pageName}. How can I assist with your satellite imagery analysis?`,
          actionLinks: [
            { label: 'Compare Images →', to: '/compare' },
            { label: 'Analyze Area →', to: '/app' }
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [pageName]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickActions = [
    { label: 'Replay Product Tour', onClick: () => { window.dispatchEvent(new CustomEvent('replay-satquery-tour')); setIsOpen(false); } },
    { label: 'Analyze This Location', onClick: () => { navigate('/app'); setIsOpen(false); } },
    { label: 'Compare Images', onClick: () => { navigate('/compare'); setIsOpen(false); } },
    { label: 'Explain This Result', onClick: () => handleSend('Explain the current satellite analysis result and scientific confidence.') },
    { label: 'Detect Changes', onClick: () => { navigate('/compare'); setIsOpen(false); } },
    { label: 'Generate Report', onClick: () => { navigate('/reports'); setIsOpen(false); } },
    { label: 'Share Project', onClick: () => { navigate('/collaborate'); setIsOpen(false); } },
    { label: 'View History', onClick: () => { navigate('/history'); setIsOpen(false); } }
  ];

  const lastSentQueryRef = useRef<string>('');

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputMessage;
    if (!textToSend.trim() || loading) return;

    lastSentQueryRef.current = textToSend.trim();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.text
      }));

      let storedLoc = null;
      try {
        storedLoc = JSON.parse(localStorage.getItem('satquery_current_location') || 'null');
      } catch (e) {}

      let currentSession = null;
      try {
        const hist = JSON.parse(localStorage.getItem('satquery_conversation_history') || '[]');
        if (hist.length > 0) currentSession = hist[0];
      } catch (e) {}

      const res = await api.chatAssistant({
        message: userMsg.text,
        current_page: location.pathname,
        page_context: {
          active_page: pageName,
          detected_location: storedLoc ? storedLoc.name : 'Unknown Location',
          coordinates: storedLoc ? `${storedLoc.lat}°N, ${storedLoc.lng}°E` : '',
          recent_query: currentSession ? currentSession.query : '',
          recent_answer: currentSession ? currentSession.answer?.slice(0, 150) : '',
          query_param: new URLSearchParams(location.search).get('query') || ''
        },
        history: historyPayload
      });

      const assistantMsg: ChatMessage = {
        id: `assist-${Date.now()}`,
        role: 'assistant',
        text: res.reply,
        actionLinks: res.action_links,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat assistant error:', err);
      // Section 15: If Gemini is unavailable, show "SatQuery Assistant is temporarily unavailable" with [ Try Again ]
      setMessages((prev) => [
        ...prev,
        {
          id: `assist-err-${Date.now()}`,
          role: 'assistant',
          text: 'SatQuery Assistant is temporarily unavailable.',
          actionLinks: [
            { label: 'Try Again', to: '#retry' },
            { label: 'Analyze Current Location', to: '/app' },
            { label: 'Open Comparison', to: '/compare' }
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside aria-label="SatQuery Assistant Chatbot" className="fixed bottom-5 right-5 z-40 select-none font-sans">
      {/* 1. Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#167A4A] hover:bg-[#13673E] text-white shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border border-[#167A4A]/20"
          title="Open SatQuery Assistant"
        >
          <div className="relative">
            <Compass className="w-5 h-5 transition-transform group-hover:rotate-45" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="font-bold text-xs tracking-wide">SatQuery Assistant</span>
        </button>
      )}

      {/* 2. Chat Window Drawer */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[540px] max-h-[85vh] bg-white rounded-2xl border border-[#E3EAE5] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200 text-[#17201B]">
          {/* Header */}
          <div className="px-4 py-3.5 bg-[#FBFDFB] border-b border-[#E3EAE5] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EAF7F0] border border-[#167A4A]/20 flex items-center justify-center text-[#167A4A] shadow-2xs">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs text-[#17201B]">SatQuery Assistant</h3>
                  <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-[#167A4A] text-white font-bold">
                    AI GUIDE
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10.5px] text-[#66736B]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#167A4A] animate-pulse" />
                  <span>Context: {pageName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMessages([])}
                className="p-1 rounded-lg text-[#66736B] hover:text-[#17201B] hover:bg-[#F4F6F5] transition"
                title="Clear Chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-[#66736B] hover:text-[#17201B] hover:bg-[#F4F6F5] transition"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FBFDFB]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#167A4A] text-white font-medium rounded-br-xs shadow-2xs'
                      : 'bg-white text-[#17201B] border border-[#E3EAE5] rounded-bl-xs shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* Clickable Action Navigation Links */}
                  {m.actionLinks && m.actionLinks.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[#E3EAE5] flex flex-wrap gap-1.5">
                      {m.actionLinks.map((link) => (
                        <button
                          key={link.label}
                          type="button"
                          onClick={() => {
                            if (link.to === '#retry') {
                              if (lastSentQueryRef.current) handleSend(lastSentQueryRef.current);
                            } else {
                              navigate(link.to);
                              setIsOpen(false);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#EAF7F0] hover:bg-[#167A4A] text-[#167A4A] hover:text-white border border-[#167A4A]/20 text-[11px] font-bold transition cursor-pointer"
                        >
                          <span>{link.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9.5px] text-[#66736B] mt-1 px-1">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-white border border-[#E3EAE5] rounded-xl text-xs text-[#66736B] w-fit shadow-2xs animate-pulse">
                <Loader2 className="w-3.5 h-3.5 text-[#167A4A] animate-spin" />
                <span>SatQuery Assistant is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Section 16: Quick Actions Buttons (Horizontal scroll) */}
          <div className="px-3 py-2 bg-white border-t border-[#E3EAE5] overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            <span className="text-[10px] font-bold text-[#66736B] uppercase shrink-0">
              Quick Actions:
            </span>
            {quickActions.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                disabled={loading}
                className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-[#F4F6F5] hover:bg-[#EAF7F0] text-[#17201B] hover:text-[#167A4A] border border-[#E3EAE5] hover:border-[#167A4A]/30 transition cursor-pointer font-medium"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-[#E3EAE5] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about SatQuery..."
              disabled={loading}
              className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-[#E3EAE5] bg-[#F8FAFC] text-[#17201B] focus:outline-none focus:border-[#167A4A] focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="w-8 h-8 rounded-xl bg-[#167A4A] hover:bg-[#13673E] disabled:opacity-40 text-white flex items-center justify-center transition shadow-xs cursor-pointer shrink-0"
              title="Send question"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </aside>
  );
};
