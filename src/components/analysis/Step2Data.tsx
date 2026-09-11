import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  PenTool, 
  UploadCloud, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Radio
} from 'lucide-react';

interface Step2DataProps {
  moduleName: string;
  location: string;
  onChangeLocation: (loc: string) => void;
  selectedSensor: 'auto' | 'Sentinel-2' | 'Sentinel-1' | 'multimodal';
  onChangeSensor: (sensor: 'auto' | 'Sentinel-2' | 'Sentinel-1' | 'multimodal') => void;
  onBack: () => void;
  onStartAnalysis: () => void;
}

export const Step2Data: React.FC<Step2DataProps> = ({
  moduleName,
  location,
  onChangeLocation,
  selectedSensor,
  onChangeSensor,
  onBack,
  onStartAnalysis,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'draw' | 'upload'>('search');
  const [showWhyData, setShowWhyData] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Recommendations based on module
  const getRecommendation = (mod: string) => {
    switch (mod.toLowerCase()) {
      case 'disaster':
        return {
          sensor: 'Sentinel-1 + Sentinel-2',
          tag: 'Multimodal Radar + Optical',
          explanation:
            'Natural disasters such as floods frequently produce dense cloud cover. Sentinel-1 C-band synthetic aperture radar penetrates clouds and rain to map standing water and flooding, while Sentinel-2 optical provides true-color contextual surface validation when skies clear.'
        };
      case 'urban':
      case 'urban growth':
        return {
          sensor: 'Sentinel-2 (Optical)',
          tag: 'High-Resolution Multispectral',
          explanation:
            'Sentinel-2 provides 10-meter visible and shortwave infrared bands (B02–B12), perfectly suited for Normalized Difference Built-up Index (NDBI) calculation, impervious surface mapping, and building footprint delineation.'
        };
      case 'agriculture':
        return {
          sensor: 'Sentinel-2 (Optical)',
          tag: 'Red Edge & Near-Infrared',
          explanation:
            'Sentinel-2 incorporates dedicated red-edge and near-infrared (NIR) bands that measure chlorophyll absorption, canopy water content (NDWI), and photosynthetic vigor (NDVI) with 5-day revisit cadence.'
        };
      default:
        return {
          sensor: 'Sentinel-2 (Optical)',
          tag: 'Multispectral Surface Analysis',
          explanation:
            'Sentinel-2 provides the optimal balance of multispectral coverage, 10m spatial resolution, and atmospheric correction for general land cover and environmental assessment.'
        };
    }
  };

  const rec = getRecommendation(moduleName);

  const presetLocations = [
    { name: 'Dublin, Ireland (Demo Flagship)', coords: '53.3472, -6.2439', tile: 'Tile 30UUE' },
    { name: 'Bengaluru, India (Urban Expansion)', coords: '12.95, 77.62', tile: 'Tile 43PGN' },
    { name: 'Kerala, India (Monsoon Flooding)', coords: '9.98, 76.30', tile: 'Tile 43PFR' },
  ];

  return (
    <div className="max-w-2xl mx-auto w-full py-8 px-4 flex flex-col items-center">
      {/* Title */}
      <div className="text-center mb-6">
        <span className="text-xs font-mono uppercase tracking-widest text-[#38D9D1] bg-[#38D9D1]/10 px-3 py-1 rounded-full border border-[#38D9D1]/30">
          LOCATION & SATELLITE DATA
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F7FA] mt-3">
          Where is the area to analyze?
        </h2>
        <p className="text-xs text-[#9AA6B2] mt-1.5">
          Select your geographic boundary and review SatQuery’s recommended satellite dataset.
        </p>
      </div>

      <div className="w-full space-y-5">
        {/* 1. LOCATION SECTION */}
        <div className="p-4 rounded-xl bg-[#121A22] border border-[#283541] space-y-3 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#9AA6B2] font-semibold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#38D9D1]" />
              <span>Location Selection</span>
            </span>

            {/* Sub-modes: Search, Draw, Upload */}
            <div className="flex items-center gap-1 bg-[#0D1117] p-0.5 rounded-lg border border-[#283541]">
              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  activeTab === 'search'
                    ? 'bg-[#17212B] text-[#38D9D1] font-semibold'
                    : 'text-[#9AA6B2] hover:text-[#F5F7FA]'
                }`}
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('draw')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  activeTab === 'draw'
                    ? 'bg-[#17212B] text-[#38D9D1] font-semibold'
                    : 'text-[#9AA6B2] hover:text-[#F5F7FA]'
                }`}
              >
                Draw Area
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  activeTab === 'upload'
                    ? 'bg-[#17212B] text-[#38D9D1] font-semibold'
                    : 'text-[#9AA6B2] hover:text-[#F5F7FA]'
                }`}
              >
                Upload
              </button>
            </div>
          </div>

          {activeTab === 'search' && (
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-[#9AA6B2] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => onChangeLocation(e.target.value)}
                  placeholder="Search a place, coordinates (53.3472, -6.2439), or tile..."
                  className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#0D1117] border border-[#283541] focus:border-[#38D9D1] text-xs text-[#F5F7FA] placeholder-[#9AA6B2]/60 outline-none"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2 pt-1">
                {presetLocations.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onChangeLocation(p.name)}
                    className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1.5 ${
                      location.includes(p.coords) || location.includes(p.name)
                        ? 'bg-[#38D9D1]/15 text-[#38D9D1] border-[#38D9D1] font-medium'
                        : 'bg-[#0D1117] text-[#9AA6B2] hover:text-[#F5F7FA] border-[#283541]'
                    }`}
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] font-mono text-[#9AA6B2]/60">{p.tile}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'draw' && (
            <div className="p-3 rounded-lg bg-[#0D1117] border border-[#283541] text-center space-y-1.5">
              <PenTool className="w-5 h-5 text-[#38D9D1] mx-auto" />
              <p className="text-xs text-[#F5F7FA] font-medium">Interactive Drawing in Workspace</p>
              <p className="text-[11px] text-[#9AA6B2]">
                SatQuery will load the satellite canvas so you can draw a polygon, rectangle, or circle bounding box directly.
              </p>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="p-4 rounded-lg bg-[#0D1117] border border-dashed border-[#283541] hover:border-[#38D9D1]/60 text-center space-y-2 cursor-pointer transition-colors">
              <UploadCloud className="w-6 h-6 text-[#38D9D1] mx-auto" />
              <div className="text-xs text-[#F5F7FA] font-medium">
                {uploadFile ? uploadFile.name : 'Click to select GeoTIFF or KML / GeoJSON boundary'}
              </div>
              <p className="text-[10px] text-[#9AA6B2]">Supports GeoTIFF, TIFF, GeoJSON, KML, Shapefile zip</p>
              <input
                type="file"
                className="hidden"
                id="imagery-file-input"
                onChange={(e) => {
                  if (e.target.files?.[0]) setUploadFile(e.target.files[0]);
                }}
              />
              <label
                htmlFor="imagery-file-input"
                className="inline-block px-3 py-1 rounded bg-[#17212B] hover:bg-[#1E2B38] text-xs text-[#38D9D1] border border-[#38D9D1]/30 cursor-pointer"
              >
                Browse File
              </label>
            </div>
          )}
        </div>

        {/* 2. SATELLITE DATA SECTION */}
        <div className="p-4 rounded-xl bg-[#121A22] border border-[#283541] space-y-3 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#9AA6B2] font-semibold flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#38D9D1]" />
              <span>Satellite Imagery</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#38D9D1]/15 text-[#38D9D1] border border-[#38D9D1]/30 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Recommended by SatQuery</span>
            </span>
          </div>

          {/* Recommended Data Card */}
          <div className="p-3.5 rounded-lg bg-[#0D1117] border border-[#38D9D1]/40 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-[#F5F7FA] flex items-center gap-2">
                  <span>{rec.sensor}</span>
                  <CheckCircle2 className="w-4 h-4 text-[#38D9D1]" />
                </h4>
                <p className="text-[11px] text-[#9AA6B2]">{rec.tag}</p>
              </div>

              <button
                type="button"
                onClick={() => setShowWhyData(!showWhyData)}
                className="text-xs text-[#38D9D1] hover:underline flex items-center gap-1 font-mono"
              >
                <span>Why this data?</span>
                {showWhyData ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Expandable Plain-English Explanation */}
            {showWhyData && (
              <div className="mt-2 pt-2 border-t border-[#283541] text-xs text-[#C4D0DC] leading-relaxed animate-in fade-in duration-200">
                <div className="flex items-start gap-2 bg-[#17212B]/70 p-2.5 rounded-md border border-[#283541]">
                  <Info className="w-4 h-4 text-[#38D9D1] shrink-0 mt-0.5" />
                  <p>{rec.explanation}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-lg text-xs text-[#9AA6B2] hover:text-[#F5F7FA] hover:bg-[#121A22] transition-colors"
          >
            ← Back to Question
          </button>

          <button
            type="button"
            onClick={onStartAnalysis}
            className="px-6 py-2.5 rounded-lg bg-[#38D9D1] hover:bg-[#2bc4bc] text-[#080B10] font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
          >
            <span>Start Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
