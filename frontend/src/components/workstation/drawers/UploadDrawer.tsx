import React, { useState } from 'react';
import { UploadCloud, X, Check, AlertCircle, FileText, Image as ImageIcon } from 'lucide-react';
import { api } from '../../../services/api';
import { ImageRecord } from '../../../types';

interface UploadDrawerProps {
  onClose: () => void;
  onImageUploaded: (img: ImageRecord) => void;
}

export const UploadDrawer: React.FC<UploadDrawerProps> = ({
  onClose,
  onImageUploaded
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [modality, setModality] = useState<'Optical' | 'SAR'>('Optical');
  const [sensor, setSensor] = useState('Sentinel-2 MSI');
  const [acquisitionDate, setAcquisitionDate] = useState('2026-09-08');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('modality', modality);
      formData.append('sensor', sensor);
      formData.append('acquisition_date', acquisitionDate);

      const uploaded = await api.uploadImage(formData);
      onImageUploaded(uploaded);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload satellite imagery. Please check file format.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-80 bg-gis-panel border-r border-gis-border h-full flex flex-col z-20 shadow-2xl shadow-black/80 animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="p-3 border-b border-gis-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-gis-accent" />
          <h3 className="font-semibold text-xs text-gis-textBright uppercase tracking-wider">
            Upload Satellite Imagery
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-gis-textMuted hover:text-gis-textBright hover:bg-gis-hover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {/* Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className="border-2 border-dashed border-gis-border/80 hover:border-gis-accent/70 rounded-xl p-5 text-center bg-gis-bg/50 transition-all flex flex-col items-center justify-center cursor-pointer group"
        >
          <input
            type="file"
            accept=".tif,.tiff,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="hidden"
            id="imagery-file-upload"
          />
          <label htmlFor="imagery-file-upload" className="cursor-pointer flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-gis-panel border border-gis-border flex items-center justify-center mb-2 group-hover:border-gis-accent/40 group-hover:text-gis-accent transition-colors">
              <UploadCloud className="w-5 h-5 text-gis-textMuted group-hover:text-gis-accent" />
            </div>
            <span className="font-bold text-xs text-gis-textBright">DROP SATELLITE IMAGE</span>
            <span className="text-[11px] text-gis-textMuted mt-0.5">Drag & drop satellite imagery here</span>
            <span className="text-[10px] text-gis-accent mt-2 px-2.5 py-1 rounded bg-gis-panel border border-gis-border font-medium">
              Browse Files
            </span>
            <span className="text-[9px] font-mono text-gis-textMuted/70 mt-2">
              Supported: GeoTIFF • TIFF • PNG • JPEG
            </span>
          </label>
        </div>

        {file && (
          <div className="p-2.5 rounded-lg bg-gis-bg border border-gis-border flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 truncate">
              <ImageIcon className="w-4 h-4 text-gis-accent shrink-0" />
              <span className="truncate text-gis-textBright">{file.name}</span>
            </div>
            <span className="text-[10px] text-gis-textMuted shrink-0">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </span>
          </div>
        )}

        {/* Metadata Controls */}
        <div className="space-y-2.5">
          <div className="space-y-1">
            <label className="text-[10px] text-gis-textMuted uppercase font-semibold">Sensor Modality</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setModality('Optical'); setSensor('Sentinel-2 MSI'); }}
                className={`py-1.5 text-xs font-medium rounded transition-colors ${
                  modality === 'Optical'
                    ? 'bg-gis-accent/20 text-gis-accent border border-gis-accent/40 font-semibold'
                    : 'bg-gis-panel border border-gis-border text-gis-textMuted'
                }`}
              >
                Optical Multispectral
              </button>
              <button
                type="button"
                onClick={() => { setModality('SAR'); setSensor('Sentinel-1 C-SAR'); }}
                className={`py-1.5 text-xs font-medium rounded transition-colors ${
                  modality === 'SAR'
                    ? 'bg-gis-sar/20 text-gis-sar border border-gis-sar/40 font-semibold'
                    : 'bg-gis-panel border border-gis-border text-gis-textMuted'
                }`}
              >
                Radar SAR (Microwave)
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gis-textMuted uppercase font-semibold">Acquisition Date</label>
            <input
              type="date"
              value={acquisitionDate}
              onChange={(e) => setAcquisitionDate(e.target.value)}
              className="w-full h-8 px-2 bg-gis-panel border border-gis-border rounded text-xs font-mono text-gis-textBright focus:outline-none focus:border-gis-accent"
            />
          </div>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-gis-danger/10 border border-gis-danger/30 text-gis-danger text-xs flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full py-2 rounded-lg bg-gis-accent hover:bg-gis-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-gis-bg font-bold text-xs uppercase tracking-wider transition-colors shadow-sm shadow-gis-accent/20"
        >
          {uploading ? 'Processing Raster & CRS...' : 'Upload & Extract Metadata'}
        </button>
      </form>
    </div>
  );
};
