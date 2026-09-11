import React from 'react';
import { Crosshair, X, MapPin, Layers, Activity, Radio, ShieldCheck } from 'lucide-react';
import { PixelInspectionResult } from '../../../types';

interface PixelInspectorDrawerProps {
  onClose: () => void;
  data: PixelInspectionResult | null;
  loading: boolean;
  onSampleDemoPoint: () => void;
}

export const PixelInspectorDrawer: React.FC<PixelInspectorDrawerProps> = ({
  onClose,
  data,
  loading,
  onSampleDemoPoint
}) => {
  return (
    <div className="w-80 bg-gis-panel border-r border-gis-border h-full flex flex-col z-20 shadow-2xl shadow-black/80 animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="p-3 border-b border-gis-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-gis-accent" />
          <h3 className="font-semibold text-xs text-gis-textBright uppercase tracking-wider">
            Pixel Inspector
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-gis-textMuted hover:text-gis-textBright hover:bg-gis-hover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Guide Banner */}
      <div className="px-3 py-2 bg-gis-bg/60 border-b border-gis-border flex items-center justify-between">
        <span className="text-[11px] text-gis-textMuted flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-gis-accent" />
          Click anywhere on map to inspect
        </span>
        <button
          onClick={onSampleDemoPoint}
          className="text-[10px] font-mono text-gis-accent hover:underline"
        >
          Center Point
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-gis-accent/20 border-t-gis-accent animate-spin mb-3" />
          <span className="text-xs text-gis-textMuted font-mono">Sampling spectral reflectance...</span>
        </div>
      ) : data ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Coordinates & Location */}
          <div className="p-2.5 rounded-lg bg-gis-bg border border-gis-border space-y-1.5 font-mono text-xs">
            <div className="flex justify-between items-center text-gis-textBright">
              <span className="text-gis-textMuted text-[10px] uppercase">Latitude</span>
              <span className="font-bold text-gis-accent">{data.latitude}° N</span>
            </div>
            <div className="flex justify-between items-center text-gis-textBright">
              <span className="text-gis-textMuted text-[10px] uppercase">Longitude</span>
              <span className="font-bold text-gis-accent">{data.longitude}° W</span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-gis-textMuted pt-1 border-t border-gis-border/50">
              <span>Elevation: {data.elevation_m} m</span>
              <span>Raster X:{data.pixel_x} Y:{data.pixel_y}</span>
            </div>
          </div>

          {/* Land Cover Classification */}
          <div className="p-2.5 rounded-lg bg-gis-panel border border-gis-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gis-textMuted uppercase font-semibold">Predicted Land Cover</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gis-success/15 text-gis-success border border-gis-success/30 font-semibold">
                {data.confidence}% Conf
              </span>
            </div>
            <div className="font-bold text-xs text-gis-textBright">
              {data.land_cover_prediction}
            </div>
          </div>

          {/* Multi-Spectral Band Reflectance */}
          <div className="p-2.5 rounded-lg bg-gis-panel border border-gis-border space-y-2">
            <div className="text-[10px] text-gis-textMuted uppercase font-semibold tracking-wider flex items-center justify-between">
              <span>Sentinel-2 Spectral Bands</span>
              <span className="text-[9px] text-gis-textMuted font-mono">Reflectance (0-1)</span>
            </div>

            <div className="space-y-1.5">
              {[
                { band: 'B02', label: 'Blue (0.490 µm)', val: data.bands.B02, color: 'bg-blue-400' },
                { band: 'B03', label: 'Green (0.560 µm)', val: data.bands.B03, color: 'bg-emerald-400' },
                { band: 'B04', label: 'Red (0.665 µm)', val: data.bands.B04, color: 'bg-rose-400' },
                { band: 'B08', label: 'NIR (0.842 µm)', val: data.bands.B08, color: 'bg-amber-400' },
                { band: 'B11', label: 'SWIR-1 (1.610 µm)', val: data.bands.B11, color: 'bg-purple-400' },
                { band: 'B12', label: 'SWIR-2 (2.190 µm)', val: data.bands.B12, color: 'bg-indigo-400' },
              ].map((b) => (
                <div key={b.band} className="space-y-0.5">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-gis-textBright font-semibold">{b.band} <span className="text-[10px] text-gis-textMuted font-normal">({b.label})</span></span>
                    <span className="text-gis-accent">{b.val.toFixed(3)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gis-bg rounded-full overflow-hidden">
                    <div
                      className={`h-full ${b.color} rounded-full transition-all`}
                      style={{ width: `${Math.min(100, Math.max(5, b.val * 100 * 1.5))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Remote Sensing Indices */}
          <div className="p-2.5 rounded-lg bg-gis-panel border border-gis-border space-y-2">
            <span className="text-[10px] text-gis-textMuted uppercase font-semibold tracking-wider">
              Radiometric Indices
            </span>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="p-2 rounded bg-gis-bg border border-gis-border flex flex-col">
                <span className="text-[10px] text-gis-textMuted">NDVI (Vegetation)</span>
                <span className={`font-bold mt-0.5 ${data.indices.NDVI > 0.3 ? 'text-gis-success' : 'text-gis-textBright'}`}>
                  {data.indices.NDVI}
                </span>
              </div>
              <div className="p-2 rounded bg-gis-bg border border-gis-border flex flex-col">
                <span className="text-[10px] text-gis-textMuted">NDWI (Water)</span>
                <span className={`font-bold mt-0.5 ${data.indices.NDWI > 0 ? 'text-gis-accent' : 'text-gis-textBright'}`}>
                  {data.indices.NDWI}
                </span>
              </div>
              <div className="p-2 rounded bg-gis-bg border border-gis-border flex flex-col">
                <span className="text-[10px] text-gis-textMuted">NDBI (Built-up)</span>
                <span className={`font-bold mt-0.5 ${data.indices.NDBI > 0 ? 'text-gis-warning' : 'text-gis-textBright'}`}>
                  {data.indices.NDBI}
                </span>
              </div>
              <div className="p-2 rounded bg-gis-bg border border-gis-border flex flex-col">
                <span className="text-[10px] text-gis-textMuted">NBR (Burn Ratio)</span>
                <span className="font-bold text-gis-textBright mt-0.5">
                  {data.indices.NBR}
                </span>
              </div>
            </div>
          </div>

          {/* SAR Radar Backscatter */}
          {data.sar && (
            <div className="p-2.5 rounded-lg bg-gis-panel border border-gis-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gis-textMuted uppercase font-semibold tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-gis-sar" />
                  Sentinel-1 C-SAR Backscatter
                </span>
                <span className="text-[9px] text-gis-sar font-mono">10m GSD</span>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="p-2 rounded bg-gis-bg border border-gis-border flex flex-col">
                  <span className="text-[10px] text-gis-textMuted">VV Pol</span>
                  <span className="font-bold text-gis-sar mt-0.5">{data.sar.vv_db} dB</span>
                </div>
                <div className="p-2 rounded bg-gis-bg border border-gis-border flex flex-col">
                  <span className="text-[10px] text-gis-textMuted">VH Pol</span>
                  <span className="font-bold text-gis-sar mt-0.5">{data.sar.vh_db} dB</span>
                </div>
              </div>
              <div className="text-[10px] text-gis-textMuted font-mono flex justify-between">
                <span>Polarization: {data.sar.polarization}</span>
                <span>{data.sar.orbit_direction}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gis-textMuted">
          <Crosshair className="w-8 h-8 text-gis-textMuted/40 mb-2" />
          <p className="text-xs">No pixel sampled yet.</p>
          <p className="text-[11px] text-gis-textMuted/70 mt-1">Click on the satellite imagery to inspect spectral values.</p>
          <button
            onClick={onSampleDemoPoint}
            className="mt-3 px-3 py-1.5 rounded bg-gis-panel hover:bg-gis-hover border border-gis-border text-xs text-gis-accent transition-colors font-mono"
          >
            Sample Dublin Center (53.3472, -6.2439)
          </button>
        </div>
      )}
    </div>
  );
};
