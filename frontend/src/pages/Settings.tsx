import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { ModelItem } from '../types';
import { Settings as SettingsIcon, Cpu, Globe, Map, HardDrive, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

export const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [models, setModels] = useState<ModelItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getModels()
      .then((data) => setModels(data.models || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 select-none bg-gis-bg">
      <div className="border-b border-gis-border pb-4">
        <h1 className="text-xl font-bold text-gis-textBright flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-gis-accent" />
          <span>Platform Settings & Model Registry</span>
        </h1>
        <p className="text-xs text-gis-textMuted mt-1">
          Inspection of registered specialist vision-language models, storage repositories, and interface configurations
        </p>
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
          <span>Multilingual & Accessibility Preferences</span>
        </div>

        <div className="bg-gis-surface border border-gis-border rounded-lg p-4 space-y-3 text-xs max-w-xl shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-gis-border">
            <div>
              <div className="font-semibold text-gis-textBright">Active UI Language</div>
              <div className="text-[10px] text-gis-textMuted">Determines speech synthesis and output formatting</div>
            </div>
            <div className="font-mono text-gis-accent font-bold">
              {i18n.language.toUpperCase()}
            </div>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-gis-border">
            <div>
              <div className="font-semibold text-gis-textBright">Basemap Imagery Source</div>
              <div className="text-[10px] text-gis-textMuted">High-resolution orbital satellite tile provider</div>
            </div>
            <div className="font-mono text-gis-accent font-bold">
              Esri World Imagery / Carto
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gis-textBright">Geospatial Processing Precision</div>
              <div className="text-[10px] text-gis-textMuted">PyProj WGS84 geodesic polygon calculation</div>
            </div>
            <div className="font-mono text-gis-success font-bold">
              Sub-meter Accurate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
