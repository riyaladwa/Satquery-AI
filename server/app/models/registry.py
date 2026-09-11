from typing import Dict, Any, List, Optional
from pydantic import BaseModel

# Prescribed Specialist Model Registry Constants
VQA_MODEL = "VQA_MODEL"
CAPTIONING_MODEL = "CAPTIONING_MODEL"
GROUNDING_MODEL = "GROUNDING_MODEL"
CHANGE_ANALYSIS_MODEL = "CHANGE_ANALYSIS_MODEL"
CHANGE_VQA_MODEL = "CHANGE_VQA_MODEL"
OPTICAL_SAR_ANALYSIS_MODEL = "OPTICAL_SAR_ANALYSIS_MODEL"
LAND_COVER_MODEL = "LAND_COVER_MODEL"
OBJECT_DETECTION_MODEL = "OBJECT_DETECTION_MODEL"
AREA_CALCULATION_TOOL = "AREA_CALCULATION_TOOL"

class ModelMetadata(BaseModel):
    id: str
    code: str
    name: str
    version: str
    description: str
    adaptation_tier: str  # "Fine-tuned", "Domain-adapted", "Pretrained", "Deterministic Geospatial Tool"
    training_resource: str  # e.g., "BigEarthNet-S2", "BigEarthNet-S1/S2", "RSVQA", "CDVQA"
    supported_tasks: List[str]
    supported_modalities: List[str]
    supported_benchmarks: List[str]
    input_requirements: Dict[str, Any]
    output_type: str
    base_confidence: float
    status: str = "ACTIVE"
    execution_type: str = "Specialist Neural Engine / Adapter"

