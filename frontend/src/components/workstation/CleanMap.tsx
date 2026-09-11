import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ImageRecord, EvidenceRegion, AreaCalculationResult } from '../../types';
import { api } from '../../services/api';
import { Maximize2, Crosshair, Ruler, Trash2, Loader2, Check } from 'lucide-react';

interface CleanMapProps {
  primaryImage?: ImageRecord | null;
  secondaryImage?: ImageRecord | null;
  evidenceRegions?: EvidenceRegion[];
  selectedEvidenceId?: string | null;
  onSelectEvidence?: (id: string) => void;
  className?: string;
}

export const CleanMap: React.FC<CleanMapProps> = ({
  primaryImage,
  secondaryImage,
  evidenceRegions = [],
  selectedEvidenceId,
  onSelectEvidence,
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileRef = useRef<L.TileLayer | null>(null);
  const primaryOverlayRef = useRef<L.ImageOverlay | null>(null);
  const secondaryOverlayRef = useRef<L.ImageOverlay | null>(null);
  const vectorGroupRef = useRef<L.FeatureGroup | null>(null);
  const measureGroupRef = useRef<L.FeatureGroup | null>(null);

  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(13);
  const [basemapType, setBasemapType] = useState<'satellite' | 'streets'>('satellite');
  const [activeViewMode, setActiveViewMode] = useState<'primary' | 'secondary' | 'split'>('primary');

  // Interactive Tools: Pixel Inspector & Area Measurement
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [inspectLoading, setInspectLoading] = useState<boolean>(false);
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]); // [[lon, lat], ...]
  const [measureResult, setMeasureResult] = useState<AreaCalculationResult | null>(null);

  const isInspectingRef = useRef(isInspecting);
  isInspectingRef.current = isInspecting;
  const isMeasuringRef = useRef(isMeasuring);
  isMeasuringRef.current = isMeasuring;
  const measurePointsRef = useRef(measurePoints);
  measurePointsRef.current = measurePoints;
  const primaryImageRef = useRef(primaryImage);
  primaryImageRef.current = primaryImage;

  const onSelectEvidenceRef = useRef(onSelectEvidence);
  onSelectEvidenceRef.current = onSelectEvidence;

  // Initialize Leaflet Map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapInstanceRef.current) return;

    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    const defaultCenter: [number, number] = [53.345, -6.26]; // Dublin coordinates default
    const map = L.map(container, {
      center: defaultCenter,
      zoom: 13,
      zoomControl: false,
      attributionControl: true
    });

    // Default: High-res Esri World Imagery
    const esriTiles = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics',
        maxZoom: 19
      }
    ).addTo(map);
    baseTileRef.current = esriTiles;

    vectorGroupRef.current = L.featureGroup().addTo(map);
    measureGroupRef.current = L.featureGroup().addTo(map);

    // Zoom controls top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setMouseCoords({
        lat: Number(e.latlng.lat.toFixed(5)),
        lng: Number(e.latlng.lng.toFixed(5))
      });
    });

    map.on('zoomend', () => {
      setZoomLevel(map.getZoom());
    });

    // Handle Map Clicks for Pixel Inspector and Area Measurement
    map.on('click', async (e: L.LeafletMouseEvent) => {
      // 1. Pixel Inspector Click
      if (isInspectingRef.current) {
        const targetId = primaryImageRef.current?.id || 'img-dublin-s2-2026';
        setInspectLoading(true);
        try {
          const res = await api.inspectPixel(targetId, e.latlng.lat, e.latlng.lng);
          const popupContent = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; min-width: 220px; color: #17201B; padding: 2px;">
              <div style="font-weight: 700; color: #167A4A; font-size: 12px; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
                <span>${res.land_cover_prediction}</span>
                <span style="background: #EAF7F0; color: #167A4A; padding: 2px 6px; border-radius: 4px; font-size: 10px;">${res.confidence}%</span>
              </div>
              <div style="background: #F8FAF9; border: 1px solid #E3EAE5; border-radius: 6px; padding: 6px; margin-bottom: 6px; line-height: 1.5;">
                <div>NDVI: <b>${res.indices.NDVI.toFixed(3)}</b> &bull; NDWI: <b>${res.indices.NDWI.toFixed(3)}</b></div>
                <div>NDBI: <b>${res.indices.NDBI.toFixed(3)}</b> &bull; Elev: <b>${res.elevation_m.toFixed(0)}m</b></div>
              </div>
              <div style="font-size: 10px; color: #66736B; font-family: monospace;">
                Lat: ${e.latlng.lat.toFixed(5)}° &bull; Lon: ${e.latlng.lng.toFixed(5)}°
              </div>
            </div>
          `;
          L.popup({ closeButton: true, autoClose: true })
            .setLatLng(e.latlng)
            .setContent(popupContent)
            .openOn(map);
        } catch (err) {
          console.error('Pixel inspection failed:', err);
        } finally {
          setInspectLoading(false);
        }
        return;
      }

      // 2. Measure Area Click
      if (isMeasuringRef.current) {
        const newCoord: [number, number] = [
          Number(e.latlng.lng.toFixed(6)),
          Number(e.latlng.lat.toFixed(6))
        ];
        const updated = [...measurePointsRef.current, newCoord];
        setMeasurePoints(updated);

        // Update polygon on map
        if (measureGroupRef.current) {
          measureGroupRef.current.clearLayers();
          const latlngs: [number, number][] = updated.map((c) => [c[1], c[0]]);

          // Render marker at each point
          latlngs.forEach((pt) => {
            L.circleMarker(pt, {
              radius: 4,
              color: '#167A4A',
              fillColor: '#FFFFFF',
              fillOpacity: 1,
              weight: 2
            }).addTo(measureGroupRef.current!);
          });

          if (latlngs.length >= 2) {
            L.polyline(latlngs, {
              color: '#167A4A',
              weight: 2,
              dashArray: '4, 4'
            }).addTo(measureGroupRef.current);
          }

          if (latlngs.length >= 3) {
            L.polygon(latlngs, {
              color: '#167A4A',
              fillColor: '#167A4A',
              fillOpacity: 0.2,
              weight: 2
            }).addTo(measureGroupRef.current);

            // Calculate geodesic area via backend API
            api.calculateArea(updated)
              .then((res) => setMeasureResult(res))
              .catch(console.error);
          }
        }
      }
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Toggle Basemap (Satellite vs Clean Light Streets)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseTileRef.current) {
      map.removeLayer(baseTileRef.current);
    }

    if (basemapType === 'satellite') {
      baseTileRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Tiles &copy; Esri, Maxar', maxZoom: 19 }
      ).addTo(map);
    } else {
      baseTileRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        { attribution: '&copy; OpenStreetMap, &copy; CARTO', maxZoom: 19 }
      ).addTo(map);
    }
  }, [basemapType]);

  // Cursor style update when measuring or inspecting
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const container = map.getContainer();
    if (isInspecting) {
      container.style.cursor = 'crosshair';
    } else if (isMeasuring) {
      container.style.cursor = 'cell';
    } else {
      container.style.cursor = '';
    }
  }, [isInspecting, isMeasuring]);

  // Clear measurement tool
  const handleClearMeasurement = () => {
    setMeasurePoints([]);
    setMeasureResult(null);
    if (measureGroupRef.current) {
      measureGroupRef.current.clearLayers();
    }
  };

  // Synchronize Primary Image Overlay Bounds
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !primaryImage) return;

    if (primaryOverlayRef.current) {
      map.removeLayer(primaryOverlayRef.current);
      primaryOverlayRef.current = null;
    }

    if (primaryImage.metadata?.bounds) {
      const [minLat, minLon, maxLat, maxLon] = primaryImage.metadata.bounds;
      const bounds: L.LatLngBoundsExpression = [[minLat, minLon], [maxLat, maxLon]];

      if (primaryImage.preview_url && activeViewMode !== 'secondary') {
        const overlay = L.imageOverlay(primaryImage.preview_url, bounds, {
          opacity: 0.88,
          interactive: false
        }).addTo(map);
        primaryOverlayRef.current = overlay;
      }

      map.fitBounds(bounds, { padding: [25, 25], maxZoom: 15 });
    }
  }, [primaryImage, activeViewMode]);

  // Synchronize Secondary Image Overlay
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (secondaryOverlayRef.current) {
      map.removeLayer(secondaryOverlayRef.current);
      secondaryOverlayRef.current = null;
    }

    if (secondaryImage && secondaryImage.preview_url && activeViewMode === 'secondary') {
      const boundsArr = secondaryImage.metadata?.bounds || primaryImage?.metadata?.bounds;
      if (boundsArr) {
        const [minLat, minLon, maxLat, maxLon] = boundsArr;
        const bounds: L.LatLngBoundsExpression = [[minLat, minLon], [maxLat, maxLon]];
        const overlay = L.imageOverlay(secondaryImage.preview_url, bounds, {
          opacity: 0.88,
          interactive: false
        }).addTo(map);
        secondaryOverlayRef.current = overlay;
        map.fitBounds(bounds, { padding: [25, 25], maxZoom: 15 });
      }
    }
  }, [secondaryImage, activeViewMode, primaryImage]);

  // Render Vector Evidence Regions
  useEffect(() => {
    const vg = vectorGroupRef.current;
    if (!vg) return;

    vg.clearLayers();

    if (!evidenceRegions || evidenceRegions.length === 0) return;

    evidenceRegions.forEach((ev) => {
      if (!ev.coordinates || ev.coordinates.length < 3) return;

      const isSelected = selectedEvidenceId === ev.id;
      const latlngs: [number, number][] = ev.coordinates.map((coord) => [coord[1], coord[0]]);

      let strokeColor = '#167A4A'; // default green
      let fillColor = '#167A4A';
      const labelLower = ev.label.toLowerCase();
      if (labelLower.includes('water') || labelLower.includes('flood') || ev.type.toLowerCase().includes('water')) {
        strokeColor = '#0284C7';
        fillColor = '#0284C7';
      } else if (labelLower.includes('built') || labelLower.includes('urban') || labelLower.includes('building')) {
        strokeColor = '#DC2626';
        fillColor = '#DC2626';
      } else if (labelLower.includes('vegetation') || labelLower.includes('crop') || labelLower.includes('tree')) {
        strokeColor = '#059669';
        fillColor = '#059669';
      }

      const poly = L.polygon(latlngs, {
        color: isSelected ? '#F59E0B' : strokeColor,
        weight: isSelected ? 3.5 : 2,
        fillColor: fillColor,
        fillOpacity: isSelected ? 0.45 : 0.25,
        dashArray: isSelected ? undefined : '3, 3'
      });

      poly.bindTooltip(
        `<div style="font-family: sans-serif; font-size: 11px;"><b>${ev.label}</b> (${ev.confidence.toFixed(1)}%)<br/>${ev.area_hectares.toFixed(1)} ha &bull; ${ev.area_sqkm.toFixed(2)} km²</div>`,
        { sticky: true, className: 'leaflet-custom-tooltip' }
      );

      poly.on('click', () => {
        if (onSelectEvidenceRef.current) {
          onSelectEvidenceRef.current(ev.id);
        }
      });

      vg.addLayer(poly);
    });
  }, [evidenceRegions, selectedEvidenceId]);

  // Zoom to evidence when selected from external panel
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedEvidenceId || evidenceRegions.length === 0) return;

    const target = evidenceRegions.find((r) => r.id === selectedEvidenceId);
    if (target && target.coordinates.length > 0) {
      const latlngs: [number, number][] = target.coordinates.map((c) => [c[1], c[0]]);
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [selectedEvidenceId, evidenceRegions]);

  const handleResetBounds = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (primaryImage?.metadata?.bounds) {
      const [minLat, minLon, maxLat, maxLon] = primaryImage.metadata.bounds;
      map.fitBounds([[minLat, minLon], [maxLat, maxLon]], { padding: [30, 30] });
    }
  };

  return (
    <div className={`relative w-full h-full bg-slate-100 overflow-hidden ${className}`}>
      {/* Leaflet container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left: Basemap Switcher, Measurement, Pixel Inspector & Reset */}
      <div className="absolute top-3 left-3 z-10 flex items-center flex-wrap gap-2">
        {/* Basemap Switcher */}
        <div className="bg-white/95 backdrop-blur-xs border border-[#E3EAE5] rounded-lg shadow-xs p-1 flex items-center gap-1">
          <button
            onClick={() => setBasemapType('satellite')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              basemapType === 'satellite'
                ? 'bg-[#167A4A] text-white shadow-2xs'
                : 'text-[#66736B] hover:text-[#17201B] hover:bg-[#FBFDFB]'
            }`}
            type="button"
          >
            Satellite
          </button>
          <button
            onClick={() => setBasemapType('streets')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              basemapType === 'streets'
                ? 'bg-[#167A4A] text-white shadow-2xs'
                : 'text-[#66736B] hover:text-[#17201B] hover:bg-[#FBFDFB]'
            }`}
            type="button"
          >
            Streets
          </button>
        </div>

        {/* Pixel Inspector Toggle */}
        <button
          onClick={() => {
            setIsInspecting((prev) => !prev);
            if (!isInspecting) {
              setIsMeasuring(false);
              handleClearMeasurement();
            }
          }}
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
            isInspecting
              ? 'bg-[#167A4A] text-white border-[#167A4A]'
              : 'bg-white/95 border-[#E3EAE5] text-[#17201B] hover:border-[#167A4A]'
          }`}
          title="Click any coordinate to inspect multi-band spectral reflectance and NDVI"
          type="button"
        >
          {inspectLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Crosshair className="w-3.5 h-3.5" />
          )}
          <span>Inspect Pixel</span>
        </button>

        {/* Measure Area Tool Toggle */}
        <button
          onClick={() => {
            setIsMeasuring((prev) => !prev);
            if (!isMeasuring) {
              setIsInspecting(false);
            } else {
              handleClearMeasurement();
            }
          }}
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
            isMeasuring
              ? 'bg-[#167A4A] text-white border-[#167A4A]'
              : 'bg-white/95 border-[#E3EAE5] text-[#17201B] hover:border-[#167A4A]'
          }`}
          title="Click 3+ points on the map to calculate geodesic polygon area"
          type="button"
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>Measure Area</span>
        </button>

        {/* Secondary Comparison Toggle if secondary image is present */}
        {secondaryImage && (
          <div className="bg-white/95 backdrop-blur-xs border border-[#E3EAE5] rounded-lg shadow-xs p-1 flex items-center gap-1">
            <button
              onClick={() => setActiveViewMode('primary')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeViewMode === 'primary'
                  ? 'bg-[#167A4A] text-white shadow-2xs'
                  : 'text-[#66736B] hover:bg-[#FBFDFB]'
              }`}
              type="button"
            >
              T1 ({primaryImage?.acquisition_date || 'Primary'})
            </button>
            <button
              onClick={() => setActiveViewMode('secondary')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeViewMode === 'secondary'
                  ? 'bg-[#167A4A] text-white shadow-2xs'
                  : 'text-[#66736B] hover:bg-[#FBFDFB]'
              }`}
              type="button"
            >
              T2 ({secondaryImage.acquisition_date || 'Secondary'})
            </button>
          </div>
        )}

        <button
          onClick={handleResetBounds}
          className="bg-white/95 backdrop-blur-xs border border-[#E3EAE5] hover:bg-white text-[#17201B] p-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
          title="Reset bounds to satellite scene"
          type="button"
        >
          <Maximize2 className="w-4 h-4 text-[#66736B] hover:text-[#167A4A]" />
        </button>
      </div>

      {/* Top Right: Satellite Metadata Badge */}
      {primaryImage && (
        <div className="absolute top-3 right-14 z-10 hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-xs border border-[#E3EAE5] rounded-lg px-3 py-1.5 shadow-xs text-xs">
          <span className="font-semibold text-[#17201B]">{primaryImage.sensor}</span>
          <span className="text-[#E3EAE5]">|</span>
          <span className="text-[#66736B] font-mono text-[11px]">{primaryImage.modality}</span>
          {primaryImage.acquisition_date && (
            <>
              <span className="text-[#E3EAE5]">|</span>
              <span className="text-[#66736B] text-[11px]">{primaryImage.acquisition_date}</span>
            </>
          )}
        </div>
      )}

      {/* Area Measurement Result Card (Floating Top-Center) */}
      {isMeasuring && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-md border border-[#167A4A]/30 rounded-xl shadow-lg px-4 py-2 flex items-center gap-4 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-[#167A4A]" />
            <span className="font-bold text-[#17201B]">
              {measurePoints.length < 3
                ? `Click on map to draw polygon (${measurePoints.length}/3 points)`
                : 'Polygon Geodesic Calculation'}
            </span>
          </div>

          {measureResult && (
            <div className="flex items-center gap-3 border-l border-[#E3EAE5] pl-3 font-mono text-[11px]">
              <div>
                Area: <b className="text-[#167A4A]">{measureResult.area_hectares.toFixed(2)} ha</b> ({measureResult.area_sqkm.toFixed(3)} km²)
              </div>
              <span className="text-[#E3EAE5]">|</span>
              <div>
                Perimeter: <b>{measureResult.perimeter_km.toFixed(2)} km</b>
              </div>
            </div>
          )}

          {measurePoints.length > 0 && (
            <button
              onClick={handleClearMeasurement}
              className="p-1 text-[#66736B] hover:text-red-600 rounded transition-colors cursor-pointer"
              title="Clear measurement polygon"
              type="button"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Bottom Left: Coordinates & Zoom Pill */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-xs border border-[#E3EAE5] rounded-lg px-2.5 py-1 shadow-xs flex items-center gap-3 text-[11px] font-mono text-[#66736B]">
        {mouseCoords ? (
          <div>
            Lat: <span className="text-[#17201B] font-semibold">{mouseCoords.lat.toFixed(4)}°</span>{' '}
            Lon: <span className="text-[#17201B] font-semibold">{mouseCoords.lng.toFixed(4)}°</span>
          </div>
        ) : (
          <span>Hover map for coordinates</span>
        )}
        <span className="text-[#E3EAE5]">|</span>
        <span>Zoom {zoomLevel}x</span>
      </div>

      {/* Bottom Right: Evidence Summary Tag if regions present */}
      {evidenceRegions.length > 0 && (
        <div className="absolute bottom-3 right-3 z-10 bg-white/95 backdrop-blur-xs border border-[#167A4A]/30 rounded-lg px-3 py-1 shadow-xs flex items-center gap-2 text-xs font-semibold text-[#167A4A]">
          <span className="w-2 h-2 rounded-full bg-[#167A4A] animate-pulse" />
          <span>{evidenceRegions.length} Evidence Region{evidenceRegions.length > 1 ? 's' : ''} Grounded</span>
        </div>
      )}
    </div>
  );
};
