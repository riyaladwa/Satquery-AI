import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { api } from '../services/api';
import { ImageRecord, EvidenceRegion, AnalyzeResponse, PixelInspectionResult, SceneCard } from '../types';
import { SimpleNavBar } from '../components/navigation/SimpleNavBar';
import { ContextualToolRail } from '../components/workstation/ContextualToolRail';
import { DrawerType } from '../components/workstation/WorkstationLeftBar';
import { WorkstationMap } from '../components/workstation/WorkstationMap';
import { AiCopilotPanel } from '../components/workstation/AiCopilotPanel';
import { SceneSearchDrawer } from '../components/workstation/drawers/SceneSearchDrawer';
import { SpectralDrawer } from '../components/workstation/drawers/SpectralDrawer';
import { PixelInspectorDrawer } from '../components/workstation/drawers/PixelInspectorDrawer';
import { CompareDrawer } from '../components/workstation/drawers/CompareDrawer';
import { AoiDrawer } from '../components/workstation/drawers/AoiDrawer';
import { LayerManagerDrawer, LayerState } from '../components/workstation/drawers/LayerManagerDrawer';
import { MeasureDrawer } from '../components/workstation/drawers/MeasureDrawer';
import { TimeSeriesDrawer } from '../components/workstation/drawers/TimeSeriesDrawer';
import { UploadDrawer } from '../components/workstation/drawers/UploadDrawer';
import { HistoryDrawer } from '../components/workstation/drawers/HistoryDrawer';
import { LandCoverDrawer } from '../components/workstation/drawers/LandCoverDrawer';
import { DetectObjectsDrawer } from '../components/workstation/drawers/DetectObjectsDrawer';
import { DisasterModeDrawer } from '../components/workstation/drawers/DisasterModeDrawer';
import { AgriModeDrawer } from '../components/workstation/drawers/AgriModeDrawer';
import { UrbanModeDrawer } from '../components/workstation/drawers/UrbanModeDrawer';
import { ReportModal } from '../components/workstation/ReportModal';
import { useAuth } from '../context/AuthContext';

