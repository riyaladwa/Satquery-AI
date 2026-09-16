import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Globe, Check, Sparkles, FileText, Clock, Compass, GitCompare, LogOut, User as UserIcon, Users, Search, Home } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const MinimalHeader: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage, currentLanguageOption, t } = useLanguage();
  const { user, signOut, usedCapabilities, openAuthModal } = useAuth();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-[#E3EAE5] px-3 sm:px-6 flex items-center justify-between z-30 select-none shrink-0 sticky top-0 shadow-2xs">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-left cursor-pointer focus:outline-hidden group"
          type="button"
        >
          <div className="w-9 h-9 rounded-lg bg-[#EAF7F0] border border-[#167A4A]/20 flex items-center justify-center text-[#167A4A] shadow-2xs group-hover:bg-[#167A4A] group-hover:text-white transition-colors">
            <Compass className="w-5 h-5 transition-transform group-hover:rotate-45" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-[#17201B]">
                SatQuery
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#167A4A] text-white font-bold">
                AI
              </span>
            </div>
            <span className="text-[10.5px] text-[#66736B] hidden xl:inline font-medium">
              Multimodal Remote Sensing Assistant
            </span>
          </div>
        </button>
      </div>

      {/* Center: Global Navigation Links (Explore, Analyze, Compare, History, Reports, Collaborate) */}
      <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-full py-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              isActive
                ? 'bg-[#EAF7F0] text-[#167A4A] border border-[#167A4A]/20 shadow-2xs font-bold'
                : 'text-[#66736B] hover:text-[#17201B] hover:bg-[#FBFDFB] border border-transparent'
            }`
          }
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Home</span>
        </NavLink>

        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              isActive
                ? 'bg-[#EAF7F0] text-[#167A4A] border border-[#167A4A]/20 shadow-2xs font-bold'
                : 'text-[#66736B] hover:text-[#17201B] hover:bg-[#FBFDFB] border border-transparent'
            }`
          }
        >
          <Search className="w-3.5 h-3.5" />
          <span>Explore</span>
        </NavLink>

        <NavLink
          to="/app"
          className={({ isActive }) =>
            `flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              isActive
                ? 'bg-[#EAF7F0] text-[#167A4A] border border-[#167A4A]/20 shadow-2xs font-bold'
                : 'text-[#66736B] hover:text-[#17201B] hover:bg-[#FBFDFB] border border-transparent'
            }`
          }
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Analyze</span>
        </NavLink>

        <NavLink
          to="/compare"
          id="tour-compare"
          className={({ isActive }) =>
            `flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              isActive
                ? 'bg-[#EAF7F0] text-[#167A4A] border border-[#167A4A]/20 shadow-2xs font-bold'
                : 'text-[#66736B] hover:text-[#17201B] hover:bg-[#FBFDFB] border border-transparent'
            }`
          }
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>Compare</span>
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            `flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              isActive
                ? 'bg-[#EAF7F0] text-[#167A4A] border border-[#167A4A]/20 shadow-2xs font-bold'
                : 'text-[#66736B] hover:text-[#17201B] hover:bg-[#FBFDFB] border border-transparent'
            }`
          }
        >
          <Clock className="w-3.5 h-3.5" />
          <span>History</span>
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              isActive
                ? 'bg-[#EAF7F0] text-[#167A4A] border border-[#167A4A]/20 shadow-2xs font-bold'
                : 'text-[#66736B] hover:text-[#17201B] hover:bg-[#FBFDFB] border border-transparent'
            }`
          }
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Reports</span>
        </NavLink>

        <NavLink
          to="/collaborate"
          id="tour-collaborate"
          className={({ isActive }) =>
            `flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              isActive
                ? 'bg-[#EAF7F0] text-[#167A4A] border border-[#167A4A]/20 shadow-2xs font-bold'
                : 'text-[#66736B] hover:text-[#17201B] hover:bg-[#FBFDFB] border border-transparent'
            }`
          }
        >
          <Users className="w-3.5 h-3.5" />
          <span>Collaborate</span>
        </NavLink>
      </nav>

      {/* Right: 8-Language Selector & Status */}
      <div className="flex items-center gap-3">
        {/* Multilingual Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setLangDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E3EAE5] bg-white hover:bg-[#FBFDFB] text-[#17201B] text-xs font-semibold transition-all shadow-2xs cursor-pointer focus:outline-hidden"
            title="Select language"
            type="button"
          >
            <Globe className="w-3.5 h-3.5 text-[#167A4A]" />
            <span className="font-bold text-[#17201B]">{currentLanguageOption.nativeName}</span>
            <span className="text-[11px] text-[#66736B] hidden md:inline">({currentLanguageOption.name})</span>
            <svg
              className={`w-3 h-3 text-[#66736B] transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {langDropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-[#E3EAE5] rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3.5 py-1.5 border-b border-[#E3EAE5]/60 text-[10px] uppercase font-bold tracking-wider text-[#66736B]">
                Languages (8)
              </div>
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = lang.code === language;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#EAF7F0] text-[#167A4A] font-bold'
                        : 'text-[#17201B] hover:bg-[#FBFDFB]'
                    }`}
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{lang.nativeName}</span>
                      <span className="text-[11px] text-[#66736B]">({lang.name})</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#167A4A] shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Engine Ready Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF7F0] border border-[#167A4A]/20 text-[#167A4A] text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#167A4A] animate-pulse" />
          <span>{t('engineOnline')}</span>
        </div>

        {/* User / Supabase Auth Button */}
        {user ? (
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setUserDropdownOpen((prev) => !prev)}
              className="w-8 h-8 rounded-full bg-[#167A4A] text-white flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer hover:opacity-90 transition-opacity focus:outline-hidden"
              type="button"
              title={user.email}
            >
              {user.email ? user.email[0].toUpperCase() : 'U'}
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E3EAE5] rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in duration-150">
                <div className="px-3.5 py-2 border-b border-[#E3EAE5]/60">
                  <div className="text-xs font-bold text-[#17201B] truncate">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-[#66736B] truncate">{user.email}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#167A4A] bg-[#EAF7F0] px-1.5 py-0.5 rounded font-bold">
                    <span>Unlimited Access</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    setUserDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] text-[#66736B] font-mono hidden sm:inline bg-[#F4F6F5] px-2 py-1 rounded border border-[#E3EAE5]">
              {usedCapabilities.length}/2 Free
            </span>
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="px-3 py-1.5 rounded-lg bg-[#EAF7F0] hover:bg-[#167A4A] text-[#167A4A] hover:text-white border border-[#167A4A]/30 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
