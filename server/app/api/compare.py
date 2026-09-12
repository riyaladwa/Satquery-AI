from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import Image
from app.geospatial.change_engine import analyze_change
from app.geospatial.fusion_engine import analyze_optical_sar_joint

router = APIRouter(prefix="/compare", tags=["compare"])

@router.get("/bitemporal")
def compare_bitemporal(
    image_a_id: str = Query(...),
    image_b_id: str = Query(...),
    custom_type: str = Query("urban"),
    db: Session = Depends(get_db)
):
    img_a = db.query(Image).filter(Image.id == image_a_id).first()
    img_b = db.query(Image).filter(Image.id == image_b_id).first()
    if not img_a or not img_b:
        raise HTTPException(status_code=404, detail="One or both comparison images not found")

    bounds = [12.92, 77.58, 12.98, 77.65]
    if img_a.metadata_rel and img_a.metadata_rel.min_lat is not None:
        m = img_a.metadata_rel
        bounds = [m.min_lat, m.min_lon, m.max_lat, m.max_lon]
    elif img_b.metadata_rel and img_b.metadata_rel.min_lat is not None:
        m = img_b.metadata_rel
        bounds = [m.min_lat, m.min_lon, m.max_lat, m.max_lon]

    # Seamlessly route Optical + SAR pairs to joint fusion analysis
    is_cross_modal = (
        (img_a.modality == "SAR" and img_b.modality != "SAR") or
        (img_b.modality == "SAR" and img_a.modality != "SAR") or
        ("sentinel-1" in (img_a.sensor or "").lower() and "sentinel-2" in (img_b.sensor or "").lower()) or
        ("sentinel-2" in (img_a.sensor or "").lower() and "sentinel-1" in (img_b.sensor or "").lower())
    )

    if is_cross_modal:
        opt = img_a if (img_a.modality != "SAR" and "sentinel-1" not in (img_a.sensor or "").lower()) else img_b
        sar = img_b if opt == img_a else img_a
        meta_opt = {"filename": opt.filename, "sensor": opt.sensor, "modality": opt.modality}
        meta_sar = {"filename": sar.filename, "sensor": sar.sensor, "modality": sar.modality}
        results = analyze_optical_sar_joint(meta_opt, meta_sar, bounds)
        return {
            "image_a": {
                "id": img_a.id,
                "filename": img_a.filename,
                "date": img_a.acquisition_date,
                "preview_url": img_a.preview_path,
                "modality": img_a.modality
            },
            "image_b": {
                "id": img_b.id,
                "filename": img_b.filename,
                "date": img_b.acquisition_date,
                "preview_url": img_b.preview_path,
                "modality": img_b.modality
            },
            "optical_image": {
                "id": opt.id,
                "filename": opt.filename,
                "sensor": opt.sensor,
                "preview_url": opt.preview_path
            },
            "sar_image": {
                "id": sar.id,
                "filename": sar.filename,
                "sensor": sar.sensor,
                "preview_url": sar.preview_path
            },
            "bounds": bounds,
            "is_cross_modal": True,
            **results
        }

    meta_a = {"filename": img_a.filename, "date": img_a.acquisition_date, "sensor": img_a.sensor}
    meta_b = {"filename": img_b.filename, "date": img_b.acquisition_date, "sensor": img_b.sensor}

    results = analyze_change(bounds, meta_a, meta_b, custom_type=custom_type)
    return {
        "image_a": {
            "id": img_a.id,
            "filename": img_a.filename,
            "date": img_a.acquisition_date,
            "preview_url": img_a.preview_path
        },
        "image_b": {
            "id": img_b.id,
            "filename": img_b.filename,
            "date": img_b.acquisition_date,
            "preview_url": img_b.preview_path
        },
        "bounds": bounds,
        **results
    }

@router.get("/optical-sar")
def compare_optical_sar(
    optical_id: str = Query(...),
    sar_id: str = Query(...),
    db: Session = Depends(get_db)
):
    img1 = db.query(Image).filter(Image.id == optical_id).first()
    img2 = db.query(Image).filter(Image.id == sar_id).first()
    if not img1 or not img2:
        raise HTTPException(status_code=404, detail="Optical or SAR image not found")

    # Order-independent smart modality detection
    if (img1.modality == "SAR" or "sentinel-1" in (img1.sensor or "").lower()) and (img2.modality != "SAR"):
        opt, sar = img2, img1
    elif (img2.modality == "SAR" or "sentinel-1" in (img2.sensor or "").lower()) and (img1.modality != "SAR"):
        opt, sar = img1, img2
    else:
        opt, sar = img1, img2

    bounds = [18.92, 72.82, 19.00, 72.90]
    if opt.metadata_rel and opt.metadata_rel.min_lat is not None:
        m = opt.metadata_rel
        bounds = [m.min_lat, m.min_lon, m.max_lat, m.max_lon]
    elif sar.metadata_rel and sar.metadata_rel.min_lat is not None:
        m = sar.metadata_rel
        bounds = [m.min_lat, m.min_lon, m.max_lat, m.max_lon]

    meta_opt = {"filename": opt.filename, "sensor": opt.sensor, "modality": opt.modality}
    meta_sar = {"filename": sar.filename, "sensor": sar.sensor, "modality": sar.modality}

    results = analyze_optical_sar_joint(meta_opt, meta_sar, bounds)
    return {
        "optical_image": {
            "id": opt.id,
            "filename": opt.filename,
            "sensor": opt.sensor,
            "preview_url": opt.preview_path
        },
        "sar_image": {
            "id": sar.id,
            "filename": sar.filename,
            "sensor": sar.sensor,
            "preview_url": sar.preview_path
        },
        "bounds": bounds,
        **results
    }
