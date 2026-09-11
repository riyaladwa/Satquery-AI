import uuid
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import Image, AnalysisSession, QueryLog, AnalysisResult, EvidenceRegion
from app.schemas.api_schemas import AnalyzeRequest, AnalyzeResponse, EvidenceRegionSchema, TimelineStepSchema
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/analyze", tags=["analyze"])

@router.post("", response_model=AnalyzeResponse)
def analyze_query(req: AnalyzeRequest, db: Session = Depends(get_db)):
    img = db.query(Image).filter(Image.id == req.image_id).first()
    if not img or not img.metadata_rel:
        raise HTTPException(status_code=404, detail="Primary satellite image not found")

    sec_img = None
    if req.secondary_image_id:
        sec_img = db.query(Image).filter(Image.id == req.secondary_image_id).first()

    # Retrieve or create session for conversation history
    session = None
    if req.session_id:
        session = db.query(AnalysisSession).filter(AnalysisSession.id == req.session_id).first()

    if not session:
        session_id = req.session_id or f"sess-{uuid.uuid4().hex[:12]}"
        session = AnalysisSession(
            id=session_id,
            project_id=img.project_id,
            image_id=img.id,
            secondary_image_id=sec_img.id if sec_img else None,
            title=f"Analysis: {req.query[:45]}...",
            analysis_type="Agentic VLM"
        )
        db.add(session)
        db.commit()
    else:
        session_id = session.id
        session.updated_at = datetime.utcnow()
        if not session.image_id:
            session.image_id = img.id
        db.commit()

    # Prepare metadata dicts
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

    # Run agentic orchestrator with validation
    try:
        result_dict = orchestrator.process_query(
            query=req.query,
            image_meta=meta,
            secondary_image_meta=sec_meta,
            language=req.language
        )
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))

    # Persist query and result
    query_rec = QueryLog(
        session_id=session_id,
        query_text=req.query,
        language=req.language,
        source=req.source
    )
    db.add(query_rec)
    db.flush()

    res_id = f"res-{uuid.uuid4().hex[:12]}"
    loc_answers = result_dict.get("localized_answers", {})
    if req.language in loc_answers and loc_answers[req.language]:
        answer_text = loc_answers[req.language]
    elif req.language == "hi" and result_dict.get("answer_hi"):
        answer_text = result_dict["answer_hi"]
    elif req.language == "kn" and result_dict.get("answer_kn"):
        answer_text = result_dict["answer_kn"]
    else:
        answer_text = result_dict["answer_en"]

    analysis_res = AnalysisResult(
        id=res_id,
        session_id=session_id,
        query_id=query_rec.id,
        task_type=result_dict["task_type"],
        answer_text=answer_text,
        answer_hindi=result_dict.get("answer_hi"),
        answer_kannada=result_dict.get("answer_kn"),
        confidence_score=result_dict["confidence_score"],
        reliability_score=result_dict["reliability_score"],
        reliability_reason=result_dict["reliability_reason"],
        model_name=result_dict["model_name"],
        execution_time_ms=result_dict["execution_time_ms"],
        timeline_json=json.dumps(result_dict["timeline"]),
        metrics_json=json.dumps(result_dict["metrics"])
    )
    db.add(analysis_res)
    db.flush()

    # Persist evidence regions
    ev_schemas = []
    for ev in result_dict.get("evidence_regions", []):
        ev_rec = EvidenceRegion(
            result_id=res_id,
            label=ev["label"],
            region_type=ev.get("type", "polygon"),
            geojson=json.dumps(ev.get("coordinates", [])),
            confidence=ev.get("confidence", 90.0),
            area_sqm=ev.get("area_sqkm", 0.0) * 1_000_000,
            attributes_json=json.dumps(ev)
        )
        db.add(ev_rec)
        ev_schemas.append(EvidenceRegionSchema(
            id=ev["id"],
            label=ev["label"],
            type=ev["type"],
            coordinates=ev["coordinates"],
            area_sqkm=ev["area_sqkm"],
            area_hectares=ev["area_hectares"],
            confidence=ev["confidence"],
            description=ev.get("description")
        ))

    db.commit()

    timeline_schemas = [
        TimelineStepSchema(
            step=t["step"],
            status=t["status"],
            details=t["details"],
            timestamp_ms=t["timestamp_ms"]
        ) for t in result_dict["timeline"]
    ]

    return AnalyzeResponse(
        session_id=session_id,
        image_id=img.id,
        query=req.query,
        task_type=result_dict["task_type"],
        model_name=result_dict["model_name"],
        model_version=result_dict["model_version"],
        answer=answer_text,
        answer_en=result_dict["answer_en"],
        answer_hi=result_dict.get("answer_hi"),
        answer_kn=result_dict.get("answer_kn"),
        localized_answers=loc_answers,
        confidence_score=result_dict["confidence_score"],
        reliability_score=result_dict["reliability_score"],
        reliability_reason=result_dict["reliability_reason"],
        evidence_regions=ev_schemas,
        metrics=result_dict["metrics"],
        timeline=timeline_schemas,
        execution_time_ms=result_dict["execution_time_ms"],
        data_used=result_dict.get("data_used"),
        method=result_dict.get("method"),
        why_result=result_dict.get("why_result"),
        detected_area=result_dict.get("detected_area"),
        evidence_summary=result_dict.get("evidence_summary")
    )