export const Workstation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { trackCapability } = useAuth();

  // Core state
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageRecord | null>(null);
  const [secondaryImage, setSecondaryImage] = useState<ImageRecord | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<'Sentinel-2' | 'Sentinel-1' | 'Multimodal'>('Sentinel-2');
  const [selectedDate, setSelectedDate] = useState<string>('08 Sep 2026');
  const [cloudCover, setCloudCover] = useState<number>(0);
  const [tileId, setTileId] = useState<string>('30UUE');

  // Drawers and layout
  const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null);
  const [aiPanelCollapsed, setAiPanelCollapsed] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Spectral & Compare modes
  const [activeBandCombination, setActiveBandCombination] = useState<string>('natural_color');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [compareMode, setCompareMode] = useState<'slider' | 'split' | 'overlay'>('slider');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.6);

  // AOI & Measurement
  const [activeDrawMode, setActiveDrawMode] = useState<'none' | 'rectangle' | 'polygon' | 'circle'>('none');
  const [aoiAreaHectares, setAoiAreaHectares] = useState<number | null>(null);
  const [externalAoiGeojson, setExternalAoiGeojson] = useState<any>(null);
  const [activeMeasurement, setActiveMeasurement] = useState<boolean>(false);
  const [measuredResult, setMeasuredResult] = useState<any>(null);

  // Pixel Inspector
  const [pixelData, setPixelData] = useState<PixelInspectionResult | null>(null);
  const [pixelLoading, setPixelLoading] = useState<boolean>(false);

  // AI Copilot state
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [currentResponse, setCurrentResponse] = useState<AnalyzeResponse | null>(null);
  const [conversationHistory, setConversationHistory] = useState<{ query: string; response: AnalyzeResponse }[]>([]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);

  // Layers state
  const [layers, setLayers] = useState<LayerState[]>([
    { id: 'base', name: 'Esri World Satellite Base', category: 'base', visible: true, opacity: 1.0 },
    { id: 'sentinel', name: 'Sentinel Imagery Raster', category: 'imagery', visible: true, opacity: 0.9 },
    { id: 'roads', name: 'Roads & Infrastructure', category: 'vector', visible: true, opacity: 0.8 },
    { id: 'labels', name: 'Carto Geographic Labels', category: 'vector', visible: true, opacity: 0.85 },
    { id: 'aoi', name: 'AOI Selection Polygon', category: 'vector', visible: true, opacity: 0.7 },
    { id: 'ai_detection', name: 'AI Target Evidence Mask', category: 'analysis', visible: true, opacity: 0.8 },
    { id: 'change_heatmap', name: 'Bi-Temporal Change Heatmap', category: 'analysis', visible: true, opacity: 0.65 }
  ]);

  // Load initial dataset (prefer Dublin demo)
  useEffect(() => {
    loadImagery();
  }, []);

  const loadImagery = async () => {
    try {
      const data = await api.getImages();
      setImages(data);

      // Look for Dublin demo image first
      const dublinS2 = data.find(i => i.id === 'img-dublin-s2-2026');
      const dublinS1 = data.find(i => i.id === 'img-dublin-s1-2026');
      const dublin2023 = data.find(i => i.id === 'img-dublin-s2-2023');

      if (dublinS2) {
        setSelectedImage(dublinS2);
        setCloudCover(dublinS2.metadata?.cloud_cover ?? 0);
        setSelectedDate(dublinS2.acquisition_date || '08 Sep 2026');
        setTileId('30UUE');
        if (dublin2023) setSecondaryImage(dublin2023);

        const initialWorkflow = searchParams.get('workflow');
        if (initialWorkflow) {
          if (initialWorkflow === 'agriculture') setActiveDrawer('agri');
          else if (initialWorkflow === 'disaster') setActiveDrawer('disaster');
          else if (initialWorkflow === 'construction' || initialWorkflow === 'urban') setActiveDrawer('urban');
          else if (initialWorkflow === 'land_cover' || initialWorkflow === 'deforestation') setActiveDrawer('landcover');
          else if (initialWorkflow === 'research') setActiveDrawer('spectral');
        }

        const initialSensor = searchParams.get('sensor');
        if (initialSensor) {
          if (initialSensor.includes('SAR') && !initialSensor.includes('Sentinel-2')) {
            handleSensorSwitch('Sentinel-1');
          } else if (initialSensor.includes('+') || initialSensor.includes('Multimodal')) {
            handleSensorSwitch('Multimodal');
          }
        }

        const initialQuery = searchParams.get('query');
        if (initialQuery) {
          const qLow = initialQuery.toLowerCase();
          const isPair = qLow.includes('change') || qLow.includes('compare') || qLow.includes('between') || qLow.includes('sar') || initialSensor?.includes('Multimodal');
          const sec = isPair ? (qLow.includes('sar') || initialSensor?.includes('Multimodal') ? dublinS1 : dublin2023) : null;
          handleSendQueryWithImage(initialQuery, dublinS2, sec);
        }
      } else if (data.length > 0) {
        setSelectedImage(data[0]);
        setCloudCover(data[0].metadata?.cloud_cover ?? 0);
      }
    } catch (err) {
      console.error('Failed to load initial imagery:', err);
    }
  };

  const handleSendQueryWithImage = async (query: string, img: ImageRecord, secImg?: ImageRecord | null) => {
    setAnalyzing(true);
    try {
      const res = await api.analyze({
        image_id: img.id,
        query,
        secondary_image_id: secImg?.id
      });
      setCurrentResponse(res);
      setLayers(prev => prev.map(l => l.id === 'ai_detection' ? { ...l, visible: true } : l));
      if (res.task_type === 'Change Detection' || query.toLowerCase().includes('compare')) {
        setShowHeatmap(true);
      }
    } catch (err) {
      console.error('AI analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Switch between Sentinel-2, Sentinel-1, and Multimodal
  const handleSensorSwitch = (sensor: 'Sentinel-2' | 'Sentinel-1' | 'Multimodal') => {
    setSelectedSensor(sensor);
    const isMum = selectedImage?.id?.includes('mum') || selectedImage?.filename?.toLowerCase().includes('mumbai');

    if (sensor === 'Sentinel-2') {
      const s2 = isMum
        ? (images.find(i => i.id === 'img-mum-opt') || images.find(i => i.modality === 'Optical'))
        : (images.find(i => i.id === 'img-dublin-s2-2026') || images.find(i => i.modality === 'Optical'));
      if (s2) {
        setSelectedImage(s2);
        setCloudCover(s2.metadata?.cloud_cover ?? 0);
        setActiveBandCombination('natural_color');
      }
    } else if (sensor === 'Sentinel-1') {
      const s1 = isMum
        ? (images.find(i => i.id === 'img-mum-sar') || images.find(i => i.modality === 'SAR'))
        : (images.find(i => i.id === 'img-dublin-s1-2026') || images.find(i => i.modality === 'SAR'));
      if (s1) {
        setSelectedImage(s1);
        setCloudCover(0);
        setActiveBandCombination('sar_vv');
      }
    } else {
      // Multimodal Fusion (Simultaneous S-1 + S-2)
      const s2 = isMum
        ? (images.find(i => i.id === 'img-mum-opt') || images.find(i => i.modality === 'Optical'))
        : (images.find(i => i.id === 'img-dublin-s2-2026') || images.find(i => i.modality === 'Optical'));
      const s1 = isMum
        ? (images.find(i => i.id === 'img-mum-sar') || images.find(i => i.modality === 'SAR'))
        : (images.find(i => i.id === 'img-dublin-s1-2026') || images.find(i => i.modality === 'SAR'));
      if (s2) setSelectedImage(s2);
      if (s1) setSecondaryImage(s1);
      setCloudCover(0);
      setActiveBandCombination('color_infrared');
    }
  };

  // Switch acquisition date
  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    if (dateStr.includes('2023')) {
      const s2023 = images.find(i => i.id === 'img-dublin-s2-2023');
      if (s2023) setSelectedImage(s2023);
    } else if (dateStr.includes('2026')) {
      const s2026 = images.find(i => i.id === 'img-dublin-s2-2026');
      if (s2026) setSelectedImage(s2026);
    }
  };

  // Map click handler -> pixel inspection
  const handleMapClick = useCallback(async (lat: number, lon: number) => {
    if (!selectedImage) return;
    if (!trackCapability('pixel_inspector')) return;

    // Open Pixel Inspector drawer
    setActiveDrawer('pixel');
    setPixelLoading(true);

    try {
      const res = await api.inspectPixel(selectedImage.id, lat, lon);
      setPixelData(res);
    } catch (err) {
      console.error('Pixel inspection failed:', err);
    } finally {
      setPixelLoading(false);
    }
  }, [selectedImage, trackCapability]);

  // Sample Dublin center demo point
  const handleSampleDemoPoint = () => {
    handleMapClick(53.3472, -6.2439);
  };

  // Scene select from SceneSearchDrawer
  const handleSelectScene = (scene: SceneCard, autoAnalyze: boolean = false) => {
    const matched = images.find(i => i.id === scene.id);
    if (matched) {
      setSelectedImage(matched);
      setSelectedSensor(scene.satellite as any);
      setSelectedDate(scene.date);
      setCloudCover(scene.cloud_cover);
      setTileId(scene.tile);
    }

    if (autoAnalyze) {
      setActiveDrawer(null);
      setAiPanelCollapsed(false);
      handleSendQuery('Analyze urban development, water bodies, and vegetation health in this satellite scene.');
    }
  };

  // AI Copilot query submit
  const handleSendQuery = async (query: string) => {
    if (!selectedImage) return;
    if (!trackCapability('ai_query')) return;

    const qLower = query.toLowerCase();
    const isPairQuery = qLower.includes('change') || 
      qLower.includes('compare') || 
      qLower.includes('between') || 
      qLower.includes('differ') || 
      selectedSensor === 'Multimodal' || 
      (qLower.includes('optical') && qLower.includes('sar'));

    setAnalyzing(true);
    try {
      const res = await api.analyze({
        image_id: selectedImage.id,
        query,
        secondary_image_id: isPairQuery ? secondaryImage?.id : undefined
      });

      if (currentResponse) {
        setConversationHistory(prev => [...prev, { query: currentResponse.query, response: currentResponse }]);
      }

      setCurrentResponse(res);

      // Auto-enable AI detection layer
      setLayers(prev => prev.map(l => l.id === 'ai_detection' ? { ...l, visible: true } : l));

      // If query is about change detection, show heatmap
      if (res.task_type === 'Change Detection' || query.toLowerCase().includes('compare')) {
        setShowHeatmap(true);
      }
    } catch (err) {
      console.error('AI analysis failed:', err);
      alert('Analysis request failed. Please check network connection.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Toggle Layer visibility
  const handleToggleLayer = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  // Adjust Layer opacity
  const handleChangeOpacity = (id: string, opacity: number) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, opacity } : l));
  };

  // Global search select
  const handleSearchSelect = (query: string) => {
    if (query.includes('53.34') || query.toLowerCase().includes('dublin') || query.includes('30UUE')) {
      const dublin = images.find(i => i.id === 'img-dublin-s2-2026');
      const dublin2023 = images.find(i => i.id === 'img-dublin-s2-2023');
      if (dublin) {
        setSelectedImage(dublin);
        setTileId('30UUE');
        setSelectedDate('08 Sep 2026');
        if (dublin2023) setSecondaryImage(dublin2023);
      }
    } else if (query.includes('12.95') || query.toLowerCase().includes('bengaluru')) {
      const blr = images.find(i => i.id === 'img-blr-2026');
      const blr2023 = images.find(i => i.id === 'img-blr-2023');
      if (blr) {
        setSelectedImage(blr);
        setTileId('43PGN');
        if (blr2023) setSecondaryImage(blr2023);
      }
    } else if (query.includes('18.9') || query.toLowerCase().includes('mumbai')) {
      const mumOpt = images.find(i => i.id === 'img-mum-opt');
      const mumSar = images.find(i => i.id === 'img-mum-sar');
      if (mumOpt) {
        setSelectedImage(mumOpt);
        setTileId('43KDA');
        setSelectedDate('10 Sep 2026');
        if (mumSar) setSecondaryImage(mumSar);
      }
    }
  };

  const activeWorkflow = searchParams.get('workflow') || 'urban';
  const activeTitle = searchParams.get('title') || (
    activeWorkflow === 'agriculture' ? 'Crop Health & Moisture Assessment' :
    activeWorkflow === 'disaster' ? 'Flood & Inundation Assessment' :
    activeWorkflow === 'environment' ? 'Forest & Land Cover Monitoring' :
    activeWorkflow === 'change' ? 'Bi-Temporal Urban Differencing' :
    'Dublin Urban Growth & Infrastructure'
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-[#080B10] overflow-hidden text-[#F5F7FA] font-sans select-none">
      {/* 1. Global Simple Navigation Bar */}
      <SimpleNavBar />

      {/* 2. Top Analysis Status Rail */}
      <div className="h-10 bg-[#121A22] border-b border-[#283541] px-4 flex items-center justify-between text-xs select-none shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[#9AA6B2] uppercase font-semibold text-[10px]">Analysis:</span>
            <span className="text-[#F5F7FA] font-bold">{activeTitle}</span>
          </div>
          <span className="text-[#283541]">•</span>
          <span className="text-[11px] font-mono text-[#38D9D1] bg-[#38D9D1]/10 px-2 py-0.5 rounded border border-[#38D9D1]/20">
            Tile {tileId} (Dublin)
          </span>
          <span className="text-[#283541]">•</span>
          <span className="text-[11px] font-mono text-[#9AA6B2]">
            Status: <span className="text-[#10B981]">● Analysis ready</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-2.5 py-1 rounded bg-[#17212B] hover:bg-[#1E2B38] border border-[#283541] hover:border-[#38D9D1]/40 text-[#F5F7FA] text-[11px] font-medium transition-colors flex items-center gap-1"
          >
            <FileText className="w-3 h-3 text-[#38D9D1]" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 3. Main Workspace Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Contextual Left GIS Tool Rail (Clean icons, topic-aware) */}
        <ContextualToolRail
          workflow={activeWorkflow}
          activeDrawer={activeDrawer}
          onToggleDrawer={(drawer) => {
            if (drawer === 'reports') {
              setIsReportModalOpen(true);
            } else if (drawer) {
              if (!trackCapability(`drawer_${drawer}`)) return;
              setActiveDrawer(drawer);
            } else {
              setActiveDrawer(null);
            }
          }}
        />

        {/* Dynamic Flyout Drawer (Rendered conditionally when an icon is active) */}
        {activeDrawer === 'search' && (
          <SceneSearchDrawer
            onClose={() => setActiveDrawer(null)}
            onSelectScene={handleSelectScene}
            currentSceneId={selectedImage?.id}
          />
        )}

        {activeDrawer === 'spectral' && (
          <SpectralDrawer
            onClose={() => setActiveDrawer(null)}
            selectedSensor={selectedSensor}
            activeBandCombination={activeBandCombination}
            onSelectCombination={setActiveBandCombination}
          />
        )}

        {activeDrawer === 'pixel' && (
          <PixelInspectorDrawer
            onClose={() => setActiveDrawer(null)}
            data={pixelData}
            loading={pixelLoading}
            onSampleDemoPoint={handleSampleDemoPoint}
          />
        )}

        {activeDrawer === 'compare' && (
          <CompareDrawer
            onClose={() => setActiveDrawer(null)}
            sliderPosition={sliderPosition}
            onSliderChange={setSliderPosition}
            compareMode={compareMode}
            onCompareModeChange={setCompareMode}
            showHeatmap={showHeatmap}
            onToggleHeatmap={setShowHeatmap}
            heatmapOpacity={heatmapOpacity}
            onHeatmapOpacityChange={setHeatmapOpacity}
          />
        )}

        {activeDrawer === 'aoi' && (
          <AoiDrawer
            onClose={() => setActiveDrawer(null)}
            activeDrawMode={activeDrawMode}
            onSelectDrawMode={setActiveDrawMode}
            aoiAreaHectares={aoiAreaHectares}
            onClearAoi={() => {
              setAoiAreaHectares(null);
              setExternalAoiGeojson(null);
            }}
            onAoiFileLoaded={(geojson) => setExternalAoiGeojson(geojson)}
          />
        )}

        {activeDrawer === 'layers' && (
          <LayerManagerDrawer
            onClose={() => setActiveDrawer(null)}
            layers={layers}
            onToggleLayer={handleToggleLayer}
            onChangeOpacity={handleChangeOpacity}
          />
        )}

        {activeDrawer === 'measure' && (
          <MeasureDrawer
            onClose={() => setActiveDrawer(null)}
            activeMeasurement={activeMeasurement}
            onToggleMeasurement={setActiveMeasurement}
            measuredResult={measuredResult}
            onClearMeasurement={() => setMeasuredResult(null)}
          />
        )}

        {activeDrawer === 'timeseries' && (
          <TimeSeriesDrawer
            onClose={() => setActiveDrawer(null)}
            currentYear={selectedDate}
            onSelectYear={handleDateSelect}
            tileId={tileId}
          />
        )}

        {activeDrawer === 'upload' && (
          <UploadDrawer
            onClose={() => setActiveDrawer(null)}
            onImageUploaded={(img) => {
              setImages(prev => [img, ...prev]);
              setSelectedImage(img);
            }}
          />
        )}

        {activeDrawer === 'history' && (
          <HistoryDrawer
            onClose={() => setActiveDrawer(null)}
            onSelectSession={(sess) => {
              if (sess.title) {
                handleSendQuery(sess.title.replace('Analysis: ', ''));
              }
            }}
          />
        )}

        {activeDrawer === 'landcover' && (
          <LandCoverDrawer
            onClose={() => setActiveDrawer(null)}
            onHighlightClass={(clsId) => {
              console.log('Land cover class isolated:', clsId);
            }}
          />
        )}

        {activeDrawer === 'detect' && (
          <DetectObjectsDrawer
            onClose={() => setActiveDrawer(null)}
            onDetectObject={(objType: string) => {
              setActiveDrawer(null);
              handleSendQuery(`Detect and count all ${objType} in this scene using YOLO-OBB with spatial bounding boxes.`);
            }}
          />
        )}

        {activeDrawer === 'disaster' && (
          <DisasterModeDrawer
            onClose={() => setActiveDrawer(null)}
            onActivateDisasterWorkflow={(disasterId: string) => {
              setActiveDrawer(null);
              handleSendQuery(`Perform comprehensive ${disasterId} assessment, calculate inundated/damaged area in hectares, and identify critical infrastructure.`);
            }}
          />
        )}

        {activeDrawer === 'agri' && (
          <AgriModeDrawer
            onClose={() => setActiveDrawer(null)}
            onApplyAgriWorkflow={(workflow: string) => {
              setActiveDrawer(null);
              handleSendQuery(`Analyze crop health, evaluate NDVI/NDRE vegetation vigor, and assess water stress across parcels.`);
            }}
          />
        )}

        {activeDrawer === 'urban' && (
          <UrbanModeDrawer
            onClose={() => setActiveDrawer(null)}
            onHighlightUrbanLayer={(layerId) => {
              console.log('Urban layer selected:', layerId);
            }}
          />
        )}

        {/* Center Main Satellite Map: Occupies 65–75% screen */}
        <main className="flex-1 h-full min-w-0 relative">
          <WorkstationMap
            image={selectedImage}
            secondaryImage={secondaryImage}
            compareMode={compareMode}
            sliderPosition={sliderPosition}
            selectedSensor={selectedSensor}
            evidenceRegions={currentResponse?.evidence_regions || []}
            selectedEvidenceId={selectedEvidenceId}
            onSelectEvidence={setSelectedEvidenceId}
            onMapClick={handleMapClick}
            activeDrawMode={activeDrawMode}
            onDrawComplete={(geojson, ha) => {
              setAoiAreaHectares(ha);
              setActiveDrawMode('none');
            }}
            measurementActive={activeMeasurement}
            onMeasurementComplete={setMeasuredResult}
            showHeatmap={showHeatmap}
            heatmapOpacity={heatmapOpacity}
            activeBandCombination={activeBandCombination}
            externalAoiGeojson={externalAoiGeojson}
          />
        </main>

        {/* Right Collapsible AI Copilot Panel */}
        <AiCopilotPanel
          collapsed={aiPanelCollapsed}
          onToggleCollapse={() => setAiPanelCollapsed(!aiPanelCollapsed)}
          onSendQuery={handleSendQuery}
          analyzing={analyzing}
          currentResponse={currentResponse}
          conversationHistory={conversationHistory}
          onSelectEvidence={setSelectedEvidenceId}
          selectedEvidenceId={selectedEvidenceId}
          onGenerateReport={() => setIsReportModalOpen(true)}
          onCompareImages={() => setActiveDrawer('compare')}
        />
      </div>

      {/* PDF Report Generation Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        response={currentResponse}
        image={selectedImage}
      />
    </div>
  );
};
