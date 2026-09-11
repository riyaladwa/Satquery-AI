import time
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import Image
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/benchmark", tags=["benchmark"])

class BenchmarkEvaluateRequest(BaseModel):
    benchmark_name: str = Field(..., description="Benchmark dataset: VRSBench, RSVQA, CDVQA, or ISRO-SAC-2026")
    question_id: str = Field(..., description="Benchmark question ID")
    image_id: str = Field(..., description="Primary image ID")
    secondary_image_id: Optional[str] = None
    query: str = Field(..., description="Evaluation question")
    ground_truth_answer: Optional[str] = None
    ground_truth_coordinates: Optional[List[List[float]]] = None

class BenchmarkEvaluateResponse(BaseModel):
    benchmark_name: str
    question_id: str
    task_type: str
    specialist_model: str
    adaptation_tier: str
    training_resource: str
    prediction: str
    confidence: float
    evidence_regions: List[Dict[str, Any]]
    metrics: Dict[str, Any]
    latency_ms: int
    score: Optional[float] = None
    evaluated_at: str

@router.get("/supported")
def get_supported_benchmarks():
    """
    Returns public benchmark configurations supported by SatQuery AI.
    """
    return {
        "benchmarks": [
            {
                "id": "VRSBench",
                "name": "Vision-Language Remote Sensing Benchmark (VRSBench)",
                "specialist": "CAPTIONING_MODEL / GROUNDING_MODEL",
                "tasks": ["Scene Captioning", "Visual Grounding", "Visual Question Answering"],
                "sensors": ["Optical / Multispectral"]
            },
            {
                "id": "RSVQA",
                "name": "Remote Sensing Visual Question Answering (RSVQA - LR / HR)",
                "specialist": "VQA_MODEL",
                "tasks": ["Existence Query", "Count Query", "Land Cover Query"],
                "sensors": ["Sentinel-2", "Aerial HR"]
            },
            {
                "id": "CDVQA",
                "name": "Change Detection Visual Question Answering (CDVQA)",
                "specialist": "CHANGE_VQA_MODEL / CHANGE_ANALYSIS_MODEL",
                "tasks": ["Bi-Temporal Change Question Answering", "Expansion Tracking"],
                "sensors": ["Multi-temporal Sentinel-2"]
            },
            {
                "id": "ISRO-SAC-2026",
                "name": "ISRO/SAC Remote Sensing Evaluation Protocol",
                "specialist": "Full Multi-Specialist Registry",
                "tasks": ["Single-Image VQA", "Grounding", "Bi-temporal Analysis", "Optical+SAR Fusion"],
                "sensors": ["Sentinel-1 SAR", "Sentinel-2 MSI", "Fused Multimodal"]
            }
        ]
    }

@router.post("/evaluate", response_model=BenchmarkEvaluateResponse)
def evaluate_benchmark_item(req: BenchmarkEvaluateRequest, db: Session = Depends(get_db)):
    """
    Evaluates a standardized benchmark item through the agentic orchestrator.
    Supports RSVQA, VRSBench, CDVQA, and ISRO-SAC formats.
    """
    start_time = time.time()

    # Load primary image
    img = db.query(Image).filter(Image.id == req.image_id).first()
    if not img or not img.metadata_rel:
        raise HTTPException(status_code=404, detail=f"Benchmark primary image {req.image_id} not found")

    m = img.metadata_rel
    meta = {
        "filename": img.filename,
        "sensor": img.sensor,
        "modality": img.modality,
        "acquisition_date": img.acquisition_date,
        "crs": m.crs,
        "resolution_m": m.resolution_m,
        "bounds": [m.min_lat, m.min_lon, m.max_lat, m.max_lon],
        "cloud_cover": m.cloud_cover,
        "contrast_score": m.contrast_score,
        "is_georeferenced": m.is_georeferenced,
        "width": m.width,
        "height": m.height
    }

    sec_meta = None
    if req.secondary_image_id:
        sec_img = db.query(Image).filter(Image.id == req.secondary_image_id).first()
        if sec_img and sec_img.metadata_rel:
            sm = sec_img.metadata_rel
            sec_meta = {
                "filename": sec_img.filename,
                "sensor": sec_img.sensor,
                "modality": sec_img.modality,
                "acquisition_date": sec_img.acquisition_date,
                "crs": sm.crs,
                "resolution_m": sm.resolution_m,
                "bounds": [sm.min_lat, sm.min_lon, sm.max_lat, sm.max_lon],
                "cloud_cover": sm.cloud_cover,
                "contrast_score": sm.contrast_score,
                "is_georeferenced": sm.is_georeferenced,
                "width": sm.width,
                "height": sm.height
            }

    try:
        result = orchestrator.process_query(
            query=req.query,
            image_meta=meta,
            secondary_image_meta=sec_meta
        )
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))

    latency = int((time.time() - start_time) * 1000)

    # Optional scoring against ground truth
    score = None
    if req.ground_truth_answer:
        pred_lower = result["answer_en"].lower()
        gt_lower = req.ground_truth_answer.lower()
        if gt_lower in pred_lower:
            score = 1.0
        else:
            pred_tokens = set(pred_lower.split())
            gt_tokens = set(gt_lower.split())
            overlap = len(pred_tokens.intersection(gt_tokens))
            score = round(overlap / max(1, len(gt_tokens)), 2)

    return BenchmarkEvaluateResponse(
        benchmark_name=req.benchmark_name,
        question_id=req.question_id,
        task_type=result["task_type"],
        specialist_model=result["model_name"],
        adaptation_tier=result.get("adaptation_tier", "Domain-adapted"),
        training_resource=result.get("data_used", {}).get("training_resource", "BigEarthNet-S2"),
        prediction=result["answer_en"],
        confidence=result["confidence_score"],
        evidence_regions=result.get("evidence_regions", []),
        metrics=result.get("metrics", {}),
        latency_ms=latency,
        score=score,
        evaluated_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    )
