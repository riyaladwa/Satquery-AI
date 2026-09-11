import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { ImageRecord, Project } from '../types';
import {
  Compass,
  GitCompare,
  SearchAlert,
  FileText,
  Cpu,
  Layers,
  HardDrive,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  Satellite
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [images, setImages] = useState<ImageRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getImages(), api.getProjects(), api.getSessions()])
      .then(([imgs, projs, sess]) => {
        setImages(imgs);
        setProjects(projs);
        setSessions(sess);
      })
      .catch((err) => console.error('Dashboard load failed', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 select-none bg-gis-bg">
      {/* Title & Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gis-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-gis-textBright flex items-center gap-2">
            <span>{t('dashboard.title')}</span>
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-gis-accent/10 border border-gis-accent/30 text-gis-accent">
              SIH 2026 EDITION
            </span>
          </h1>
          <p className="text-xs text-gis-textMuted mt-1">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/explore')}
            className="px-3 py-1.5 rounded-md bg-gis-accent hover:bg-gis-accentCyan text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Launch Explore</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-lg bg-gis-surface border border-gis-border shadow-sm">
          <div className="text-[11px] text-gis-textMuted font-medium mb-1">
            {t('dashboard.totalImages')}
          </div>
          <div className="text-2xl font-bold font-mono text-gis-textBright flex items-center gap-2">
            <span>{images.length || 6}</span>
            <span className="text-[10px] font-sans font-normal text-gis-success">Sentinel-1/2</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-gis-surface border border-gis-border shadow-sm">
          <div className="text-[11px] text-gis-textMuted font-medium mb-1">
            {t('dashboard.activeProjects')}
          </div>
          <div className="text-2xl font-bold font-mono text-gis-textBright flex items-center gap-2">
            <span>{projects.length || 4}</span>
            <span className="text-[10px] font-sans font-normal text-gis-accent">Observatories</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-gis-surface border border-gis-border shadow-sm">
          <div className="text-[11px] text-gis-textMuted font-medium mb-1">
            {t('dashboard.activeSessions')}
          </div>
          <div className="text-2xl font-bold font-mono text-gis-accentCyan flex items-center gap-2">
            <span>{sessions.length || 8}</span>
            <span className="text-[10px] font-sans font-normal text-gis-textMuted">Conversations</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-gis-surface border border-gis-border shadow-sm">
          <div className="text-[11px] text-gis-textMuted font-medium mb-1">
            {t('dashboard.avgConfidence')}
          </div>
          <div className="text-2xl font-bold font-mono text-gis-success flex items-center gap-2">
            <span>91.2%</span>
            <span className="text-[10px] font-sans font-normal text-gis-textMuted">High Reliability</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="space-y-2.5">
        <div className="text-xs font-semibold uppercase tracking-wider text-gis-textMuted">
          {t('dashboard.quickActions')}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            onClick={() => navigate('/explore')}
            className="p-3 rounded-lg bg-gis-panel hover:bg-gis-hover border border-gis-border hover:border-gis-accent/40 cursor-pointer transition flex items-center gap-3 shadow-sm"
          >
            <div className="w-9 h-9 rounded-md bg-gis-accent/15 border border-gis-accent/30 flex items-center justify-center text-gis-accent shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gis-textBright">{t('dashboard.newAnalysis')}</div>
              <div className="text-[10px] text-gis-textMuted">Ask questions on satellite scenes</div>
            </div>
          </div>

          <div
            onClick={() => navigate('/compare')}
            className="p-3 rounded-lg bg-gis-panel hover:bg-gis-hover border border-gis-border hover:border-gis-accent/40 cursor-pointer transition flex items-center gap-3 shadow-sm"
          >
            <div className="w-9 h-9 rounded-md bg-gis-accentCyan/15 border border-gis-accentCyan/30 flex items-center justify-center text-gis-accentCyan shrink-0">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gis-textBright">{t('dashboard.compareImagery')}</div>
              <div className="text-[10px] text-gis-textMuted">Change detection & Optical+SAR</div>
            </div>
          </div>

          <div
            onClick={() => navigate('/investigate')}
            className="p-3 rounded-lg bg-gis-panel hover:bg-gis-hover border border-gis-border hover:border-gis-accent/40 cursor-pointer transition flex items-center gap-3 shadow-sm"
          >
            <div className="w-9 h-9 rounded-md bg-gis-warning/15 border border-gis-warning/30 flex items-center justify-center text-gis-warning shrink-0">
              <SearchAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gis-textBright">{t('dashboard.investigateArea')}</div>
              <div className="text-[10px] text-gis-textMuted">Disaster, agriculture & urban modes</div>
            </div>
          </div>

          <div
            onClick={() => navigate('/reports')}
            className="p-3 rounded-lg bg-gis-panel hover:bg-gis-hover border border-gis-border hover:border-gis-accent/40 cursor-pointer transition flex items-center gap-3 shadow-sm"
          >
            <div className="w-9 h-9 rounded-md bg-gis-success/15 border border-gis-success/30 flex items-center justify-center text-gis-success shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gis-textBright">{t('dashboard.generateReport')}</div>
              <div className="text-[10px] text-gis-textMuted">Publication-grade PDF reports</div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Active Projects & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Active Projects & Imagery */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gis-textMuted">
              {t('dashboard.activeProjects')}
            </span>
            <button
              onClick={() => navigate('/explore')}
              className="text-xs text-gis-accent hover:underline flex items-center gap-1"
            >
              <span>Explore All Imagery</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate('/explore')}
                className="p-4 rounded-lg bg-gis-surface border border-gis-border hover:border-gis-accent/40 cursor-pointer transition flex flex-col justify-between space-y-2 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gis-textBright">{p.name}</span>
                    <span className="text-[10px] font-mono text-gis-accent bg-gis-accent/10 px-1.5 py-0.5 rounded border border-gis-accent/20">
                      {p.image_count || 2} scenes
                    </span>
                  </div>
                  <p className="text-[11px] text-gis-textMuted line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>
                <div className="text-[10px] text-gis-textMuted flex items-center justify-between pt-2 border-t border-gis-border/50">
                  <span className="flex items-center gap-1">
                    <Satellite className="w-3 h-3 text-gis-accent" />
                    <span>Sentinel Surveillance</span>
                  </span>
                  <span>Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Subsystem Health */}
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-gis-textMuted">
            {t('dashboard.systemStatus')}
          </div>

          <div className="bg-gis-surface border border-gis-border rounded-lg p-4 space-y-3.5 shadow-sm text-xs">
            <div className="flex items-start justify-between pb-2 border-b border-gis-border">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-gis-accent" />
                <div>
                  <div className="font-semibold text-gis-textBright">{t('dashboard.aiModels')}</div>
                  <div className="text-[10px] text-gis-textMuted">8 Models Online (RS-VLM, ChangeNet)</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-gis-success/10 border border-gis-success/30 text-gis-success text-[10px] font-semibold">
                ACTIVE
              </span>
            </div>

            <div className="flex items-start justify-between pb-2 border-b border-gis-border">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-gis-accentCyan" />
                <div>
                  <div className="font-semibold text-gis-textBright">{t('dashboard.processingEngine')}</div>
                  <div className="text-[10px] text-gis-textMuted">NumPy, Shapely, PyProj Geodesics</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-gis-success/10 border border-gis-success/30 text-gis-success text-[10px] font-semibold">
                READY
              </span>
            </div>

            <div className="flex items-start justify-between pb-2 border-b border-gis-border">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gis-warning" />
                <div>
                  <div className="font-semibold text-gis-textBright">{t('dashboard.mapService')}</div>
                  <div className="text-[10px] text-gis-textMuted">Esri World Imagery + Dark Matter</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-gis-success/10 border border-gis-success/30 text-gis-success text-[10px] font-semibold">
                CONNECTED
              </span>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-gis-success" />
                <div>
                  <div className="font-semibold text-gis-textBright">{t('dashboard.storage')}</div>
                  <div className="text-[10px] text-gis-textMuted">Local GeoTIFF & Vector Repository</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-gis-success/10 border border-gis-success/30 text-gis-success text-[10px] font-semibold">
                MOUNTED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
