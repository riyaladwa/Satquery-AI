import React from 'react';
import { Palette, X, Info, Check } from 'lucide-react';

interface SpectralDrawerProps {
  onClose: () => void;
  selectedSensor: 'Sentinel-2' | 'Sentinel-1' | 'Multimodal';
  activeBandCombination: string;
  onSelectCombination: (combinationId: string) => void;
}

export const SpectralDrawer: React.FC<SpectralDrawerProps> = ({
  onClose,
  selectedSensor,
  activeBandCombination,
  onSelectCombination
}) => {
  const opticalPresets = [
    {
      id: 'natural_color',
      name: 'Natural Color',
      bands: 'B04 • B03 • B02',
      description: 'Human visible spectrum. Realistic visual reproduction of terrain and urban environments.',
      type: 'RGB Composite'
    },
    {
      id: 'false_color_urban',
      name: 'Urban / Built-Up',
      bands: 'B12 • B11 • B04',
      description: 'Highlights concrete, asphalt roads, and building roofs in distinct cyan and violet tones.',
      type: 'SWIR Composite'
    },
    {
      id: 'color_infrared',
      name: 'Color Infrared (CIR)',
      bands: 'B08 • B04 • B03',
      description: 'Near-Infrared reflection. Dense vegetation appears vivid red, water appears dark blue.',
      type: 'NIR Composite'
    },
    {
      id: 'ndvi',
      name: 'NDVI (Vegetation Index)',
      bands: '(B08 - B04) / (B08 + B04)',
      description: 'Quantifies photosynthetic activity, chlorophyll absorption, and canopy density.',
      type: 'Spectral Index'
    },
    {
      id: 'ndwi',
      name: 'NDWI (Water Index)',
      bands: '(B03 - B08) / (B03 + B08)',
      description: 'Maximizes reflectance of water bodies and minimizes soil/terrestrial features.',
      type: 'Spectral Index'
    },
    {
      id: 'ndbi',
      name: 'NDBI (Built-up Index)',
      bands: '(B11 - B08) / (B11 + B08)',
      description: 'Emphasizes built-up land over vegetation using SWIR and NIR band differencing.',
      type: 'Spectral Index'
    },
    {
      id: 'agriculture',
      name: 'Agriculture & Crop Stress',
      bands: 'B11 • B08 • B02',
      description: 'Used to assess soil moisture, leaf water content, and crop stage delineation.',
      type: 'SWIR/NIR Composite'
    },
    {
      id: 'land_water',
      name: 'Land / Water Boundary',
      bands: 'B08 • B11 • B04',
      description: 'Clean coastal shoreline demarcation and inland water basin isolation.',
      type: 'Composite'
    }
  ];

  const sarPresets = [
    {
      id: 'sar_vv',
      name: 'VV Polarization (Single Bounce)',
      bands: 'VV Backscatter (dB)',
      description: 'High sensitivity to surface roughness, urban vertical walls, and calm water specular reflection.',
      type: 'SAR Channel'
    },
    {
      id: 'sar_vh',
      name: 'VH Polarization (Cross-Pol)',
      bands: 'VH Backscatter (dB)',
      description: 'Volume scattering response from vegetation, forest canopies, and rough water turbulence.',
      type: 'SAR Channel'
    },
    {
      id: 'sar_ratio',
      name: 'VV / VH Polarimetric Ratio',
      bands: 'VV / VH Dual Polarization',
      description: 'Separates moisture-saturated floodwaters from urban double-bounce microwave echoes.',
      type: 'Polarimetric Ratio'
    },
    {
      id: 'sar_false_color',
      name: 'SAR RGB Pseudo-Color',
      bands: 'VV • VH • (VV/VH)',
      description: 'Combines co-polarization and cross-polarization to yield high-contrast microwave map.',
      type: 'SAR Composite'
    }
  ];

  const currentPresets = selectedSensor === 'Sentinel-2' ? opticalPresets : sarPresets;

  return (
    <div className="w-80 bg-gis-panel border-r border-gis-border h-full flex flex-col z-20 shadow-2xl shadow-black/80 animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="p-3 border-b border-gis-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-gis-accent" />
          <h3 className="font-semibold text-xs text-gis-textBright uppercase tracking-wider">
            Spectral Visualization
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-gis-textMuted hover:text-gis-textBright hover:bg-gis-hover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Sensor Notice */}
      <div className="px-3 py-2 bg-gis-bg/40 border-b border-gis-border flex items-center justify-between text-[11px]">
        <span className="text-gis-textMuted">Active Sensor:</span>
        <span className={`font-mono font-semibold px-2 py-0.5 rounded text-[10px] ${
          selectedSensor === 'Sentinel-2' ? 'bg-gis-accent/20 text-gis-accent' : 'bg-gis-sar/20 text-gis-sar'
        }`}>
          {selectedSensor === 'Sentinel-2' ? 'Sentinel-2 Optical (MSI)' : 'Sentinel-1 C-SAR (Radar)'}
        </span>
      </div>

      {/* Preset List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {currentPresets.map((preset) => {
          const isSelected = activeBandCombination === preset.id;

          return (
            <button
              key={preset.id}
              onClick={() => onSelectCombination(preset.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col gap-1.5 ${
                isSelected
                  ? 'bg-gis-accent/15 border-gis-accent/60 shadow-sm shadow-gis-accent/10 text-gis-textBright'
                  : 'bg-gis-panel border-gis-border hover:border-gis-border/80 hover:bg-gis-hover text-gis-textBright'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs tracking-tight">{preset.name}</span>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-gis-accent text-gis-bg flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-gis-accent font-semibold">{preset.bands}</span>
                <span className="text-gis-textMuted/70">{preset.type}</span>
              </div>

              <p className="text-[11px] text-gis-textMuted leading-relaxed">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
