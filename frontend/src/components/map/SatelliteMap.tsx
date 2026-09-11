import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ImageRecord, EvidenceRegion } from '../../types';
import { RotateCcw, Crosshair, PenTool } from 'lucide-react';
import { api } from '../../services/api';

interface SatelliteMapProps {
  image?: ImageRecord | null;
  evidenceRegions?: EvidenceRegion[];
  selectedEvidenceId?: string | null;
  onSelectEvidence?: (id: string) => void;
  activeLayers?: {
    satellite: boolean;
    evidence: boolean;
    changeHeatmap: boolean;
    landCover: boolean;
  };
  measurementActive?: boolean;
  onMeasurementComplete?: (result: any) => void;
}

export const SatelliteMap: React.FC<SatelliteMapProps> = ({
  image,
  evidenceRegions = [],
  selectedEvidenceId,
  onSelectEvidence,
  activeLayers = { satellite: true, evidence: true, changeHeatmap: true, landCover: true },
  measurementActive = false,
  onMeasurementComplete
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileRef = useRef<L.TileLayer | null>(null);
  const imageOverlayRef = useRef<L.ImageOverlay | null>(null);
  const vectorGroupRef = useRef<L.FeatureGroup | null>(null);
  const drawGroupRef = useRef<L.FeatureGroup | null>(null);

  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(13);
  const [activeBasemap, setActiveBasemap] = useState<'esri' | 'cartoDark'>('esri');
  const [drawPoints, setDrawPoints] = useState<[number, number][]>([]);

  // Stable refs for callbacks to prevent infinite re-renders
  const onSelectEvidenceRef = useRef(onSelectEvidence);
  onSelectEvidenceRef.current = onSelectEvidence;

  const onMeasurementCompleteRef = useRef(onMeasurementComplete);
  onMeasurementCompleteRef.current = onMeasurementComplete;

  const drawPointsRef = useRef<[number, number][]>([]);
  drawPointsRef.current = drawPoints;

  // Initialize Leaflet Map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapInstanceRef.current) return;

    // Clean up any residual leaflet id from previous mounts/StrictMode
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    const defaultCenter: [number, number] = [12.95, 77.62]; // Bengaluru default
    const map = L.map(container, {
      center: defaultCenter,
      zoom: 13,
      zoomControl: false,
      attributionControl: true
    });

    // Add Esri Satellite base tiles
    const esriTiles = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics',
        maxZoom: 19
      }
    ).addTo(map);
    baseTileRef.current = esriTiles;

    // Feature groups
    vectorGroupRef.current = L.featureGroup().addTo(map);
    drawGroupRef.current = L.featureGroup().addTo(map);

    // Zoom controls at top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Track coordinates on mouse move
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setMouseCoords({
        lat: Number(e.latlng.lat.toFixed(5)),
        lng: Number(e.latlng.lng.toFixed(5))
      });
    });

    map.on('zoomend', () => {
      setZoomLevel(map.getZoom());
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Basemap Provider
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseTileRef.current) {
      map.removeLayer(baseTileRef.current);
    }

    if (activeBasemap === 'esri') {
      baseTileRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Tiles &copy; Esri, Maxar', maxZoom: 19 }
      ).addTo(map);
    } else {
      baseTileRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { attribution: '&copy; CartoDB Dark Matter', maxZoom: 19 }
      ).addTo(map);
    }
  }, [activeBasemap]);

  // Update Satellite Image Overlay and Map Bounds
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (imageOverlayRef.current) {
      map.removeLayer(imageOverlayRef.current);
      imageOverlayRef.current = null;
    }

    if (image && image.metadata && image.metadata.bounds) {
      const [minLat, minLon, maxLat, maxLon] = image.metadata.bounds;
      const bounds: L.LatLngBoundsExpression = [[minLat, minLon], [maxLat, maxLon]];

      if (image.preview_url) {
        imageOverlayRef.current = L.imageOverlay(image.preview_url, bounds, {
          opacity: 0.85,
          interactive: false
        }).addTo(map);
      }

      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
    }
  }, [image]);

  // Render AI Evidence Vector Regions
  useEffect(() => {
    const vg = vectorGroupRef.current;
    if (!vg) return;

    vg.clearLayers();
    if (!activeLayers.evidence) return;

    evidenceRegions.forEach((ev) => {
      const isSelected = selectedEvidenceId === ev.id;
      const latlngs: [number, number][] = ev.coordinates.map((c) => [c[1], c[0]]);

      const poly = L.polygon(latlngs, {
        color: isSelected ? '#38BDF8' : '#0EA5E9',
        weight: isSelected ? 3 : 2,
        fillColor: isSelected ? '#06B6D4' : '#0EA5E9',
        fillOpacity: isSelected ? 0.45 : 0.25,
        dashArray: isSelected ? undefined : '4, 4'
      });

      poly.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
          <div style="font-weight: 700; color: #38BDF8; margin-bottom: 2px;">${ev.label}</div>
          <div style="color: #94A3B8; font-size: 11px;">Class: <b style="color: #F8FAFC;">${ev.type}</b></div>
          <div style="color: #94A3B8; font-size: 11px;">Area: <b style="color: #F8FAFC;">${ev.area_hectares} ha</b> (${ev.area_sqkm} km²)</div>
          <div style="color: #94A3B8; font-size: 11px;">Confidence: <b style="color: #10B981;">${ev.confidence}%</b></div>
        </div>
      `);

      poly.on('click', () => {
        if (onSelectEvidenceRef.current) {
          onSelectEvidenceRef.current(ev.id);
        }
      });

      vg.addLayer(poly);
    });
  }, [evidenceRegions, selectedEvidenceId, activeLayers.evidence]);

  // Handle Polygon Drawing & Measurement
  useEffect(() => {
    const map = mapInstanceRef.current;
    const dg = drawGroupRef.current;
    if (!map || !dg) return;

    if (!measurementActive) {
      dg.clearLayers();
      if (drawPointsRef.current.length > 0) {
        setDrawPoints([]);
      }
      map.off('click');
      return;
    }

    const handleMapClick = async (e: L.LeafletMouseEvent) => {
      const newPt: [number, number] = [e.latlng.lng, e.latlng.lat];
      const updatedPts = [...drawPointsRef.current, newPt];
      drawPointsRef.current = updatedPts;
      setDrawPoints(updatedPts);

      // Redraw polygon
      dg.clearLayers();
      if (updatedPts.length >= 2) {
        const latlngs: [number, number][] = updatedPts.map((p) => [p[1], p[0]]);
        L.polygon(latlngs, {
          color: '#F59E0B',
          weight: 2,
          fillColor: '#F59E0B',
          fillOpacity: 0.2
        }).addTo(dg);
      }

      if (updatedPts.length >= 3) {
        try {
          const res = await api.calculateArea(updatedPts);
          if (onMeasurementCompleteRef.current) {
            onMeasurementCompleteRef.current(res);
          }
        } catch (err) {
          console.error('Area calculation error', err);
        }
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [measurementActive]);

  // Focus on Selected Evidence Region
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedEvidenceId) return;

    const targetEv = evidenceRegions.find((e) => e.id === selectedEvidenceId);
    if (targetEv && targetEv.coordinates.length > 0) {
      const latlngs: [number, number][] = targetEv.coordinates.map((c) => [c[1], c[0]]);
      const bounds = L.latLngBounds(latlngs);
      map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 16, duration: 1.2 });
    }
  }, [selectedEvidenceId, evidenceRegions]);

  const resetView = () => {
    if (mapInstanceRef.current && image?.metadata?.bounds) {
      const [minLat, minLon, maxLat, maxLon] = image.metadata.bounds;
      mapInstanceRef.current.fitBounds([[minLat, minLon], [maxLat, maxLon]], { padding: [30, 30] });
    }
  };

  return (
    <div className="relative w-full h-full bg-gis-bg overflow-hidden select-none">
      {/* Map Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left Floating Map Controls */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {/* Basemap Toggle */}
        <div className="bg-gis-panel/90 backdrop-blur-sm border border-gis-border rounded-md shadow-gis p-1 flex items-center gap-1">
          <button
            onClick={() => setActiveBasemap('esri')}
            className={`px-2 py-1 text-[11px] font-medium rounded transition ${
              activeBasemap === 'esri' ? 'bg-gis-accent text-white font-semibold' : 'text-gis-textMuted hover:text-gis-textBright'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setActiveBasemap('cartoDark')}
            className={`px-2 py-1 text-[11px] font-medium rounded transition ${
              activeBasemap === 'cartoDark' ? 'bg-gis-accent text-white font-semibold' : 'text-gis-textMuted hover:text-gis-textBright'
            }`}
          >
            Dark GIS
          </button>
        </div>

        {/* Reset Bounds */}
        <button
          onClick={resetView}
          className="p-2 bg-gis-panel/90 backdrop-blur-sm border border-gis-border text-gis-textMuted hover:text-gis-accent rounded-md shadow-gis transition"
          title="Reset Map Bounds to Scene"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Measurement Active Notification */}
      {measurementActive && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-gis-warning/20 border border-gis-warning/50 text-gis-warning px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 backdrop-blur-md shadow-gis animate-pulse">
          <PenTool className="w-3.5 h-3.5" />
          <span>Click on map to draw polygon boundary ({drawPoints.length} points)</span>
        </div>
      )}

      {/* Bottom Coordinate & Telemetry Bar */}
      <div className="absolute bottom-2 left-3 z-10 bg-gis-panel/90 backdrop-blur-sm border border-gis-border rounded px-2.5 py-1 text-[11px] font-mono text-gis-textMuted flex items-center gap-3 shadow-gis">
        <div className="flex items-center gap-1 text-gis-textBright">
          <Crosshair className="w-3 h-3 text-gis-accent" />
          <span>{mouseCoords ? `${mouseCoords.lat}° N, ${mouseCoords.lng}° E` : 'Hover map...'}</span>
        </div>
        <span className="text-gis-border">|</span>
        <span>Zoom: {zoomLevel}</span>
        <span className="text-gis-border">|</span>
        <span>CRS: {image?.metadata?.crs || 'EPSG:4326'}</span>
      </div>
    </div>
  );
};
