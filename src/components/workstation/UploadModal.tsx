import React, { useState } from 'react';
import {
  UploadCloud,
  X,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Loader2,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { ImageRecord, QualityCheckResult } from '../../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageUploaded: (img: ImageRecord) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onImageUploaded
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [modality, setModality] = useState<'Optical' | 'SAR' | 'Multispectral'>('Optical');
  const [sensor, setSensor] = useState('Sentinel-2 MSI');
  const [acquisitionDate, setAcquisitionDate] = useState(new Date().toISOString().split('T')[0]);

  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<ImageRecord | null>(null);
  const [qualityResult, setQualityResult] = useState<QualityCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUploadedImage(null);
    setQualityResult(null);
    setError(null);
    setUploading(false);
    setValidating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a satellite imagery file to upload.');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('modality', modality);
      formData.append('sensor', sensor);
      formData.append('acquisition_date', acquisitionDate);

      // 1. Upload to backend
      const uploaded = await api.uploadImage(formData);
      setUploadedImage(uploaded);

      // 2. Automated Quality Verification
      setValidating(true);
      try {
        const quality = await api.validateImage(uploaded.id);
        setQualityResult(quality);
      } catch (valErr) {
        console.warn('Quality verification skipped or encountered issue:', valErr);
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.detail || 'Failed to upload satellite image. Please verify file format.');
    } finally {
      setUploading(false);
      setValidating(false);
    }
  };

  const handleConfirmScene = () => {
    if (uploadedImage) {
      onImageUploaded(uploadedImage);
      onClose();
      handleReset();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E3EAE5] rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E3EAE5] flex items-center justify-between bg-[#FBFDFB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAF7F0] border border-[#167A4A]/20 flex items-center justify-center text-[#167A4A]">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#17201B]">Upload Satellite Imagery</h3>
              <p className="text-[11px] text-[#66736B]">Ingest GeoTIFF, TIFF, PNG, or JPEG raster layers</p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              handleReset();
            }}
            className="p-1 rounded-lg text-[#66736B] hover:text-[#17201B] hover:bg-[#E3EAE5]/50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {!uploadedImage ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                  file
                    ? 'border-[#167A4A] bg-[#EAF7F0]/30'
                    : 'border-[#E3EAE5] hover:border-[#167A4A]/60 bg-[#FBFDFB]'
                }`}
              >
                <input
                  type="file"
                  accept=".tif,.tiff,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                  id="satellite-upload-input"
                />
                <label htmlFor="satellite-upload-input" className="cursor-pointer flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#E3EAE5] shadow-xs flex items-center justify-center text-[#167A4A] mb-2.5">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  {file ? (
                    <div className="space-y-1">
                      <span className="font-bold text-xs text-[#167A4A] flex items-center justify-center gap-1.5">
                        <FileCheck2 className="w-4 h-4" />
                        {file.name}
                      </span>
                      <span className="text-[11px] text-[#66736B]">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for processing
                      </span>
                    </div>
                  ) : (
                    <>
                      <span className="font-bold text-xs text-[#17201B]">
                        Drag & Drop or <span className="text-[#167A4A] underline">Browse</span>
                      </span>
                      <span className="text-[11px] text-[#66736B] mt-1">
                        Supports GeoTIFF (.tif, .tiff), PNG, and JPEG
                      </span>
                    </>
                  )}
                </label>
              </div>

              {/* Raster Properties Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#66736B] uppercase mb-1">
                    Modality
                  </label>
                  <select
                    value={modality}
                    onChange={(e) => setModality(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E3EAE5] bg-white text-xs font-semibold text-[#17201B] focus:outline-hidden focus:border-[#167A4A]"
                  >
                    <option value="Optical">Optical (RGB/VNIR)</option>
                    <option value="SAR">Synthetic Aperture Radar (SAR)</option>
                    <option value="Multispectral">Multispectral (12-Band)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#66736B] uppercase mb-1">
                    Sensor Platform
                  </label>
                  <select
                    value={sensor}
                    onChange={(e) => setSensor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E3EAE5] bg-white text-xs font-semibold text-[#17201B] focus:outline-hidden focus:border-[#167A4A]"
                  >
                    <option value="Sentinel-2 MSI">Sentinel-2 MSI</option>
                    <option value="Sentinel-1 C-SAR">Sentinel-1 C-SAR</option>
                    <option value="Landsat-9 OLI-2">Landsat-9 OLI-2</option>
                    <option value="Cartosat-3 High-Res">Cartosat-3 High-Res</option>
                    <option value="PlanetScope SuperDove">PlanetScope SuperDove</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#66736B] uppercase mb-1">
                    Acquisition Date
                  </label>
                  <input
                    type="date"
                    value={acquisitionDate}
                    onChange={(e) => setAcquisitionDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E3EAE5] bg-white text-xs font-semibold text-[#17201B] focus:outline-hidden focus:border-[#167A4A]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!file || uploading}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                    !file || uploading
                      ? 'bg-[#E3EAE5] text-[#66736B] cursor-not-allowed'
                      : 'bg-[#167A4A] hover:bg-[#13673E] text-white'
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Extracting Raster & Georeferencing...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload & Verify Scene</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Uploaded & Quality Validation View */
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-[#EAF7F0]/40 border border-[#167A4A]/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#167A4A] text-white flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#17201B]">{uploadedImage.original_filename}</h4>
                    <span className="text-[11px] text-[#66736B]">
                      {uploadedImage.sensor} • {uploadedImage.modality} • {uploadedImage.file_format}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#167A4A] text-white text-[10px] font-bold">
                  UPLOADED
                </span>
              </div>

              {/* Quality Check Results */}
              {qualityResult && (
                <div className="border border-[#E3EAE5] rounded-xl p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between border-b border-[#E3EAE5] pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#17201B]">
                      <ShieldCheck className="w-4 h-4 text-[#167A4A]" />
                      <span>Input Verification (ISRO Compliance)</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#167A4A]">
                      Quality Score: {qualityResult.overall_score}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-[#FBFDFB] border border-[#E3EAE5]">
                      <span className="text-[#66736B] block">Cloud Coverage:</span>
                      <span className="font-semibold text-[#17201B]">
                        {uploadedImage.metadata?.cloud_cover ?? 0}%
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#FBFDFB] border border-[#E3EAE5]">
                      <span className="text-[#66736B] block">Dynamic Contrast:</span>
                      <span className="font-semibold text-[#17201B]">
                        {uploadedImage.metadata?.contrast_score ? uploadedImage.metadata.contrast_score.toFixed(1) : '45.0'} / 100
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#FBFDFB] border border-[#E3EAE5]">
                      <span className="text-[#66736B] block">CRS Projection:</span>
                      <span className="font-semibold text-[#17201B]">
                        {uploadedImage.metadata?.crs || 'EPSG:4326'}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#FBFDFB] border border-[#E3EAE5]">
                      <span className="text-[#66736B] block">Sampling GSD:</span>
                      <span className="font-semibold text-[#17201B]">
                        {uploadedImage.metadata?.resolution_m || 10}m / pixel
                      </span>
                    </div>
                  </div>

                  {/* Check list */}
                  <div className="space-y-1 pt-1">
                    {qualityResult.checks.map((c) => (
                      <div key={c.id} className="flex items-center justify-between text-[11px]">
                        <span className="text-[#17201B] font-medium">{c.name}</span>
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            c.status === 'pass'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {c.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-2 rounded-xl border border-[#E3EAE5] text-xs font-semibold text-[#66736B] hover:bg-[#FBFDFB] cursor-pointer"
                >
                  Upload Another
                </button>
                <button
                  type="button"
                  onClick={handleConfirmScene}
                  className="flex-1 py-2.5 rounded-xl bg-[#167A4A] hover:bg-[#13673E] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Use in Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
