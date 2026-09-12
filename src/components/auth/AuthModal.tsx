import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured, checkSupabaseHealth, supabaseUrl } from '../../services/supabase';
import { Compass, X, Lock, Mail, User, AlertCircle, Loader2, Sparkles, FileText, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    signIn,
    signUp,
    loginAsDemoAnalyst,
    authModalTitle,
    authModalSubtitle,
    authModalReason,
    usedCapabilities
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ connected: boolean; latencyMs?: number }>({
    connected: isSupabaseConfigured(),
    latencyMs: undefined
  });

  // Verify Supabase live connectivity on modal open
  useEffect(() => {
    if (isAuthModalOpen) {
      checkSupabaseHealth().then((res) => {
        setConnectionStatus({ connected: res.connected, latencyMs: res.latencyMs });
      });
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const projectId = supabaseUrl.replace('https://', '').split('.')[0] || 'active';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isSupabaseConfigured()) {
      setErrorMsg(
        'Supabase credentials are not detected. You can use 1-Click Analyst Sign In below to continue.'
      );
      return;
    }

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          const msg = error.message?.toLowerCase() || '';
          if (msg.includes('invalid login credentials') || error.code === 'invalid_credentials') {
            setErrorMsg(
              'Invalid credentials. If you haven\'t created an account yet, please click "Create Account" tab above, or use 1-Click Analyst Sign In below.'
            );
          } else {
            setErrorMsg(error.message || 'Invalid email or password.');
          }
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.code === 'over_email_send_rate_limit' || error.message?.toLowerCase().includes('rate limit')) {
            setErrorMsg(
              'Supabase email rate limit reached (3/hr on free tier). You can disable "Confirm Email" in Supabase Auth Settings, or click 1-Click Analyst Sign In below for instant access.'
            );
          } else {
            setErrorMsg(error.message || 'Failed to create account.');
          }
        } else {
          setSuccessMsg('Account created successfully! You are now logged in.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E3EAE5] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 pb-3.5 border-b border-[#E3EAE5] flex items-start justify-between bg-[#F8FAF9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF7F0] border border-[#167A4A]/20 flex items-center justify-center text-[#167A4A] shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-[#17201B]">SatQuery</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#167A4A] text-white font-bold">AI</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-medium text-[#167A4A]">
                  Supabase Connected ({projectId})
                </span>
                {connectionStatus.latencyMs !== undefined && (
                  <span className="text-[10px] font-mono text-[#66736B]">
                    • {connectionStatus.latencyMs}ms
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-[#66736B] hover:text-[#17201B] hover:bg-[#E3EAE5]/60 transition-colors cursor-pointer"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informative Context Banner */}
        <div className="px-6 py-3 bg-[#EAF7F0]/60 border-b border-[#167A4A]/10">
          <div className="flex items-start gap-2.5">
            {authModalReason === 'download_report' ? (
              <FileText className="w-4 h-4 text-[#167A4A] shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#167A4A] shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="text-xs font-bold text-[#167A4A]">{authModalTitle}</h4>
              <p className="text-[11px] text-[#486353] leading-relaxed mt-0.5">
                {authModalSubtitle}
              </p>
            </div>
          </div>

          {authModalReason === 'capability_limit' && (
            <div className="mt-2 flex items-center justify-between text-[10.5px] font-mono px-2 py-1 rounded bg-white border border-[#167A4A]/20 text-[#167A4A]">
              <span>Free capabilities explored:</span>
              <span className="font-bold">{usedCapabilities.length} / 2 (Limit Reached)</span>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-[#F4F6F5] border-b border-[#E3EAE5]">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-white text-[#17201B] shadow-xs'
                : 'text-[#66736B] hover:text-[#17201B]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-[#17201B] shadow-xs'
                : 'text-[#66736B] hover:text-[#17201B]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#66736B] uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#9AA6B2] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Kumar"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E3EAE5] bg-[#FBFDFB] text-xs text-[#17201B] placeholder-[#9AA6B2] focus:outline-hidden focus:border-[#167A4A] focus:ring-1 focus:ring-[#167A4A]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#66736B] uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9AA6B2] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@isro.gov.in"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E3EAE5] bg-[#FBFDFB] text-xs text-[#17201B] placeholder-[#9AA6B2] focus:outline-hidden focus:border-[#167A4A] focus:ring-1 focus:ring-[#167A4A]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#66736B] uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9AA6B2] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E3EAE5] bg-[#FBFDFB] text-xs text-[#17201B] placeholder-[#9AA6B2] focus:outline-hidden focus:border-[#167A4A] focus:ring-1 focus:ring-[#167A4A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-lg bg-[#167A4A] hover:bg-[#13673E] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting to Supabase...</span>
              </>
            ) : mode === 'signin' ? (
              <span>Sign In with Supabase</span>
            ) : (
              <span>Create Account</span>
            )}
          </button>

          {/* Quick 1-Click Access Divider & Button */}
          <div className="pt-2">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#E3EAE5]" />
              <span className="flex-shrink mx-2 text-[10px] text-[#66736B] uppercase font-mono tracking-wider">
                Instant Analyst Access
              </span>
              <div className="flex-grow border-t border-[#E3EAE5]" />
            </div>
            <button
              type="button"
              onClick={() => loginAsDemoAnalyst('Dr. Ramesh Kumar', 'analyst@isro.gov.in')}
              className="mt-1.5 w-full py-2.5 px-3 rounded-lg bg-[#EAF7F0] hover:bg-[#D3EFE0] border border-[#167A4A]/30 text-[#167A4A] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-[#167A4A]" />
              <span>1-Click Sign In as Verified ISRO Analyst</span>
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="px-6 py-2.5 bg-[#F8FAF9] border-t border-[#E3EAE5] text-center text-[10.5px] text-[#66736B] flex items-center justify-center gap-2">
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          <span>Connected to Supabase ({projectId}.supabase.co) &bull; SSL Encrypted</span>
        </div>
      </div>
    </div>
  );
};
