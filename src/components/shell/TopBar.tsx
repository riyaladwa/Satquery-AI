import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Globe,
  Mic,
  Bell,
  Cpu,
  Layers,
  Database,
  UserCheck,
  CheckCircle2
} from 'lucide-react';

interface TopBarProps {
  onSearch?: (term: string) => void;
  systemStatus?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ systemStatus = 'ONLINE' }) => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' }
  ];

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setLangDropdownOpen(false);
  };

  return (
    <header className="h-14 bg-gis-surface border-b border-gis-border px-4 flex items-center justify-between gap-4 z-20 select-none">
      {/* Search Bar */}
      <div className="flex-1 max-w-md relative">
        <Search className="w-4 h-4 text-gis-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('topbar.search')}
          className="w-full bg-gis-bg border border-gis-border rounded-md pl-9 pr-3 py-1.5 text-xs text-gis-textBright placeholder-gis-textMuted/60 focus:outline-none focus:border-gis-accent transition"
        />
      </div>

      {/* Center Subsystem Status Badges */}
      <div className="hidden lg:flex items-center gap-3 text-[11px] text-gis-textMuted border-x border-gis-border px-4 py-1">
        <div className="flex items-center gap-1.5" title="Vision-Language Models">
          <Cpu className="w-3.5 h-3.5 text-gis-accent" />
          <span className="text-gis-textBright font-mono">8</span> Models
        </div>
        <span className="text-gis-border">•</span>
        <div className="flex items-center gap-1.5" title="Raster & Vector Processing Engine">
          <Layers className="w-3.5 h-3.5 text-gis-accentCyan" />
          <span>Raster Core</span>
        </div>
        <span className="text-gis-border">•</span>
        <div className="flex items-center gap-1.5" title="Geospatial Archive">
          <Database className="w-3.5 h-3.5 text-gis-success" />
          <span>Storage Ready</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gis-panel border border-gis-border text-xs text-gis-textBright hover:bg-gis-hover transition font-medium"
            title="Change Application Language"
          >
            <Globe className="w-3.5 h-3.5 text-gis-accent" />
            <span className="text-gis-accentCyan font-medium">{currentLang.native}</span>
          </button>

          {langDropdownOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-gis-panel border border-gis-border rounded-md shadow-gis py-1 z-50">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleLanguageChange(l.code)}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-gis-hover transition ${
                    i18n.language === l.code ? 'text-gis-accent font-semibold bg-gis-accent/10' : 'text-gis-textBright'
                  }`}
                >
                  <span>{l.native}</span>
                  <span className="text-[10px] text-gis-textMuted uppercase">{l.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* System Health Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gis-success/10 border border-gis-success/30 text-[11px] text-gis-success font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-gis-success animate-ping" />
          <span className="hidden sm:inline">{systemStatus}</span>
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-gis-border">
          <div className="w-7 h-7 rounded-full bg-gis-panel border border-gis-border flex items-center justify-center text-xs text-gis-accent">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-gis-textBright leading-tight">Analyst-1</span>
            <span className="text-[10px] text-gis-textMuted leading-tight">{t('topbar.profile')}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
