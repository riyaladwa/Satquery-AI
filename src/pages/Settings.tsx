import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { ModelItem } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Settings as SettingsIcon,
  Cpu,
  Globe,
  Map,
  HardDrive,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Database,
  Cloud,
  Save,
  UserCheck
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [models, setModels] = useState<ModelItem[]>([]);
  const [loading, setLoading] = useState(true);

  // User Settings State (synced to Supabase PostgreSQL user_settings)
  const [preferredLanguage, setPreferredLanguage] = useState<string>('en');
  const [defaultBasemap, setDefaultBasemap] = useState<string>('satellite');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(75);
  const [autoGenerateReports, setAutoGenerateReports] = useState<boolean>(false);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    api.getModels()
      .then((data) => setModels(data.models || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    // Fetch user settings from Supabase / Backend
    api.getUserSettings(user?.id)
      .then((settings) => {
        if (settings) {
          if (settings.preferred_language) setPreferredLanguage(settings.preferred_language);
          if (settings.default_basemap) setDefaultBasemap(settings.default_basemap);
          if (settings.confidence_threshold !== undefined) setConfidenceThreshold(settings.confidence_threshold);
          if (settings.auto_generate_reports !== undefined) setAutoGenerateReports(settings.auto_generate_reports);
        }
      })
      .catch((err) => console.warn('Could not load user settings:', err));
  }, [user?.id]);

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      await api.updateUserSettings({
        user_id: user?.id,
        preferred_language: preferredLanguage,
        default_basemap: defaultBasemap,
        confidence_threshold: confidenceThreshold,
        auto_generate_reports: autoGenerateReports
      });
      if (preferredLanguage !== i18n.language) {
        i18n.changeLanguage(preferredLanguage);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 select-none bg-gis-bg">
      <div className="border-b border-gis-border pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gis-textBright flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-gis-accent" />
            <span>Platform Settings & Model Registry</span>
          </h1>
          <p className="text-xs text-gis-textMuted mt-1">
            Inspection of registered specialist vision-language models, storage repositories, and interface configurations
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-gis-success flex items-center gap-1 font-semibold animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved to Supabase</span>
            </span>
          )}
          <button
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="px-3 py-1.5 rounded-lg bg-gis-accent hover:bg-gis-accent/90 disabled:opacity-50 text-gis-bg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            type="button"
          >
            {savingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Preferences</span>
          </button>
        </div>
      </div>

      {/* Supabase Infrastructure Health Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-lg bg-gis-surface border border-gis-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#167A4A]/15 border border-[#167A4A]/30 flex items-center justify-center text-[#167A4A]">
            <Database className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-gis-textBright">Supabase PostgreSQL</div>
            <div className="text-[11px] text-gis-textMuted truncate">11 Relational Tables & RLS Active</div>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-gis-surface border border-gis-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gis-accentCyan/15 border border-gis-accentCyan/30 flex items-center justify-center text-gis-accentCyan">
            <Cloud className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-gis-textBright">Supabase Storage</div>
            <div className="text-[11px] text-gis-textMuted truncate">Bucket: satellite-images (GeoTIFF & PDF)</div>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-gis-surface border border-gis-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-gis-textBright">Auth & Capability Policy</div>
            <div className="text-[11px] text-gis-textMuted truncate">
              {user ? `Logged in: ${user.email}` : 'Guest Mode (2 Free Capabilities)'}
            </div>
          </div>
        </div>
      </div>

      {/* Model Registry Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gis-textMuted flex items-center gap-2">
            <Cpu className="w-4 h-4 text-gis-accent" />
            <span>AI Model & Specialist Tool Registry ({models.length})</span>
          </span>
          <span className="text-[11px] text-gis-success font-semibold flex items-center gap-1 bg-gis-success/10 px-2 py-0.5 rounded border border-gis-success/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>All Specialized Adapters Online</span>
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-gis-textMuted flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-gis-accent" />
            <span>Loading registered models...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {models.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-lg bg-gis-surface border border-gis-border space-y-2 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <div className="text-xs font-bold text-gis-textBright flex items-center gap-1.5">
                        <span>{m.name}</span>
                        <span className="text-[10px] font-mono text-gis-accent bg-gis-accent/10 px-1.5 py-0.5 rounded border border-gis-accent/20">
                          v{m.version}
                        </span>
                      </div>
                      <div className="text-[10px] text-gis-textMuted">{m.execution_type}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-gis-success/10 border border-gis-success/20 text-gis-success text-[10px] font-mono font-bold">
                      {m.base_confidence}% conf
                    </span>
                  </div>

                  <p className="text-[11px] text-gis-textMuted leading-relaxed line-clamp-2 mt-2">
                    {m.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-gis-border/50 text-[10px] text-gis-textMuted space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gis-textBright">Tasks:</span>
                    <span className="truncate">{m.supported_tasks.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gis-textBright">Modalities:</span>
                    <span className="text-gis-accentCyan">{m.supported_modalities.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interface Configuration Section */}
      <div className="space-y-3 pt-2">
        <div className="text-xs font-bold uppercase tracking-wider text-gis-textMuted flex items-center gap-2">
          <Globe className="w-4 h-4 text-gis-accent" />
          <span>User Preferences & Supabase Storage Sync</span>
        </div>

        <div className="bg-gis-surface border border-gis-border rounded-lg p-4 space-y-3 text-xs max-w-xl shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-gis-border">
            <div>
              <div className="font-semibold text-gis-textBright">Default UI Language</div>
              <div className="text-[10px] text-gis-textMuted">Persisted in Supabase user_settings</div>
            </div>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="bg-gis-bg border border-gis-border rounded px-2.5 py-1 text-xs text-gis-accent font-semibold focus:outline-hidden"
            >
              <option value="en">English (EN)</option>
              <option value="hi">हिंदी (Hindi - HI)</option>
              <option value="kn">ಕನ್ನಡ (Kannada - KN)</option>
              <option value="ta">தமிழ் (Tamil - TA)</option>
              <option value="te">తెలుగు (Telugu - TE)</option>
              <option value="mr">मराठी (Marathi - MR)</option>
              <option value="bn">বাংলা (Bengali - BN)</option>
            </select>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-gis-border">
            <div>
              <div className="font-semibold text-gis-textBright">Default Basemap Provider</div>
              <div className="text-[10px] text-gis-textMuted">High-resolution orbital satellite tile provider</div>
            </div>
            <select
              value={defaultBasemap}
              onChange={(e) => setDefaultBasemap(e.target.value)}
              className="bg-gis-bg border border-gis-border rounded px-2.5 py-1 text-xs text-gis-accent font-semibold focus:outline-hidden"
            >
              <option value="satellite">Esri World Imagery (Satellite)</option>
              <option value="streets">OpenStreetMap Carto (Streets)</option>
            </select>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-gis-border">
            <div>
              <div className="font-semibold text-gis-textBright">Confidence Cutoff Threshold</div>
              <div className="text-[10px] text-gis-textMuted">Flag detections below this threshold as low confidence</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-24 accent-[#167A4A]"
              />
              <span className="font-mono text-gis-accent font-bold text-xs w-8 text-right">
                {confidenceThreshold}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gis-textBright">Auto-Generate PDF Intelligence Reports</div>
              <div className="text-[10px] text-gis-textMuted">Automatically generate PDF after each AI verification query</div>
            </div>
            <input
              type="checkbox"
              checked={autoGenerateReports}
              onChange={(e) => setAutoGenerateReports(e.target.checked)}
              className="w-4 h-4 accent-[#167A4A] cursor-pointer rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

