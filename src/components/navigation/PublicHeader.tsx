import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Check, ArrowRight, Compass } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../context/LanguageContext';

export const PublicHeader: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage, currentLanguageOption, t } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="h-18 bg-white/95 backdrop-blur-md border-b border-[#E3EAE5] px-4 sm:px-8 flex items-center justify-between z-30 select-none shrink-0 sticky top-0">
      {/* Left: Brand Logo & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 text-left cursor-pointer focus:outline-hidden group"
          type="button"
        >
          <div className="w-9 h-9 rounded-lg bg-[#EAF7F0] border border-[#167A4A]/20 flex items-center justify-center text-[#167A4A] group-hover:bg-[#167A4A] group-hover:text-white transition-colors">
            <Compass className="w-5 h-5 transition-transform group-hover:rotate-45" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-[#17201B]">
              SatQuery
            </span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#EAF7F0] text-[#167A4A] font-bold border border-[#167A4A]/20">
              AI
            </span>
          </div>
        </button>
      </div>

      {/* Center: Navigation Links */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#66736B]">
        <button
          onClick={() => scrollToSection('product')}
          className="hover:text-[#17201B] transition-colors cursor-pointer"
          type="button"
        >
          {t('product')}
        </button>
        <button
          onClick={() => scrollToSection('how-it-works')}
          className="hover:text-[#17201B] transition-colors cursor-pointer"
          type="button"
        >
          {t('howItWorks')}
        </button>
        <button
          onClick={() => scrollToSection('capabilities')}
          className="hover:text-[#17201B] transition-colors cursor-pointer"
          type="button"
        >
          {t('capabilities')}
        </button>
        <button
          onClick={() => navigate('/reports')}
          className="hover:text-[#17201B] transition-colors cursor-pointer"
          type="button"
        >
          {t('reports')}
        </button>
      </nav>

      {/* Right: Language Selector & CTA */}
      <div className="flex items-center gap-3.5">
        {/* Language dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setLangDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E3EAE5] bg-white hover:bg-[#FBFDFB] text-[#17201B] text-xs font-semibold transition-all cursor-pointer focus:outline-hidden"
            title="Choose language"
            type="button"
          >
            <Globe className="w-3.5 h-3.5 text-[#167A4A]" />
            <span>{currentLanguageOption.nativeName}</span>
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
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E3EAE5] rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
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

        {/* Start Analyzing Primary Button */}
        <button
          onClick={() => navigate('/app')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#167A4A] hover:bg-[#13673E] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
          type="button"
        >
          <span>{t('startAnalyzing')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
