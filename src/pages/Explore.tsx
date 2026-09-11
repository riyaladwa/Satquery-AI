import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ImageRecord } from '../types';
import { SimpleNavBar } from '../components/navigation/SimpleNavBar';
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
  Sliders
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

  // Advanced Filters (Hidden by default)
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
    const isSar = img.modality === 'SAR' || img.filename.includes('s1');
    navigate(`/analyze?module=${isSar ? 'disaster' : 'urban'}&query=${encodeURIComponent('Analyze features and land cover in this scene')}`);
  };

  const handleViewInWorkstation = (img: ImageRecord) => {
    navigate(`/workstation?scene=${img.id}`);
  };

  return (
    <div className="min-h-screen w-screen bg-[#080B10] text-[#F5F7FA] font-sans flex flex-col select-none overflow-x-hidden">
      <SimpleNavBar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <span className="text-xs font-mono uppercase tracking-widest text-[#38D9D1] bg-[#38D9D1]/10 px-3 py-1 rounded-full border border-[#38D9D1]/30">
            IMAGERY CATALOG
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F7FA] mt-2.5">
            Explore Satellite Imagery
          </h1>
          <p className="text-xs text-[#9AA6B2] mt-1">
            Browse and discover calibrated Sentinel-1 radar and Sentinel-2 optical acquisitions.
          </p>
        </div>

        {/* Streamlined Filter Bar */}
        <div className="p-4 rounded-xl bg-[#121A22] border border-[#283541] space-y-3 mb-6 shadow-lg shadow-black/40">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Location Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#9AA6B2] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Location (e.g. Dublin, 30UUE)..."
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#0D1117] border border-[#283541] text-xs text-[#F5F7FA] focus:border-[#38D9D1] outline-none"
              />
            </div>

            {/* 2. Sensor Switcher */}
            <div className="flex items-center bg-[#0D1117] p-0.5 rounded-lg border border-[#283541]">
              {(['All', 'Sentinel-2', 'Sentinel-1'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSensorFilter(s)}
                  className={`flex-1 py-1 rounded-md text-xs font-medium transition-all ${
                    sensorFilter === s
                      ? 'bg-[#17212B] text-[#38D9D1] font-semibold'
                      : 'text-[#9AA6B2] hover:text-[#F5F7FA]'
                  }`}
                >
                  {s === 'All' ? 'All Data' : s}
                </button>
              ))}
            </div>

            {/* 3. Cloud Coverage Slider */}
            <div className="flex items-center gap-2 bg-[#0D1117] px-3 py-1 rounded-lg border border-[#283541]">
              <Cloud className="w-3.5 h-3.5 text-[#9AA6B2]" />
              <span className="text-[11px] text-[#9AA6B2] shrink-0 font-mono">Max Cloud: {maxCloud}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={maxCloud}
                onChange={(e) => setMaxCloud(Number(e.target.value))}
                className="w-full h-1 bg-[#283541] rounded-lg accent-[#38D9D1] cursor-pointer"
              />
            </div>
          </div>

          {/* Advanced Filters Toggle (Hidden by Default) */}
          <div className="pt-1">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-xs text-[#9AA6B2] hover:text-[#F5F7FA] flex items-center gap-1 font-mono transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-[#38D9D1]" />
              <span>Advanced Filters</span>
              {showAdvancedFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvancedFilters && (
              <div className="mt-2.5 p-3 rounded-lg bg-[#0D1117] border border-[#283541] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in duration-150">
                <div>
                  <label className="text-[11px] text-[#9AA6B2] block mb-1">Orbit Direction</label>
                  <select
                    value={orbitDirection}
                    onChange={(e: any) => setOrbitDirection(e.target.value)}
                    className="w-full h-8 bg-[#121A22] border border-[#283541] rounded px-2 text-[#F5F7FA] text-xs outline-none"
                  >
                    <option value="any">Any Direction (Ascending / Descending)</option>
                    <option value="descending">Descending Only (Morning Optical)</option>
                    <option value="ascending">Ascending Only (Evening Radar)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#9AA6B2] block mb-1">Product Level</label>
                  <select
                    value={productLevel}
                    onChange={(e: any) => setProductLevel(e.target.value)}
                    className="w-full h-8 bg-[#121A22] border border-[#283541] rounded px-2 text-[#F5F7FA] text-xs outline-none"
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
          <div className="flex items-center justify-between text-xs text-[#9AA6B2]">
            <span>Available Scenes ({filteredImages.length})</span>
            <span className="font-mono text-[11px]">GSD: 10m Ground Resolution</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredImages.map((img) => {
              const isSar = img.modality === 'SAR' || img.filename.includes('s1');
              const cloud = img.metadata?.cloud_cover ?? 0;
              const date = img.acquisition_date || '08 Sep 2026';

              return (
                <div
                  key={img.id}
                  className="p-4 rounded-xl bg-[#121A22] border border-[#283541] hover:border-[#38D9D1]/80 hover:bg-[#17212B] transition-all flex flex-col justify-between space-y-3 shadow-lg shadow-black/30"
                >
                  {/* Top metadata */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#F5F7FA] flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-[#38D9D1]" />
                        <span>{isSar ? 'Sentinel-1 C-SAR' : 'Sentinel-2 L2A'}</span>
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0D1117] border border-[#283541] text-[#38D9D1]">
                        10 m
                      </span>
                    </div>

                    <div className="text-xs text-[#9AA6B2] flex items-center justify-between font-mono">
                      <span>{date}</span>
                      <span>Cloud: {isSar ? '0% (Radar)' : `${cloud}%`}</span>
                    </div>

                    {/* Mini Scene Preview Box */}
                    <div className="h-28 rounded-lg overflow-hidden bg-[#0D1117] border border-[#283541] flex items-center justify-center relative group">
                      <div className="text-center space-y-1">
                        <span className="text-[11px] font-mono font-bold text-[#F5F7FA]">
                          {img.filename.replace('.tif', '')}
                        </span>
                        <div className="text-[10px] text-[#9AA6B2] font-mono">
                          {isSar ? 'VV + VH Polarizations' : 'B02 • B03 • B04 • B08'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions: View / Analyze */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#283541]/50">
                    <button
                      onClick={() => handleViewInWorkstation(img)}
                      className="flex-1 py-1.5 rounded-lg bg-[#0D1117] hover:bg-[#17212B] border border-[#283541] text-xs text-[#F5F7FA] font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => handleAnalyzeScene(img)}
                      className="flex-1 py-1.5 rounded-lg bg-[#38D9D1] hover:bg-[#2bc4bc] text-[#080B10] text-xs font-bold flex items-center justify-center gap-1 transition-colors"
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
