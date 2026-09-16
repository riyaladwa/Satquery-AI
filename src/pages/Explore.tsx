import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, resolveAssetUrl } from '../services/api';
import { ImageRecord } from '../types';
import { MinimalHeader } from '../components/navigation/MinimalHeader';
import { 
  Search, 
  Calendar, 
  Cloud, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  ArrowRight, 
  Sparkles,
  Radio,
  Sliders,
  Layers,
  MapPin,
  GitCompare,
  Check
} from 'lucide-react';

export const Explore: React.FC = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Simple Controls
  const [searchLocation, setSearchLocation] = useState('Dublin, Ireland');
  const [sensorFilter, setSensorFilter] = useState<'All' | 'Sentinel-2' | 'Sentinel-1'>('All');
  const [maxCloud, setMaxCloud] = useState<number>(20);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Advanced Filters
  const [orbitDirection, setOrbitDirection] = useState<'any' | 'descending' | 'ascending'>('any');
  const [productLevel, setProductLevel] = useState<'any' | 'L2A' | 'GRD'>('any');

  useEffect(() => {
    api.getImages()
      .then((data) => setImages(data))
      .catch((err) => console.error('Failed to load scenes', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredImages = images.filter((img) => {
    if (sensorFilter !== 'All') {
      if (sensorFilter === 'Sentinel-2' && img.modality !== 'Optical' && !img.filename.includes('s2')) return false;
      if (sensorFilter === 'Sentinel-1' && img.modality !== 'SAR' && !img.filename.includes('s1')) return false;
    }
    if ((img.metadata?.cloud_cover ?? 0) > maxCloud) return false;
    return true;
  });

  const handleAnalyzeScene = (img: ImageRecord) => {
    navigate(`/app?image=${img.id}&query=${encodeURIComponent('Analyze features and land cover in this scene')}`);
  };

  const handleCompareScene = (img: ImageRecord) => {
    navigate(`/compare?preset=dublin`);
  };

  return (
    <div className="min-h-screen w-screen bg-[#FBFDFB] text-[#17201B] font-sans flex flex-col select-none overflow-x-hidden">
      <MinimalHeader />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3EAE5] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF7F0] border border-[#167A4A]/20 text-[#167A4A] text-xs font-bold uppercase tracking-wider mb-2">
              <Search className="w-3.5 h-3.5" />
              <span>Imagery Catalog & Discovery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#17201B] tracking-tight">
              Explore Satellite Imagery
            </h1>
            <p className="text-xs sm:text-sm text-[#66736B] mt-1">
              Browse calibrated Sentinel-1 radar and Sentinel-2 optical acquisitions with sub-pixel ground resolution.
            </p>
          </div>
        </div>

        {/* Streamlined Filter Bar */}
        <div className="p-4 rounded-xl bg-white border border-[#E3EAE5] space-y-3 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Location Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#66736B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Search location or tile (e.g. Dublin, 30UUE)..."
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#F8FAFC] border border-[#E3EAE5] text-xs text-[#17201B] focus:border-[#167A4A] outline-none"
              />
            </div>

            {/* 2. Sensor Switcher */}
            <div className="flex items-center bg-[#F8FAFC] p-0.5 rounded-lg border border-[#E3EAE5]">
              {(['All', 'Sentinel-2', 'Sentinel-1'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSensorFilter(s)}
                  className={`flex-1 py-1 rounded-md text-xs font-medium transition-all ${
                    sensorFilter === s
                      ? 'bg-white text-[#167A4A] font-bold shadow-xs'
                      : 'text-[#66736B] hover:text-[#17201B]'
                  }`}
                >
                  {s === 'All' ? 'All Data' : s}
                </button>
              ))}
            </div>

            {/* 3. Cloud Coverage Slider */}
            <div className="flex items-center gap-2 bg-[#F8FAFC] px-3 py-1 rounded-lg border border-[#E3EAE5]">
              <Cloud className="w-3.5 h-3.5 text-[#66736B]" />
              <span className="text-[11px] text-[#66736B] shrink-0 font-mono">Max Cloud: {maxCloud}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={maxCloud}
                onChange={(e) => setMaxCloud(Number(e.target.value))}
                className="w-full h-1 bg-[#E3EAE5] rounded-lg accent-[#167A4A] cursor-pointer"
              />
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="pt-1">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-xs text-[#66736B] hover:text-[#17201B] flex items-center gap-1 font-mono transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-[#167A4A]" />
              <span>Advanced Processing Filters</span>
              {showAdvancedFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvancedFilters && (
              <div className="mt-2.5 p-3 rounded-lg bg-[#F8FAFC] border border-[#E3EAE5] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in duration-150">
                <div>
                  <label className="text-[11px] text-[#66736B] block mb-1">Orbit Pass Direction</label>
                  <select
                    value={orbitDirection}
                    onChange={(e: any) => setOrbitDirection(e.target.value)}
                    className="w-full h-8 bg-white border border-[#E3EAE5] rounded px-2 text-[#17201B] text-xs outline-none"
                  >
                    <option value="any">Any Direction (Ascending / Descending)</option>
                    <option value="descending">Descending Only (Morning Optical)</option>
                    <option value="ascending">Ascending Only (Evening Radar)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#66736B] block mb-1">Processing Product Level</label>
                  <select
                    value={productLevel}
                    onChange={(e: any) => setProductLevel(e.target.value)}
                    className="w-full h-8 bg-white border border-[#E3EAE5] rounded px-2 text-[#17201B] text-xs outline-none"
                  >
                    <option value="any">All Processing Levels</option>
                    <option value="L2A">Level-2A BOA Surface Reflectance</option>
                    <option value="GRD">Level-1 GRD SAR Backscatter</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scene Cards Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#66736B]">
            <span className="font-bold">Calibrated Scenes ({filteredImages.length})</span>
            <span className="font-mono text-[11px]">WGS-84 • 10m Ground Resolution</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredImages.map((img) => {
              const isSar = img.modality === 'SAR' || img.filename.includes('s1');
              const cloud = img.metadata?.cloud_cover ?? 0;
              const date = img.acquisition_date || '08 Sep 2026';
              const previewSrc = resolveAssetUrl(img.preview_url || `/previews/${img.filename.replace('.tif', '.png')}`);

              return (
                <div
                  key={img.id}
                  className="p-4 rounded-xl bg-white border border-[#E3EAE5] hover:border-[#167A4A] transition-all flex flex-col justify-between space-y-3 shadow-xs group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#17201B] flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-[#167A4A]" />
                        <span>{isSar ? 'Sentinel-1 C-SAR' : 'Sentinel-2 L2A'}</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EAF7F0] border border-[#167A4A]/20 text-[#167A4A] font-bold">
                        10m GSD
                      </span>
                    </div>

                    <div className="text-xs text-[#66736B] flex items-center justify-between font-mono">
                      <span>{date}</span>
                      <span>Cloud: {isSar ? '0% (Radar)' : `${cloud}%`}</span>
                    </div>

                    {/* Scene Preview Image */}
                    <div className="h-32 rounded-lg overflow-hidden bg-[#F8FAFC] border border-[#E3EAE5] relative group">
                      <img
                        src={previewSrc}
                        alt={img.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2.5">
                        <span className="text-white text-[11px] font-mono font-bold truncate">
                          {img.filename.replace('.tif', '')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#E3EAE5]">
                    <button
                      onClick={() => handleCompareScene(img)}
                      className="flex-1 py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-[#F4F6F5] border border-[#E3EAE5] text-xs text-[#17201B] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <GitCompare className="w-3.5 h-3.5 text-[#167A4A]" />
                      <span>Compare</span>
                    </button>

                    <button
                      onClick={() => handleAnalyzeScene(img)}
                      className="flex-1 py-1.5 rounded-lg bg-[#167A4A] hover:bg-[#13673E] text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <span>Analyze</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
