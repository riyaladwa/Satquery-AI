import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database.session import get_db
from app.database.models import Image, ImageMetadata, Project
from app.schemas.api_schemas import ImageResponse, ImageMetadataResponse, QualityCheckResponse
from app.geospatial.raster import read_geotiff_metadata, generate_preview
from app.geospatial.quality import validate_image_quality
from app.storage.supabase_storage import upload_bytes_to_supabase, is_supabase_storage_enabled

router = APIRouter(prefix="/images", tags=["images"])

def _build_image_response(img: Image) -> ImageResponse:
    meta = None
    if img.metadata_rel:
        m = img.metadata_rel
        meta = ImageMetadataResponse(
            width=m.width,
            height=m.height,
            bands=m.bands,
            crs=m.crs,
            resolution_m=m.resolution_m,
            bounds=[m.min_lat, m.min_lon, m.max_lat, m.max_lon] if m.min_lat is not None else [12.92, 77.58, 12.98, 77.65],
            cloud_cover=m.cloud_cover,
            mean_brightness=m.mean_brightness,
            contrast_score=m.contrast_score,
            is_georeferenced=m.is_georeferenced
        )
    return ImageResponse(
        id=img.id,
        project_id=img.project_id,
        filename=img.filename,
        original_filename=img.original_filename,
        preview_url=img.preview_path,
        file_size=img.file_size,
        file_format=img.file_format,
        modality=img.modality,
        sensor=img.sensor,
        acquisition_date=img.acquisition_date,
        is_demo=img.is_demo,
        metadata=meta
    )

@router.get("", response_model=list[ImageResponse])
def list_images(db: Session = Depends(get_db)):
    images = db.query(Image).all()
    return [_build_image_response(img) for img in images]

@router.get("/{image_id}", response_model=ImageResponse)
def get_image(image_id: str, db: Session = Depends(get_db)):
    img = db.query(Image).filter(Image.id == image_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    return _build_image_response(img)

@router.post("/upload", response_model=ImageResponse)
async def upload_image(
    file: UploadFile = File(...),
    project_id: int = Form(None),
    modality: str = Form("Optical"),
    sensor: str = Form("Sentinel-2 MSI"),
    acquisition_date: str = Form(None),
    db: Session = Depends(get_db)
):
    ext = Path(file.filename).suffix.lower()
    if ext not in [".tif", ".tiff", ".png", ".jpg", ".jpeg"]:
        raise HTTPException(status_code=400, detail="Unsupported format. Upload GeoTIFF, TIFF, PNG, or JPEG.")

    image_id = f"img-{uuid.uuid4().hex[:12]}"
    clean_filename = f"{image_id}_{file.filename}"
    target_path = settings.UPLOAD_DIR / clean_filename

    # Save raw file
    content = await file.read()
    with open(target_path, "wb") as f:
        f.write(content)

    # Extract metadata
    meta_dict = read_geotiff_metadata(target_path)

    # Generate preview PNG
    preview_filename = f"{image_id}_preview.png"
    preview_bytes = generate_preview(target_path)
    preview_path = settings.PREVIEW_DIR / preview_filename
    with open(preview_path, "wb") as f:
        f.write(preview_bytes)

    # Upload to Supabase Storage if configured
    stored_file_path = str(target_path)
    stored_preview_path = f"/previews/{preview_filename}"
    
    if is_supabase_storage_enabled():
        supa_file = upload_bytes_to_supabase(
            path=f"uploads/{clean_filename}",
            data=content,
            content_type="image/tiff" if ext in [".tif", ".tiff"] else file.content_type or "application/octet-stream"
        )
        if supa_file:
            stored_file_path = supa_file

        supa_preview = upload_bytes_to_supabase(
            path=f"previews/{preview_filename}",
            data=preview_bytes,
            content_type="image/png"
        )
        if supa_preview:
            stored_preview_path = supa_preview

    # Database records
    bounds = meta_dict.get("bounds", [12.92, 77.58, 12.98, 77.65])
    img_rec = Image(
        id=image_id,
        project_id=project_id,
        filename=clean_filename,
        original_filename=file.filename,
        file_path=stored_file_path,
        preview_path=stored_preview_path,
        file_size=len(content),
        file_format=meta_dict.get("format", "GeoTIFF"),
        modality=modality,
        sensor=sensor,
        acquisition_date=acquisition_date or "2026-03-10",
        is_demo=False
    )
    db.add(img_rec)
    db.flush()

    meta_rec = ImageMetadata(
        image_id=image_id,
        width=meta_dict.get("width", 512),
        height=meta_dict.get("height", 512),
        bands=meta_dict.get("bands", 3),
        crs=meta_dict.get("crs", "EPSG:4326"),
        resolution_m=meta_dict.get("resolution_m", 10.0),
        min_lat=bounds[0],
        min_lon=bounds[1],
        max_lat=bounds[2],
        max_lon=bounds[3],
        cloud_cover=meta_dict.get("cloud_cover", 0.0),
        mean_brightness=meta_dict.get("mean_brightness", 128.0),
        contrast_score=meta_dict.get("contrast_score", 50.0),
        is_georeferenced=meta_dict.get("is_georeferenced", True)
    )
    db.add(meta_rec)
    db.commit()
    db.refresh(img_rec)

    return _build_image_response(img_rec)

@router.get("/{image_id}/validate", response_model=QualityCheckResponse)
def validate_image(image_id: str, db: Session = Depends(get_db)):
    img = db.query(Image).filter(Image.id == image_id).first()
    if not img or not img.metadata_rel:
        raise HTTPException(status_code=404, detail="Image or metadata not found")

    m = img.metadata_rel
    meta_dict = {
        "format": img.file_format,
        "width": m.width,
        "height": m.height,
        "crs": m.crs,
        "resolution_m": m.resolution_m,
        "cloud_cover": m.cloud_cover,
        "contrast_score": m.contrast_score,
        "is_georeferenced": m.is_georeferenced,
        "bounds": [m.min_lat, m.min_lon, m.max_lat, m.max_lon]
    }
    rep = validate_image_quality(meta_dict, Path(img.file_path))
    return QualityCheckResponse(**rep)
