export interface ImageMetadata {
  width: number;
  height: number;
  bands: number;
  crs: string;
  resolution_m: number;
  bounds: [number, number, number, number]; // [min_lat, min_lon, max_lat, max_lon]
  cloud_cover: number;
  mean_brightness: number;
  contrast_score: number;
  is_georeferenced: boolean;
}

export interface ImageRecord {
  id: string;
  project_id?: number;
  filename: string;
  original_filename: string;
  preview_url?: string;
  file_size: number;
  file_format: string;
  modality: string;
  sensor: string;
  acquisition_date?: string;
  is_demo: boolean;
  metadata?: ImageMetadata;
}

export interface QualityCheckItem {
  id: string;
  name: string;
  status: 'pass' | 'warning' | 'fail';
  details: string;
}

export interface QualityCheckResult {
  overall_score: number;
  reliability: 'High' | 'Medium' | 'Low';
  checks: QualityCheckItem[];
  warnings: string[];
  is_acceptable: boolean;
}

export interface EvidenceRegion {
  id: string;
  label: string;
  type: string;
  coordinates: [number, number][]; // [[lon, lat], ...]
  area_sqkm: number;
  area_hectares: number;
  confidence: number;
  description?: string;
  attributes?: Record<string, any>;
}

export interface TimelineStep {
  step: string;
  status: string;
  details: string;
  timestamp_ms: number;
}

export interface AnalyzeResponse {
  session_id: string;
  image_id?: string;
  query: string;
  task_type: string;
  model_name: string;
  model_version: string;
  answer: string;
  answer_en: string;
  answer_hi?: string;
  answer_kn?: string;
  localized_answers?: Record<string, string>;
  confidence_score: number;
  reliability_score: string;
  reliability_reason: string;
  evidence_regions: EvidenceRegion[];
  metrics: Record<string, any>;
  timeline: TimelineStep[];
  execution_time_ms: number;
  data_used?: {
    satellite: string;
    product: string;
    tile: string;
    acquisition_dates: string[];
    bands_used: string[];
    resolution: string;
    cloud_cover: string;
  };
  method?: string;
  why_result?: string;
  detected_area?: {
    sqkm: number;
    hectares: number;
    sqm: number;
    regions_count: number;
  };
  evidence_summary?: string;
}

export interface PixelInspectionResult {
  latitude: number;
  longitude: number;
  image_id: string;
  sensor: string;
  modality: string;
  acquisition_date: string;
  pixel_x: number;
  pixel_y: number;
  elevation_m: number;
  bands: {
    B02: number;
    B03: number;
    B04: number;
    B08: number;
    B11: number;
    B12: number;
  };
  indices: {
    NDVI: number;
    NDWI: number;
    NDBI: number;
    NBR: number;
  };
  sar?: {
    vv_db: number;
    vh_db: number;
    vv_vh_ratio: number;
    polarization: string;
    orbit_direction: string;
  };
  land_cover_prediction: string;
  confidence: number;
}

export interface SceneCard {
  id: string;
  satellite: string; // 'Sentinel-2' | 'Sentinel-1'
  product: string; // 'L2A' | 'GRD'
  tile: string; // '30UUE'
  date: string; // '08 Sep 2026'
  cloud_cover: number;
  resolution: string;
  modality: string;
  orbit?: string;
  polarization?: string;
  lat: number;
  lon: number;
  thumbnail_url: string;
  bands: string[];
}

export interface TimeSeriesDataPoint {
  year: string;
  ndvi: number;
  water_area_ha: number;
  built_up_km2: number;
  vegetation_loss_pct: number;
}

export interface TimeSeriesData {
  location: string;
  tile: string;
  coordinates: [number, number];
  data_points: TimeSeriesDataPoint[];
  trend_summary: string;
}


export interface Project {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  image_count: number;
}

export interface AreaCalculationResult {
  area_sqm: number;
  area_sqkm: number;
  area_hectares: number;
  area_acres: number;
  perimeter_m: number;
  perimeter_km: number;
  vertex_count: number;
}

export interface ReportItem {
  report_id: string;
  title: string;
  download_url: string;
  file_size: number;
  created_at: string;
  summary_text?: string;
}

export interface ModelItem {
  id: string;
  name: string;
  version: string;
  description: string;
  supported_tasks: string[];
  supported_modalities: string[];
  output_type: string;
  base_confidence: number;
  status: string;
  execution_type: string;
}

export interface HistorySession {
  id: string;
  title: string;
  analysis_type: string;
  image_id: string;
  query_count: number;
  latest_confidence: number;
  latest_reliability: string;
  created_at: string;
  updated_at: string;
}

export interface SessionConversationItem {
  query_id: number;
  query_text: string;
  language: string;
  answer_text: string;
  task_type: string;
  confidence_score: number;
  reliability_score: string;
  evidence_regions: EvidenceRegion[];
  created_at: string;
}

export interface SessionDetail {
  session_id: string;
  title: string;
  image_id: string;
  secondary_image_id?: string | null;
  conversations: SessionConversationItem[];
}
