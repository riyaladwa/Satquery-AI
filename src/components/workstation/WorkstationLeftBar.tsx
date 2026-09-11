import React from 'react';
import {
  Search,
  BoxSelect,
  Layers,
  Palette,
  SlidersHorizontal,
  Ruler,
  Crosshair,
  LineChart,
  FileText,
  History,
  UploadCloud,
  Globe2,
  ScanSearch,
  AlertTriangle,
  Sprout,
  Building2
} from 'lucide-react';

export type DrawerType = 
  | 'search' 
  | 'aoi' 
  | 'layers' 
  | 'spectral' 
  | 'compare' 
  | 'measure' 
  | 'pixel' 
  | 'timeseries' 
  | 'landcover'
  | 'detect'
  | 'disaster'
  | 'agri'
  | 'urban'
  | 'reports' 
  | 'history'
  | 'upload'
  | null;

interface WorkstationLeftBarProps {
  activeDrawer: DrawerType;
  onToggleDrawer: (drawer: DrawerType) => void;
}

export const WorkstationLeftBar: React.FC<WorkstationLeftBarProps> = ({
  activeDrawer,
  onToggleDrawer
}) => {
  // Core GIS Tools
  const coreTools: { id: DrawerType; icon: any; label: string; shortcut?: string }[] = [
    { id: 'search', icon: Search, label: 'Scene Search (Sentinel-1/2)', shortcut: 'S' },
    { id: 'aoi', icon: BoxSelect, label: 'AOI Selection & Boundaries', shortcut: 'A' },
    { id: 'layers', icon: Layers, label: 'Layer Manager & Opacity', shortcut: 'L' },
    { id: 'spectral', icon: Palette, label: 'Spectral Bands & Indices (NDVI/NDWI)', shortcut: 'B' },
    { id: 'compare', icon: SlidersHorizontal, label: 'Comparison Slider (2023 vs 2026)', shortcut: 'C' },
    { id: 'measure', icon: Ruler, label: 'Measurement Tool (Distance & Area)', shortcut: 'M' },
    { id: 'pixel', icon: Crosshair, label: 'Pixel Inspector & Reflectance', shortcut: 'P' },
    { id: 'timeseries', icon: LineChart, label: 'Multi-Temporal Time Series', shortcut: 'T' }
  ];

  // Specialist Analysis Tools
  const analysisTools: { id: DrawerType; icon: any; label: string; shortcut?: string }[] = [
    { id: 'landcover', icon: Globe2, label: 'Land Cover Classification (8 Classes)', shortcut: 'K' },
    { id: 'detect', icon: ScanSearch, label: 'Object & Asset Detection (YOLO-OBB)', shortcut: 'O' },
    { id: 'disaster', icon: AlertTriangle, label: 'Disaster Assessment (Flood & Burn)', shortcut: 'D' },
    { id: 'agri', icon: Sprout, label: 'Crop Health & Agriculture (NDRE/SAVI)', shortcut: 'G' },
    { id: 'urban', icon: Building2, label: 'Urban Growth & Infrastructure', shortcut: 'N' }
  ];

  // Utilities
  const utilityTools: { id: DrawerType; icon: any; label: string; shortcut?: string }[] = [
    { id: 'reports', icon: FileText, label: 'PDF Report Generator', shortcut: 'R' },
    { id: 'history', icon: History, label: 'Conversation History', shortcut: 'H' },
    { id: 'upload', icon: UploadCloud, label: 'Upload Satellite Imagery', shortcut: 'U' }
  ];

  const renderToolButton = (tool: { id: DrawerType; icon: any; label: string; shortcut?: string }) => {
    const Icon = tool.icon;
    const isActive = activeDrawer === tool.id;

    return (
      <button
        key={tool.id}
        onClick={() => onToggleDrawer(isActive ? null : tool.id)}
        className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-all group ${
          isActive
            ? 'bg-gis-accent/20 text-gis-accent border border-gis-accent/40 shadow-sm shadow-gis-accent/10'
            : 'text-gis-textMuted hover:text-gis-textBright hover:bg-gis-hover border border-transparent'
        }`}
        title={`${tool.label} ${tool.shortcut ? `(${tool.shortcut})` : ''}`}
      >
        <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-gis-accent' : ''}`} />
        
        {/* Active Indicator Pip */}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-gis-accent rounded-r-full" />
        )}
      </button>
    );
  };

  return (
    <aside className="w-14 bg-gis-panel border-r border-gis-border flex flex-col items-center py-2.5 z-20 shrink-0 select-none overflow-y-auto overflow-x-hidden scrollbar-none">
      <div className="flex flex-col gap-1 w-full items-center">
        {coreTools.map(renderToolButton)}
        
        <div className="w-7 h-[1px] bg-[#283541]/70 my-1" />
        
        {analysisTools.map(renderToolButton)}

        <div className="w-7 h-[1px] bg-[#283541]/70 my-1" />

        {utilityTools.map(renderToolButton)}
      </div>

      <div className="mt-auto flex flex-col items-center gap-2 pt-2 border-t border-gis-border/50 w-full">
        <div className="text-[9px] font-mono text-gis-textMuted/60 uppercase tracking-widest text-center">
          GIS
        </div>
      </div>
    </aside>
  );
};
