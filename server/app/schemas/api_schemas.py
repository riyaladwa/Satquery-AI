from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: str
    image_count: int = 0

class ImageMetadataResponse(BaseModel):
    width: int
    height: int
    bands: int
    crs: str
    resolution_m: float
    bounds: List[float]
    cloud_cover: float
    mean_brightness: float
    contrast_score: float
    is_georeferenced: bool

class ImageResponse(BaseModel):
    id: str
    project_id: Optional[int]
    filename: str
    original_filename: str
    preview_url: Optional[str]
    file_size: int
    file_format: str
    modality: str
    sensor: str
    acquisition_date: Optional[str]
    is_demo: bool
    metadata: Optional[ImageMetadataResponse] = None

class AnalyzeRequest(BaseModel):
    image_id: str
    query: str
    secondary_image_id: Optional[str] = None
    session_id: Optional[str] = None
    language: str = "en"
    source: str = "text"

class EvidenceRegionSchema(BaseModel):
    id: str
    label: str
    type: str
    coordinates: List[List[float]]
    area_sqkm: float
    area_hectares: float
    confidence: float
    description: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = None

class TimelineStepSchema(BaseModel):
    step: str
    status: str
    details: str
    timestamp_ms: int

class AnalyzeResponse(BaseModel):
    session_id: str
    image_id: Optional[str] = None
    query: str
    task_type: str
    model_name: str
    model_version: str
    answer: str
    answer_en: str
    answer_hi: Optional[str] = None
    answer_kn: Optional[str] = None
    localized_answers: Optional[Dict[str, str]] = None
    confidence_score: float
    reliability_score: str
    reliability_reason: str
    evidence_regions: List[EvidenceRegionSchema]
    metrics: Dict[str, Any]
    timeline: List[TimelineStepSchema]
    execution_time_ms: int
    data_used: Optional[Dict[str, Any]] = None
    method: Optional[str] = None
    why_result: Optional[str] = None
    detected_area: Optional[Dict[str, Any]] = None
    evidence_summary: Optional[str] = None

class AreaCalculationRequest(BaseModel):
    coordinates: List[List[float]] # [[lon, lat], ...]

class AreaCalculationResponse(BaseModel):
    area_sqm: float
    area_sqkm: float
    area_hectares: float
    area_acres: float
    perimeter_m: float
    perimeter_km: float
    vertex_count: int

class ReportCreateRequest(BaseModel):
    image_id: str
    query: str
    answer_en: str
    confidence_score: float
    reliability_score: str
    task_type: str
    model_name: str
    evidence_regions: List[Dict[str, Any]]
    secondary_image_id: Optional[str] = None
    project_name: Optional[str] = None

class ReportResponse(BaseModel):
    report_id: str
    title: str
    download_url: str
    file_size: int
    created_at: str
    summary_text: Optional[str] = None

class QualityCheckResponse(BaseModel):
    overall_score: float
    reliability: str
    checks: List[Dict[str, Any]]
    warnings: List[str]
    is_acceptable: bool

class PixelBands(BaseModel):
    B02: float # Blue (0.490 um)
    B03: float # Green (0.560 um)
    B04: float # Red (0.665 um)
    B08: float # NIR (0.842 um)
    B11: float # SWIR-1 (1.610 um)
    B12: float # SWIR-2 (2.190 um)

class PixelIndices(BaseModel):
    NDVI: float # Normalized Difference Veg Index
    NDWI: float # Normalized Difference Water Index
    NDBI: float # Normalized Difference Built-up Index
    NBR: float  # Normalized Burn Ratio

class PixelSar(BaseModel):
    vv_db: float
    vh_db: float
    vv_vh_ratio: float
    polarization: str
    orbit_direction: str

class PixelInspectionResponse(BaseModel):
    latitude: float
    longitude: float
    image_id: str
    sensor: str
    modality: str
    acquisition_date: str
    pixel_x: int
    pixel_y: int
    elevation_m: float
    bands: PixelBands
    indices: PixelIndices
    sar: Optional[PixelSar] = None
    land_cover_prediction: str
    confidence: float

class SceneCardResponse(BaseModel):
    id: str
    satellite: str # "Sentinel-2" or "Sentinel-1"
    product: str # "L2A" or "GRD"
    tile: str # e.g. "30UUE"
    date: str # "08 Sep 2026"
    cloud_cover: float # 0.0%
    resolution: str # "10 m"
    modality: str # "Optical" or "SAR"
    orbit: Optional[str] = None
    polarization: Optional[str] = None
    lat: float
    lon: float
    thumbnail_url: str
    bands: List[str]

class TimeSeriesMetricPoint(BaseModel):
    year: str
    ndvi: float
    water_area_ha: float
    built_up_km2: float
    vegetation_loss_pct: float

class TimeSeriesResponse(BaseModel):
    location: str
    tile: str
    coordinates: List[float] # [lat, lon]
    data_points: List[TimeSeriesMetricPoint]
    trend_summary: str