class ModelRegistry:
    def __init__(self):
        self._models: Dict[str, ModelMetadata] = {
            VQA_MODEL: ModelMetadata(
                id=VQA_MODEL,
                code="satquery-rsvqa-vlm",
                name="SatQuery RS-VQA Specialist",
                version="3.2.0",
                description="Remote-sensing visual question answering component adapted on RSVQA and BigEarthNet-S2 for multi-band satellite reasoning.",
                adaptation_tier="Fine-tuned (BigEarthNet-S2 / RSVQA)",
                training_resource="BigEarthNet-S2 (Sentinel-2 L2A 12-Band) + RSVQA-HR",
                supported_tasks=["Single-Image VQA", "Existence Check", "Attribute Query", "Land Cover Query"],
                supported_modalities=["Optical", "Multispectral", "SAR"],
                supported_benchmarks=["RSVQA", "VRSBench", "ISRO-SAC-2026"],
                input_requirements={"min_resolution_m": 0.5, "max_resolution_m": 30.0, "min_bands": 1, "image_count": 1},
                output_type="Grounded Visual Answer + Spatial Confidence",
                base_confidence=91.4
            ),
            CAPTIONING_MODEL: ModelMetadata(
                id=CAPTIONING_MODEL,
                code="satquery-vrsbench-captioner",
                name="SatQuery Structured Scene Captioner",
                version="2.4.0",
                description="Multi-scale scene describer generating hierarchical remote-sensing narratives (land cover, urban density, terrain anomalies).",
                adaptation_tier="Fine-tuned (VRSBench / BigEarthNet)",
                training_resource="VRSBench + BigEarthNet multi-label classification",
                supported_tasks=["Scene Description", "Hierarchical Captioning", "Overview"],
                supported_modalities=["Optical", "Multispectral"],
                supported_benchmarks=["VRSBench", "ISRO-SAC-2026"],
                input_requirements={"min_resolution_m": 0.5, "max_resolution_m": 30.0, "min_bands": 3, "image_count": 1},
                output_type="Multi-Section Narrative",
                base_confidence=89.5
            ),
            GROUNDING_MODEL: ModelMetadata(
                id=GROUNDING_MODEL,
                code="satquery-geo-grounder",
                name="GeoGrounder-Pro Spatial Segmentor",
                version="2.8.0",
                description="Text-guided region grounding specialist that locates natural-language requested entities and outputs precise geodesic boundaries directly on the map.",
                adaptation_tier="Domain-adapted (BigEarthNet LULC + Text Alignments)",
                training_resource="BigEarthNet-S2 semantic masks + GeoText benchmarks",
                supported_tasks=["Text-Guided Grounding", "Object Highlighting", "Target Localization"],
                supported_modalities=["Optical", "Multispectral", "SAR"],
                supported_benchmarks=["VRSBench", "ISRO-SAC-2026"],
                input_requirements={"min_resolution_m": 0.3, "max_resolution_m": 30.0, "min_bands": 1, "image_count": 1},
                output_type="GeoJSON Polygons / Bounding Boxes",
                base_confidence=92.8
            ),
            CHANGE_ANALYSIS_MODEL: ModelMetadata(
                id=CHANGE_ANALYSIS_MODEL,
                code="satquery-bitemporal-changenet",
                name="Bi-Temporal ChangeNet",
                version="4.2.0",
                description="Deep Siamese bi-temporal feature differencing network for urban expansion, vegetation transitions, and water shifts with spatial heatmap.",
                adaptation_tier="Fine-tuned (Bi-temporal Sentinel-2 / SpaceNet)",
                training_resource="Multi-temporal Sentinel-2 L2A pairs + OSCD Change Detection",
                supported_tasks=["Change Detection", "Bi-Temporal Comparison", "Urban Expansion"],
                supported_modalities=["Optical", "SAR"],
                supported_benchmarks=["CDVQA", "OSCD", "ISRO-SAC-2026"],
                input_requirements={"min_images": 2, "max_resolution_m": 30.0, "require_georeferencing": True},
                output_type="Change Heatmap + Vector Clusters + % Delta",
                base_confidence=91.0
            ),
            CHANGE_VQA_MODEL: ModelMetadata(
                id=CHANGE_VQA_MODEL,
                code="satquery-cdvqa-reasoner",
                name="SatQuery Change-VQA Reasoner",
                version="3.0.1",
                description="Change Detection Visual Question Answering component answering conversational questions about bi-temporal modifications.",
                adaptation_tier="Domain-adapted (CDVQA Benchmark)",
                training_resource="CDVQA (Change Detection VQA) + BigEarthNet temporal series",
                supported_tasks=["Change VQA", "Temporal Query", "Growth Estimation"],
                supported_modalities=["Optical", "SAR"],
                supported_benchmarks=["CDVQA", "ISRO-SAC-2026"],
                input_requirements={"min_images": 2, "require_georeferencing": True},
                output_type="Comparative Narrative + Metric Delta",
                base_confidence=90.2
            ),
            OPTICAL_SAR_ANALYSIS_MODEL: ModelMetadata(
                id=OPTICAL_SAR_ANALYSIS_MODEL,
                code="satquery-dualstream-fusion",
                name="Optical + SAR Cross-Sensor Fusion Engine",
                version="2.5.0",
                description="Dual-stream joint analyzer combining Sentinel-2 multispectral reflectance and Sentinel-1 C-SAR microwave backscatter for cloud-penetrating verification.",
                adaptation_tier="Fine-tuned (BigEarthNet-S1/S2 Multimodal)",
                training_resource="BigEarthNet-MM (Co-registered Sentinel-1 & Sentinel-2 Benchmark)",
                supported_tasks=["Optical + SAR", "Cross-Sensor Fusion", "All-Weather Assessment"],
                supported_modalities=["Optical + SAR"],
                supported_benchmarks=["BigEarthNet-MM", "ISRO-SAC-2026"],
                input_requirements={"min_images": 2, "modalities": ["Optical", "SAR"]},
                output_type="Cross-Modal Agreement % + Penetration Evidence",
                base_confidence=93.2
            ),
            LAND_COVER_MODEL: ModelMetadata(
                id=LAND_COVER_MODEL,
                code="satquery-landcover-unet",
                name="LandCover-8 UNet Segmentor",
                version="3.6.0",
                description="8-class land use and land cover (LULC) semantic segmentation tuned to BigEarthNet 19/43 class hierarchy.",
                adaptation_tier="Fine-tuned (BigEarthNet 19-class taxonomy)",
                training_resource="BigEarthNet-S2 Benchmark Dataset (590k patches)",
                supported_tasks=["Land Cover", "Semantic Segmentation", "LULC Breakdown"],
                supported_modalities=["Optical", "Multispectral"],
                supported_benchmarks=["BigEarthNet", "ISRO-SAC-2026"],
                input_requirements={"min_bands": 3, "max_resolution_m": 20.0, "image_count": 1},
                output_type="Class Percentages + Area Breakdown + Vector Masks",
                base_confidence=93.8
            ),
            OBJECT_DETECTION_MODEL: ModelMetadata(
                id=OBJECT_DETECTION_MODEL,
                code="satquery-geoyolo-obb",
                name="GeoYOLO Oriented Bounding Box Detector",
                version="8.5.0",
                description="Overhead orbital and aerial small object detector specialized for buildings, transport infrastructure, storage tanks, and water bodies.",
                adaptation_tier="Fine-tuned (DOTA / SpaceNet)",
                training_resource="DOTA-v2 + SpaceNet Building Footprints",
                supported_tasks=["Object Detection", "Counting", "Asset Inventory"],
                supported_modalities=["Optical", "High-Resolution"],
                supported_benchmarks=["DOTA", "ISRO-SAC-2026"],
                input_requirements={"min_resolution_m": 0.3, "max_resolution_m": 15.0, "image_count": 1},
                output_type="Oriented Bounding Boxes + Counts",
                base_confidence=88.4
            ),
            AREA_CALCULATION_TOOL: ModelMetadata(
                id=AREA_CALCULATION_TOOL,
                code="satquery-wgs84-geodesic-calc",
                name="WGS-84 Geodesic Area Tool",
                version="1.0.0",
                description="High-precision geodesic polygon area and perimeter calculator operating on the WGS-84 reference ellipsoid.",
                adaptation_tier="Deterministic Geospatial Tool",
                training_resource="EPSG:4326 Geodetic Reference Standard",
                supported_tasks=["Area Calculation", "Perimeter Measurement", "Geodesics"],
                supported_modalities=["Optical", "SAR", "Vector"],
                supported_benchmarks=["ISO-19107", "OGC-Simple-Features"],
                input_requirements={"polygon_coordinates": True},
                output_type="Area in m², hectares, km²",
                base_confidence=99.9
            )
        }

        # Aliases for backward compatibility
        self._aliases: Dict[str, str] = {
            "vqa-engine": VQA_MODEL,
            "rs-vlm": VQA_MODEL,
            "rs-captioner": CAPTIONING_MODEL,
            "geo-grounder": GROUNDING_MODEL,
            "changenet": CHANGE_ANALYSIS_MODEL,
            "fusion-engine": OPTICAL_SAR_ANALYSIS_MODEL,
            "landcover-unet": LAND_COVER_MODEL,
            "geoyolo": OBJECT_DETECTION_MODEL
        }

    def list_models(self) -> List[Dict[str, Any]]:
        return [m.model_dump() for m in self._models.values()]

    def get_model(self, model_id: str) -> Optional[ModelMetadata]:
        canonical = self._aliases.get(model_id, model_id)
        return self._models.get(canonical)

    def select_model_for_task(
        self,
        task: str,
        modality: str = "Optical",
        image_count: int = 1,
        query: str = ""
    ) -> ModelMetadata:
        """
        Deterministic agentic selection of specialist models from the registry.
        """
        q_lower = query.lower()
        t_lower = task.lower()

        # 1. Cross-Modal Optical + SAR
        if (image_count >= 2 and modality == "Optical + SAR") or ("optical" in q_lower and "sar" in q_lower) or ("optical" in t_lower and "sar" in t_lower):
            return self._models[OPTICAL_SAR_ANALYSIS_MODEL]

        # 2. Bi-Temporal Change Detection & Change VQA
        if image_count >= 2 or any(w in q_lower for w in ["change", "compare", "differ", "between", "before", "after", "increased", "decreased"]):
            if "?" in query or any(w in q_lower for w in ["what", "how much", "why", "did"]):
                return self._models[CHANGE_VQA_MODEL]
            return self._models[CHANGE_ANALYSIS_MODEL]

        # 3. Single-Image Text-Guided Grounding
        if any(w in q_lower for w in ["highlight", "ground", "locate", "where is", "where are", "show the", "find the", "pinpoint"]):
            return self._models[GROUNDING_MODEL]

        # 4. Land Cover & Semantic Segmentation
        if any(w in q_lower for w in ["land cover", "lulc", "classes", "percentage of", "vegetation fraction", "water fraction"]) or "land cover" in t_lower:
            return self._models[LAND_COVER_MODEL]

        # 5. Object Detection & Counting
        if any(w in q_lower for w in ["detect", "count", "how many", "objects", "buildings count", "ships", "tanks"]):
            return self._models[OBJECT_DETECTION_MODEL]

        # 6. Scene Description & Captioning
        if any(w in q_lower for w in ["describe", "caption", "narrate", "overview of this image", "tell me about"]):
            return self._models[CAPTIONING_MODEL]

        # 7. Default Single-Image Remote Sensing VQA
        return self._models[VQA_MODEL]

model_registry = ModelRegistry()
