import React from 'react';
import {
  Layers,
  SlidersHorizontal,
  Ruler,
  LineChart,
  ScanSearch,
  Building2,
  Sprout,
  AlertTriangle,
  Globe2,
  Crosshair,
  Palette,
  FileText,
  UploadCloud,
  History,
  Sliders,
  Sparkles
} from 'lucide-react';
import { DrawerType } from './WorkstationLeftBar';
import { useAdvancedMode } from '../../context/AdvancedModeContext';

interface ContextualToolRailProps {
  workflow: string;
  activeDrawer: DrawerType;
  onToggleDrawer: (drawer: DrawerType) => void;
}

interface ToolItem {
  id: DrawerType;
  icon: any;
  label: string;
}

export const ContextualToolRail: React.FC<ContextualToolRailProps> = ({
  workflow,
  activeDrawer,
  onToggleDrawer,
}) => {
  const { advancedMode } = useAdvancedMode();

  // Get tools contextual to the active workflow
  const getContextualTools = (): ToolItem[] => {
    switch (workflow.toLowerCase()) {
      case 'urban':
      case 'urban growth':
      case 'construction':
        return [
          { id: 'urban', icon: Building2, label: 'Urban Growth & Infrastructure' },
          { id: 'detect', icon: ScanSearch, label: 'Building & Road Detection' },
          { id: 'compare', icon: SlidersHorizontal, label: 'Compare with 2023 Baseline' },
          { id: 'layers', icon: Layers, label: 'Layer Manager & Overlays' },
        ];

      case 'agriculture':
        return [
          { id: 'agri', icon: Sprout, label: 'Crop Health & Moisture' },
          { id: 'timeseries', icon: LineChart, label: 'Multi-Year Growth Trends' },
          { id: 'measure', icon: Ruler, label: 'Field Parcel Measurement' },
          { id: 'layers', icon: Layers, label: 'Layer Manager & Overlays' },
        ];

      case 'disaster':
        return [
          { id: 'disaster', icon: AlertTriangle, label: 'Flood & Damage Assessment' },
          { id: 'compare', icon: SlidersHorizontal, label: 'Pre vs Post Disaster Slider' },
          { id: 'measure', icon: Ruler, label: 'Affected Area Extents' },
          { id: 'layers', icon: Layers, label: 'Layer Manager & Overlays' },
        ];

      case 'environment':
        return [
          { id: 'landcover', icon: Globe2, label: 'Land Cover Classification' },
          { id: 'timeseries', icon: LineChart, label: 'Canopy & Water Trends' },
          { id: 'compare', icon: SlidersHorizontal, label: 'Deforestation Slider' },
          { id: 'layers', icon: Layers, label: 'Layer Manager & Overlays' },
        ];

      case 'change':
      case 'change detection':
        return [
          { id: 'compare', icon: SlidersHorizontal, label: 'Before / After Comparison' },
          { id: 'timeseries', icon: LineChart, label: 'Multi-Year Trajectory' },
          { id: 'measure', icon: Ruler, label: 'Changed Surface Measurement' },
          { id: 'layers', icon: Layers, label: 'Layer Manager & Overlays' },
        ];

      default:
        // Research default
        return [
          { id: 'spectral', icon: Palette, label: 'Spectral Bands & Indices' },
          { id: 'pixel', icon: Crosshair, label: 'Pixel Inspector' },
          { id: 'landcover', icon: Globe2, label: 'Land Cover Classification' },
          { id: 'layers', icon: Layers, label: 'Layer Manager & Overlays' },
        ];
    }
  };

  // Additional tools unlocked in Advanced GIS Mode
  const advancedTools: ToolItem[] = [
    { id: 'spectral', icon: Palette, label: 'Spectral Bands & Polarizations' },
    { id: 'pixel', icon: Crosshair, label: 'Pixel Inspector & Reflectance' },
    { id: 'measure', icon: Ruler, label: 'Geodesic Measurement Tool' },
    { id: 'timeseries', icon: LineChart, label: 'Multi-Temporal Time Series' },
    { id: 'upload', icon: UploadCloud, label: 'Upload Satellite GeoTIFF' },
  ];

  const baseTools = getContextualTools();

  // Combine contextual tools with unique advanced tools if Advanced Mode is enabled
  const visibleTools = advancedMode
    ? [
        ...baseTools,
        ...advancedTools.filter((t) => !baseTools.some((b) => b.id === t.id)),
      ]
    : baseTools;

  return (
    <aside className="w-14 bg-[#0D1117] border-r border-[#283541] flex flex-col items-center py-3 z-20 shrink-0 select-none">
      <div className="flex flex-col gap-2 w-full items-center">
        {visibleTools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeDrawer === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => onToggleDrawer(isActive ? null : tool.id)}
              className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-all group ${
                isActive
                  ? 'bg-[#38D9D1]/20 text-[#38D9D1] border border-[#38D9D1]/40 shadow-sm shadow-[#38D9D1]/10'
                  : 'text-[#9AA6B2] hover:text-[#F5F7FA] hover:bg-[#17212B] border border-transparent'
              }`}
              title={tool.label}
            >
              <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-[#38D9D1]' : ''}`} />
              
              {/* Active Indicator Pip */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#38D9D1] rounded-r-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Mode Badge indicator at bottom */}
      <div className="mt-auto flex flex-col items-center gap-1.5 pt-2 border-t border-[#283541]/60 w-full text-center">
        <span
          className={`text-[9px] font-mono uppercase tracking-widest px-1 py-0.5 rounded ${
            advancedMode ? 'text-[#38D9D1] bg-[#38D9D1]/10 font-bold' : 'text-[#9AA6B2]/60'
          }`}
          title={advancedMode ? 'Advanced GIS Mode Active' : 'Simple Contextual Mode Active'}
        >
          {advancedMode ? 'ADV' : 'SIM'}
        </span>
      </div>
    </aside>
  );
};
