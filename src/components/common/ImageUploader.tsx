import React, { useState, useRef } from 'react';
import { UploadCloud, FileUp, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { ImageRecord } from '../../types';

interface ImageUploaderProps {
  onUploadSuccess: (img: ImageRecord) => void;
  onClose?: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUploadSuccess, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sensor, setSensor] = useState('Sentinel-2 MSI');
  const [modality, setModality] = useState('Optical');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['tif', 'tiff', 'png', 'jpg', 'jpeg'].includes(ext || '')) {
      setError('Please upload a valid GeoTIFF, TIFF, PNG, or JPEG file.');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sensor', sensor);
    formData.append('modality', modality);
    formData.append('acquisition_date', new Date().toISOString().split('T')[0]);

    try {
      const newImg = await api.uploadImage(formData);
      onUploadSuccess(newImg);
      if (onClose) onClose();
    } catch (err: any) {
      console.error('Upload failed', err);
      setError(err.response?.data?.detail || 'Failed to upload satellite imagery.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gis-surface border border-gis-border rounded-lg p-5 max-w-md w-full select-none shadow-gis">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gis-border">
        <span className="text-sm font-bold text-gis-textBright flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-gis-accent" />
          <span>Upload Remote Sensing Imagery</span>
        </span>
        {onClose && (
          <button onClick={onClose} className="text-xs text-gis-textMuted hover:text-gis-textBright">
            ✕
          </button>
        )}
      </div>

      {/* Sensor & Modality Inputs */}
      <div className="grid grid-cols-2 gap-2.5 mb-3 text-xs">
        <div>
          <label className="block text-[11px] text-gis-textMuted mb-1 font-medium">Sensor</label>
          <select
            value={sensor}
            onChange={(e) => setSensor(e.target.value)}
            className="w-full bg-gis-panel border border-gis-border rounded px-2 py-1.5 text-gis-textBright text-xs focus:border-gis-accent focus:outline-none"
          >
            <option value="Sentinel-2 MSI">Sentinel-2 MSI (Optical)</option>
            <option value="Sentinel-1 C-SAR">Sentinel-1 C-SAR (Radar)</option>
            <option value="Landsat-9 OLI-2">Landsat-9 OLI-2 (Multispectral)</option>
            <option value="WorldView-3">WorldView-3 (Very High Res)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] text-gis-textMuted mb-1 font-medium">Modality</label>
          <select
            value={modality}
            onChange={(e) => setModality(e.target.value)}
            className="w-full bg-gis-panel border border-gis-border rounded px-2 py-1.5 text-gis-textBright text-xs focus:border-gis-accent focus:outline-none"
          >
            <option value="Optical">Optical (RGB/NIR)</option>
            <option value="SAR">SAR (Synthetic Aperture Radar)</option>
            <option value="Multispectral">Multispectral (SWIR/Thermal)</option>
          </select>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition ${
          isDragging
            ? 'border-gis-accent bg-gis-accent/10'
            : 'border-gis-border hover:border-gis-accent/50 bg-gis-bg'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".tif,.tiff,.png,.jpg,.jpeg"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-xs text-gis-accent">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="font-semibold">Extracting GeoTIFF tags and georeferencing...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <FileUp className="w-8 h-8 text-gis-textMuted" />
            <div className="text-xs font-semibold text-gis-textBright">
              Click to select or drag & drop satellite file
            </div>
            <div className="text-[10px] text-gis-textMuted">
              Supports GeoTIFF (.tif, .tiff), PNG, JPEG (Up to 500MB)
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 p-2 bg-gis-danger/10 border border-gis-danger/30 rounded text-xs text-gis-danger flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
