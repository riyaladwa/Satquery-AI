import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../services/supabase';
import { Compass, X, Lock, Mail, User, AlertCircle, Loader2, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    signIn,
    signUp,
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

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isSupabaseConfigured()) {
      setErrorMsg(
        'Supabase is not yet configured with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
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
          setErrorMsg(error.message || 'Invalid email or password.');
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setErrorMsg(error.message || 'Failed to create account.');
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
        <div className="px-6 pt-6 pb-4 border-b border-[#E3EAE5] flex items-start justify-between bg-[#F8FAF9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF7F0] border border-[#167A4A]/20 flex items-center justify-center text-[#167A4A] shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-[#17201B]">SatQuery</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#167A4A] text-white font-bold">AI</span>
              </div>
              <p className="text-xs text-[#66736B]">Supabase Authentication</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
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
                <span>Processing...</span>
              </>
            ) : mode === 'signin' ? (
              <span>Sign In with Supabase</span>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="px-6 py-3 bg-[#F8FAF9] border-t border-[#E3EAE5] text-center text-[10.5px] text-[#66736B]">
          Powered by Supabase Database & Auth &bull; 256-bit SSL encrypted
        </div>
      </div>
    </div>
  );
};
