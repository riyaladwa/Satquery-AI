import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SearchAlert,
  Flame,
  Waves,
  Tractor,
  Building2,
  AlertOctagon,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Droplet,
  Sprout
} from 'lucide-react';

export const Investigate: React.FC = () => {
  const { t } = useTranslation();
  const [activeDomain, setActiveDomain] = useState<'disaster' | 'agriculture' | 'urban'>('disaster');

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 select-none bg-gis-bg">
      {/* Domain Mode Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gis-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-gis-textBright flex items-center gap-2">
            <SearchAlert className="w-5 h-5 text-gis-accent" />
            <span>Specialized Domain Investigations</span>
          </h1>
          <p className="text-xs text-gis-textMuted mt-1">
            Targeted multi-band algorithmic workflows for emergency response, agricultural surveillance, and city planning
          </p>
        </div>

        {/* Domain Mode Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gis-surface border border-gis-border rounded-lg">
          <button
            onClick={() => setActiveDomain('disaster')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              activeDomain === 'disaster'
                ? 'bg-gis-danger text-white shadow-sm'
                : 'text-gis-textMuted hover:text-gis-textBright'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Disaster Response</span>
          </button>
          <button
            onClick={() => setActiveDomain('agriculture')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              activeDomain === 'agriculture'
                ? 'bg-gis-success text-white shadow-sm'
                : 'text-gis-textMuted hover:text-gis-textBright'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Agriculture & NDVI</span>
          </button>
          <button
            onClick={() => setActiveDomain('urban')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              activeDomain === 'urban'
                ? 'bg-gis-accent text-white shadow-sm'
                : 'text-gis-textMuted hover:text-gis-textBright'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Urban Growth</span>
          </button>
        </div>
      </div>

      {/* Domain Content */}
      {activeDomain === 'disaster' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-lg bg-gis-surface border border-gis-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gis-textBright">Inundation Extent</span>
                <span className="px-1.5 py-0.5 rounded bg-gis-danger/10 border border-gis-danger/30 text-gis-danger text-[10px] font-bold">
                  CRITICAL
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-gis-danger">32.7%</div>
              <p className="text-[11px] text-gis-textMuted">
                Surface water anomaly exceeding standard 5-year monsoon baseline.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gis-surface border border-gis-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gis-textBright">Submerged Area</span>
                <span className="text-[10px] text-gis-textMuted font-mono">SWIR Index</span>
              </div>
              <div className="text-2xl font-bold font-mono text-gis-accentCyan">248.5 ha</div>
              <p className="text-[11px] text-gis-textMuted">
                Low-lying agricultural basins and riverine settlements impacted.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gis-surface border border-gis-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gis-textBright">Relief Corridors</span>
                <span className="px-1.5 py-0.5 rounded bg-gis-success/10 border border-gis-success/30 text-gis-success text-[10px] font-bold">
                  ACCESSIBLE
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-gis-success">4 Routes</div>
              <p className="text-[11px] text-gis-textMuted">
                High-elevation bypass arterial roadways clear of flood obstruction.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gis-surface border border-gis-border space-y-2">
            <div className="text-xs font-bold text-gis-danger uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4" />
              <span>Rapid Disaster Evaluation: Kerala Monsoon Flooding</span>
            </div>
            <p className="text-xs text-gis-textBright leading-relaxed">
              Automated SWIR/NIR normalized water index (MNDWI) analysis classifies total inundation over the Periyar basin following intense precipitation. Water levels crested historic embankments by +1.8m. Critical evacuation points delineated along northern highway links.
            </p>
          </div>
        </div>
      )}

      {activeDomain === 'agriculture' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-lg bg-gis-surface border border-gis-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gis-textBright">Mean NDVI Index</span>
                <span className="px-1.5 py-0.5 rounded bg-gis-success/10 border border-gis-success/30 text-gis-success text-[10px] font-bold">
                  HEALTHY
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-gis-success">0.68</div>
              <p className="text-[11px] text-gis-textMuted">
                Vigorous chlorophyll absorption and high near-infrared reflectance.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gis-surface border border-gis-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gis-textBright">Moisture Stress</span>
                <span className="px-1.5 py-0.5 rounded bg-gis-warning/10 border border-gis-warning/30 text-gis-warning text-[10px] font-bold">
                  MONITORED
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-gis-warning">8.2 ha</div>
              <p className="text-[11px] text-gis-textMuted">
                Localized NDRE drop indicating delayed irrigation in southwest sector.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gis-surface border border-gis-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gis-textBright">Cropland Parcels</span>
                <span className="text-[10px] text-gis-textMuted font-mono">Delineated</span>
              </div>
              <div className="text-2xl font-bold font-mono text-gis-accent">142 Units</div>
              <p className="text-[11px] text-gis-textMuted">
                Individual field boundaries classified through edge-gradient segmentation.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gis-surface border border-gis-border space-y-2">
            <div className="text-xs font-bold text-gis-success uppercase tracking-wider flex items-center gap-1.5">
              <Tractor className="w-4 h-4" />
              <span>Crop Health & Vigor Analytics: Punjab Agricultural Basin</span>
            </div>
            <p className="text-xs text-gis-textBright leading-relaxed">
              Multi-spectral Red Edge (B5, B6) and NIR (B8) processing verifies optimal vegetative vigor across 91.4% of surveyed acreage. Soil moisture content remains stable with localized drip irrigation scheduled for stressed parcel clusters.
            </p>
          </div>
        </div>
      )}

      {activeDomain === 'urban' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-lg bg-gis-surface border border-gis-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gis-textBright">Built-up Expansion</span>
                <span className="px-1.5 py-0.5 rounded bg-gis-accent/10 border border-gis-accent/30 text-gis-accent text-[10px] font-bold">
                  2023–2026
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-gis-danger">+18.4%</div>
              <p className="text-[11px] text-gis-textMuted">
                Rapid conversion of non-urban soil to concrete structures.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gis-surface border border-gis-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gis-textBright">New Development</span>
                <span className="text-[10px] text-gis-textMuted font-mono">NDBI Shift</span>
              </div>
              <div className="text-2xl font-bold font-mono text-gis-accentCyan">118.8 ha</div>
              <p className="text-[11px] text-gis-textMuted">
                Commercial logistics hubs and residential expansion east of ring road.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gis-surface border border-gis-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gis-textBright">Sprawl Velocity</span>
                <span className="text-[10px] text-gis-textMuted font-mono">Yearly Growth</span>
              </div>
              <div className="text-2xl font-bold font-mono text-gis-warning">5.8% / yr</div>
              <p className="text-[11px] text-gis-textMuted">
                Correlated with newly paved transit corridors and metro linkages.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gis-surface border border-gis-border space-y-2">
            <div className="text-xs font-bold text-gis-accent uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              <span>Urban Dynamics & Infrastructure Tracking: Bengaluru Metropolitan Region</span>
            </div>
            <p className="text-xs text-gis-textBright leading-relaxed">
              Deep change segmentation identifies intense peripheral expansion along the eastern arterial bypass. High-density commercial and manufacturing buildings have emerged over prior dry agricultural soil, verified by positive NDBI contrast (+0.34).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
