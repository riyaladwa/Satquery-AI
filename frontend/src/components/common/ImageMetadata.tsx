import React from 'react';
import { ImageRecord } from '../../types';
import { Info, Calendar, Satellite, Layers, MapPin, Gauge, Sun } from 'lucide-react';

interface ImageMetadataProps {
  image: ImageRecord | null;
}

export const ImageMetadata: React.FC<ImageMetadataProps> = ({ image }) => {
  if (!image) {
    return (
      <div className="p-4 text-center text-xs text-gis-textMuted bg-gis-surface border border-gis-border rounded-md">
        Select a satellite scene to inspect technical metadata.
      </div>
    );
  }

  const meta = image.metadata;

  return (
    <div className="bg-gis-surface border border-gis-border rounded-md p-3 space-y-2.5">
      <div className="flex items-center justify-between pb-2 border-b border-gis-border">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-gis-accent" />
          <span className="text-xs font-semibold text-gis-textBright uppercase tracking-wider">
            Raster Metadata
          </span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gis-panel border border-gis-border text-gis-accentCyan font-mono">
          {image.file_format}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="p-2 rounded bg-gis-panel border border-gis-border/60">
          <div className="text-gis-textMuted flex items-center gap-1 mb-0.5">
            <Satellite className="w-3 h-3 text-gis-accent" />
            <span>Sensor & Modality</span>
          </div>
          <div className="font-semibold text-gis-textBright truncate">
            {image.sensor} ({image.modality})
          </div>
        </div>

        <div className="p-2 rounded bg-gis-panel border border-gis-border/60">
          <div className="text-gis-textMuted flex items-center gap-1 mb-0.5">
            <Calendar className="w-3 h-3 text-gis-accent" />
            <span>Acquisition Date</span>
          </div>
          <div className="font-semibold text-gis-textBright">
            {image.acquisition_date || '2026-03-10'}
          </div>
        </div>

        <div className="p-2 rounded bg-gis-panel border border-gis-border/60">
          <div className="text-gis-textMuted flex items-center gap-1 mb-0.5">
            <Layers className="w-3 h-3 text-gis-accent" />
            <span>Dimensions & Bands</span>
          </div>
          <div className="font-semibold text-gis-textBright">
            {meta?.width || 512} × {meta?.height || 512} px ({meta?.bands || 3} bands)
          </div>
        </div>

        <div className="p-2 rounded bg-gis-panel border border-gis-border/60">
          <div className="text-gis-textMuted flex items-center gap-1 mb-0.5">
            <Gauge className="w-3 h-3 text-gis-accent" />
            <span>Spatial Resolution</span>
          </div>
          <div className="font-semibold text-gis-textBright">
            {meta?.resolution_m ? `${meta.resolution_m} m/pixel` : '10.0 m (GSD)'}
          </div>
        </div>

        <div className="p-2 rounded bg-gis-panel border border-gis-border/60">
          <div className="text-gis-textMuted flex items-center gap-1 mb-0.5">
            <MapPin className="w-3 h-3 text-gis-accent" />
            <span>CRS Projection</span>
          </div>
          <div className="font-semibold text-gis-textBright">
            {meta?.crs || 'EPSG:4326'}
          </div>
        </div>

        <div className="p-2 rounded bg-gis-panel border border-gis-border/60">
          <div className="text-gis-textMuted flex items-center gap-1 mb-0.5">
            <Sun className="w-3 h-3 text-gis-accent" />
            <span>Cloud Cover</span>
          </div>
          <div className="font-semibold text-gis-textBright">
            {meta?.cloud_cover !== undefined ? `${meta.cloud_cover}%` : '0.0%'}
          </div>
        </div>
      </div>
    </div>
  );
};
