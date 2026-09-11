import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { ImageRecord, EvidenceRegion } from '../../types';
import { Crosshair, Compass, Layers, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { api } from '../../services/api';

interface WorkstationMapProps {
  image?: ImageRecord | null;
  selectedSensor: 'Sentinel-2' | 'Sentinel-1' | 'Multimodal';
  evidenceRegions?: EvidenceRegion[];
  selectedEvidenceId?: string | null;
  onSelectEvidence?: (id: string) => void;
  onMapClick?: (lat: number, lon: number) => void;
  activeDrawMode?: 'none' | 'rectangle' | 'polygon' | 'circle';
  onDrawComplete?: (geojson: any, areaHectares: number) => void;
  measurementActive?: boolean;
  onMeasurementComplete?: (result: any) => void;
  showHeatmap?: boolean;
  heatmapOpacity?: number;
  activeBandCombination?: string;
  externalAoiGeojson?: any;
}

export const WorkstationMap: React.FC<WorkstationMapProps> = ({
  image,
  selectedSensor,
  evidenceRegions = [],
  selectedEvidenceId,
  onSelectEvidence,
  onMapClick,
  activeDrawMode = 'none',
  onDrawComplete,
  measurementActive = false,
  onMeasurementComplete,
  showHeatmap = false,
  heatmapOpacity = 0.6,
  activeBandCombination = 'natural_color',
  externalAoiGeojson
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileRef = useRef<L.TileLayer | null>(null);
  const labelsTileRef = useRef<L.TileLayer | null>(null);
  const imageOverlayRef = useRef<L.ImageOverlay | null>(null);
  const vectorGroupRef = useRef<L.FeatureGroup | null>(null);
  const drawGroupRef = useRef<L.FeatureGroup | null>(null);
  const heatmapLayerRef = useRef<L.ImageOverlay | null>(null);
  const aoiLayerRef = useRef<L.GeoJSON | null>(null);

  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number }>({
    lat: 53.3472,
    lng: -6.2439
  });
  const [zoomLevel, setZoomLevel] = useState<number>(13);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drawPoints, setDrawPoints] = useState<[number, number][]>([]);

  // Stable callback refs
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;

  const onSelectEvidenceRef = useRef(onSelectEvidence);
  onSelectEvidenceRef.current = onSelectEvidence;

  const onDrawCompleteRef = useRef(onDrawComplete);
  onDrawCompleteRef.current = onDrawComplete;

  const onMeasurementCompleteRef = useRef(onMeasurementComplete);
  onMeasurementCompleteRef.current = onMeasurementComplete;

  const activeDrawModeRef = useRef(activeDrawMode);
  activeDrawModeRef.current = activeDrawMode;

  const measurementActiveRef = useRef(measurementActive);
  measurementActiveRef.current = measurementActive;

  const drawPointsRef = useRef<[number, number][]>([]);
  drawPointsRef.current = drawPoints;

  // Initialize Map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapInstanceRef.current) return;

    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    // Default Dublin coordinates
    const defaultCenter: [number, number] = [53.3472, -6.2439];
    const map = L.map(container, {
      center: defaultCenter,
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    // High resolution Esri World Imagery base tiles
    const esriTiles = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    ).addTo(map);
    baseTileRef.current = esriTiles;

    // Carto Dark reference labels & boundaries
    const labels = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png',
      { subdomains: 'abcd', maxZoom: 19, opacity: 0.85 }
    ).addTo(map);
    labelsTileRef.current = labels;

    vectorGroupRef.current = L.featureGroup().addTo(map);
    drawGroupRef.current = L.featureGroup().addTo(map);

    // Mousemove listener for live coordinate readout
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setMouseCoords({
        lat: Number(e.latlng.lat.toFixed(5)),
        lng: Number(e.latlng.lng.toFixed(5))
      });
    });

    map.on('zoomend', () => {
      setZoomLevel(map.getZoom());
    });

    // Click listener for sampling pixel reflectances or drawing
    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = Number(e.latlng.lat.toFixed(5));
      const lon = Number(e.latlng.lng.toFixed(5));

      if (measurementActiveRef.current) {
        const next = [...drawPointsRef.current, [lat, lon] as [number, number]];
        setDrawPoints(next);
        drawPointsRef.current = next;

        if (next.length >= 3 && onMeasurementCompleteRef.current) {
          const coordsForApi = next.map(([la, lo]) => [lo, la] as [number, number]);
          api.calculateArea(coordsForApi).then(res => {
            onMeasurementCompleteRef.current?.({
              area_hectares: res.area_hectares,
              area_sqkm: res.area_sqkm,
              perimeter_km: res.perimeter_km
            });
          }).catch(console.error);
        }
        return;
      }

      if (activeDrawModeRef.current !== 'none') {
        const next = [...drawPointsRef.current, [lat, lon] as [number, number]];
        setDrawPoints(next);
        drawPointsRef.current = next;

        if (activeDrawModeRef.current === 'rectangle' && next.length >= 2) {
          const p1 = next[0];
          const p2 = next[1];
          const bounds: [number, number, number, number] = [
            Math.min(p1[0], p2[0]),
            Math.min(p1[1], p2[1]),
            Math.max(p1[0], p2[0]),
            Math.max(p1[1], p2[1])
          ];
          const polyCoords: [number, number][] = [
            [bounds[1], bounds[0]],
            [bounds[3], bounds[0]],
            [bounds[3], bounds[2]],
            [bounds[1], bounds[2]]
          ];
          api.calculateArea(polyCoords).then(res => {
            onDrawCompleteRef.current?.({ type: 'Polygon', coordinates: [polyCoords] }, res.area_hectares);
          });
          setDrawPoints([]);
        } else if (activeDrawModeRef.current === 'polygon' && next.length >= 4) {
          const polyCoords = next.map(([la, lo]) => [lo, la] as [number, number]);
          api.calculateArea(polyCoords).then(res => {
            onDrawCompleteRef.current?.({ type: 'Polygon', coordinates: [polyCoords] }, res.area_hectares);
          });
          setDrawPoints([]);
        }
        return;
      }

      // Default click: inspect pixel at sampled coordinate
      onMapClickRef.current?.(lat, lon);
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Center / Bounds when Image changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !image || !image.metadata) return;

    const [minLat, minLon, maxLat, maxLon] = image.metadata.bounds;
    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;

    map.flyTo([centerLat, centerLon], 13, { duration: 1.2 });

    // Update Image Raster Overlay
    if (imageOverlayRef.current) {
      map.removeLayer(imageOverlayRef.current);
    }

    if (image.preview_url) {
      const bounds: L.LatLngBoundsExpression = [[minLat, minLon], [maxLat, maxLon]];
      const overlay = L.imageOverlay(image.preview_url, bounds, {
        opacity: 0.88,
        interactive: false
      }).addTo(map);
      imageOverlayRef.current = overlay;
    }
  }, [image]);

  // Update External AOI GeoJSON
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (aoiLayerRef.current) {
      map.removeLayer(aoiLayerRef.current);
      aoiLayerRef.current = null;
    }

    if (externalAoiGeojson) {
      const aoiLayer = L.geoJSON(externalAoiGeojson, {
        style: {
          color: '#38D9D1',
          weight: 2.5,
          dashArray: '6, 6',
          fillColor: '#38D9D1',
          fillOpacity: 0.15
        }
      }).addTo(map);

      aoiLayerRef.current = aoiLayer;
      try {
        map.fitBounds(aoiLayer.getBounds(), { padding: [40, 40] });
      } catch (err) {}
    }
  }, [externalAoiGeojson]);

  // Render Vector Evidence Regions
  useEffect(() => {
    const vg = vectorGroupRef.current;
    if (!vg) return;

    vg.clearLayers();

    if (evidenceRegions.length === 0) return;

    evidenceRegions.forEach((ev) => {
      if (!ev.coordinates || ev.coordinates.length < 3) return;

      const latLngs = ev.coordinates.map(([lon, lat]) => [lat, lon] as [number, number]);
      const isSelected = selectedEvidenceId === ev.id;

      // Color coding by feature type
      let strokeColor = '#38D9D1'; // default cyan
      let fillColor = '#38D9D1';

      const typeLower = (ev.type || '').toLowerCase();
      if (typeLower.includes('water') || typeLower.includes('flood')) {
        strokeColor = '#38D9D1';
        fillColor = '#0EA5E9';
      } else if (typeLower.includes('building') || typeLower.includes('built')) {
        strokeColor = '#FF6B6B';
        fillColor = '#FF6B6B';
      } else if (typeLower.includes('vegetation') || typeLower.includes('crop')) {
        strokeColor = '#55D187';
        fillColor = '#55D187';
      }

      const polygon = L.polygon(latLngs, {
        color: isSelected ? '#FFFFFF' : strokeColor,
        weight: isSelected ? 3 : 2,
        fillColor: fillColor,
        fillOpacity: isSelected ? 0.45 : 0.25,
        dashArray: isSelected ? undefined : '4, 4'
      });

      polygon.bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 12px; color: #F5F7FA; background: #121820; padding: 4px; border-radius: 6px;">
          <strong style="color: #38D9D1;">${ev.label}</strong><br/>
          <span>Type: ${ev.type}</span><br/>
          <span>Area: ${ev.area_hectares} ha (${ev.area_sqkm} km²)</span><br/>
          <span style="color: #9AA6B2;">Confidence: ${ev.confidence}%</span>
        </div>
      `);

      polygon.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectEvidenceRef.current?.(ev.id);
      });

      vg.addLayer(polygon);
    });
  }, [evidenceRegions, selectedEvidenceId]);

  // Update Draw Points & Measurement Rendering
  useEffect(() => {
    const dg = drawGroupRef.current;
    if (!dg) return;

    dg.clearLayers();

    if (drawPoints.length === 0) return;

    // Draw markers for vertices
    drawPoints.forEach(([lat, lng]) => {
      const circle = L.circleMarker([lat, lng], {
        radius: 4,
        color: '#38D9D1',
        fillColor: '#FFFFFF',
        fillOpacity: 1.0,
        weight: 2
      });
      dg.addLayer(circle);
    });

    if (drawPoints.length > 1) {
      const line = L.polyline(drawPoints, {
        color: '#38D9D1',
        weight: 2,
        dashArray: '5, 5'
      });
      dg.addLayer(line);
    }
  }, [drawPoints]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetNorth = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.setView(map.getCenter(), map.getZoom(), { animate: true });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#080B10] select-none overflow-hidden flex flex-col">
      {/* Main Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full outline-none z-10 cursor-crosshair"
      />

      {/* Floating Compass / North Arrow (Top-Left) */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={handleResetNorth}
          className="w-9 h-9 rounded-lg bg-gis-panel/90 backdrop-blur border border-gis-border hover:border-gis-accent/50 text-gis-textBright flex flex-col items-center justify-center shadow-lg shadow-black/60 transition-colors group"
          title="North Indicator / Reset Orientation"
        >
          <Compass className="w-4 h-4 text-gis-accent group-hover:rotate-45 transition-transform" />
          <span className="text-[8px] font-mono font-bold text-gis-accent leading-none">N</span>
        </button>
      </div>

      {/* Floating Map Controls (Top-Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-lg bg-gis-panel/90 backdrop-blur border border-gis-border hover:border-gis-accent/50 text-gis-textBright flex items-center justify-center shadow-lg shadow-black/60 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-lg bg-gis-panel/90 backdrop-blur border border-gis-border hover:border-gis-accent/50 text-gis-textBright flex items-center justify-center shadow-lg shadow-black/60 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={toggleFullscreen}
          className="w-8 h-8 rounded-lg bg-gis-panel/90 backdrop-blur border border-gis-border hover:border-gis-accent/50 text-gis-textBright flex items-center justify-center shadow-lg shadow-black/60 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Bottom-Left: Satellite Imagery Telemetry Badge */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
        <div className="px-3 py-1.5 rounded-lg bg-gis-panel/90 backdrop-blur border border-gis-border/90 shadow-xl shadow-black/80 flex items-center gap-3 text-xs font-mono text-gis-textBright">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gis-accent animate-pulse" />
            <span className="font-bold text-gis-accent">
              {selectedSensor === 'Sentinel-2' ? 'Sentinel-2 L2A' : selectedSensor === 'Sentinel-1' ? 'Sentinel-1 C-SAR' : 'Sentinel-1 + 2 Multimodal'}
            </span>
          </div>
          <span className="text-gis-textMuted">•</span>
          <span>{image?.acquisition_date || '08 Sep 2026'}</span>
          <span className="text-gis-textMuted">•</span>
          <span className="text-gis-textMuted">
            Cloud: {image?.metadata?.cloud_cover ?? 0}%
          </span>
          <span className="text-gis-textMuted">•</span>
          <span className="px-1.5 py-0.5 rounded bg-gis-bg border border-gis-border text-[10px] text-gis-accent">
            30UUE
          </span>
        </div>
      </div>

      {/* Bottom-Right: Live Coordinates & Scale Bar */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
        <div className="px-3 py-1.5 rounded-lg bg-gis-panel/90 backdrop-blur border border-gis-border/90 shadow-xl shadow-black/80 flex items-center gap-3 text-xs font-mono text-gis-textBright">
          <div className="flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-gis-accent" />
            <span>{mouseCoords.lat.toFixed(4)}° N</span>
            <span className="text-gis-textMuted">,</span>
            <span>{Math.abs(mouseCoords.lng).toFixed(4)}° W</span>
          </div>
          <span className="text-gis-textMuted">•</span>
          <span className="text-gis-textMuted">Zoom {zoomLevel}</span>
          <span className="text-gis-textMuted">•</span>
          <div className="flex items-center gap-1 text-[11px] text-gis-accent">
            <span className="border-b-2 border-gis-accent w-8 inline-block" />
            <span>200m (10m GSD)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
