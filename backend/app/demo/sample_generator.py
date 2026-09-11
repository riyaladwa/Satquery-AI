import os
from pathlib import Path
import numpy as np
from PIL import Image as PILImage
import tifffile
from app.core.config import settings
from app.database.session import SessionLocal
from app.database.models import Image, ImageMetadata, Project, AnalysisSession, AnalysisResult, EvidenceRegion

def generate_synthetic_satellite_raster(
    file_path: Path,
    width: int = 512,
    height: int = 512,
    pattern: str = "urban_2026"
) -> None:
    """
    Generates realistic synthetic multi-band remote sensing imagery as GeoTIFF.
    """
    # Create realistic synthetic terrain bands
    x = np.linspace(0, 10, width)
    y = np.linspace(0, 10, height)
    xx, yy = np.meshgrid(x, y)

    # Base background: vegetation / terrain
    base_terrain = np.sin(xx * 0.5) * np.cos(yy * 0.5) * 30 + 100
    
    if pattern == "urban_2023":
        # Dense city center (lower west), sparse east
        r = base_terrain + (100 - xx * 8)
        g = base_terrain + 30
        b = base_terrain + 10
        # River in center-west
        river = (np.abs(xx - 3.5 + np.sin(yy * 0.8) * 0.5) < 0.3)
        r[river] = 20
        g[river] = 60
        b[river] = 120
    elif pattern == "urban_2026":
        # City expanded eastward into prior terrain
        r = base_terrain + (100 - xx * 4) + (xx > 5.5) * 60
        g = base_terrain + 30
        b = base_terrain + (xx > 5.5) * 50
        river = (np.abs(xx - 3.5 + np.sin(yy * 0.8) * 0.5) < 0.3)
        r[river] = 20
        g[river] = 60
        b[river] = 120
    elif pattern == "dublin_2023":
        # Dublin Bay in east, River Liffey through center
        r = base_terrain + 30
        g = base_terrain + 35
        b = base_terrain + 20
        # River Liffey (running west to east)
        river = (np.abs(yy - 5.0 + np.sin(xx * 0.8) * 0.4) < 0.25) & (xx < 7.5)
        # Dublin Bay (east)
        bay = (xx >= 7.5) | ((xx >= 6.8) & (np.abs(yy - 5.0) < 1.8))
        # Urban core (lower docklands less dense in 2023)
        urban_core = (xx > 2.5) & (xx < 6.5) & (yy > 3.2) & (yy < 6.8)
        r[urban_core] += 65
        g[urban_core] += 45
        b[urban_core] += 40
        # Water bodies
        r[river | bay] = 18
        g[river | bay] = 55
        b[river | bay] = 115
    elif pattern == "dublin_2026":
        # Dublin with expanded silicon docks, western arterial growth, high-density residential
        r = base_terrain + 30
        g = base_terrain + 35
        b = base_terrain + 20
        river = (np.abs(yy - 5.0 + np.sin(xx * 0.8) * 0.4) < 0.25) & (xx < 7.5)
        bay = (xx >= 7.5) | ((xx >= 6.8) & (np.abs(yy - 5.0) < 1.8))
        urban_core = (xx > 1.8) & (xx < 7.2) & (yy > 2.5) & (yy < 7.2)
        r[urban_core] += 85
        g[urban_core] += 60
        b[urban_core] += 55
        # New dockland tech quarter expansion
        docklands = (xx > 5.5) & (xx < 7.3) & (yy > 4.2) & (yy < 5.8)
        r[docklands] += 30
        g[docklands] += 25
        b[docklands] += 35
        # Water bodies
        r[river | bay] = 18
        g[river | bay] = 55
        b[river | bay] = 115
    elif pattern == "dublin_sar":
        # Sentinel-1 C-SAR microwave radar backscatter
        speckle = np.random.normal(110, 30, (height, width))
        # Dublin Bay / River Liffey: specular water reflection = very dark return (-22 dB)
        river = (np.abs(yy - 5.0 + np.sin(xx * 0.8) * 0.4) < 0.25) & (xx < 7.5)
        bay = (xx >= 7.5) | ((xx >= 6.8) & (np.abs(yy - 5.0) < 1.8))
        speckle[river | bay] = 22
        # Urban concrete & dockland cranes: double-bounce high dielectric return (+6 dB)
        urban = (xx > 1.8) & (xx < 7.2) & (yy > 2.5) & (yy < 7.2)
        speckle[urban] += 80
        r = np.clip(speckle, 0, 255).astype(np.uint8)
        g = r
        b = r
    elif pattern == "flood":
        # Submerged lowland areas
        r = base_terrain - 40
        g = base_terrain - 20
        b = base_terrain + 80
        flood_basin = (xx > 2.0) & (xx < 7.5) & (yy > 3.0) & (yy < 8.0)
        r[flood_basin] = 15
        g[flood_basin] = 45
        b[flood_basin] = 95
    elif pattern == "agri":
        # Green agricultural mosaic
        grid = (np.sin(xx * 3.0) > 0) ^ (np.cos(yy * 3.0) > 0)
        r = np.where(grid, 40, 70)
        g = np.where(grid, 180, 140)
        b = np.where(grid, 30, 45)
    elif pattern == "sar":
        # Grayscale radar speckle and high dielectric return
        speckle = np.random.normal(120, 35, (height, width))
        structures = (xx > 4.0) & (xx < 7.0) & (yy > 3.0) & (yy < 7.0)
        speckle[structures] += 90 # High double-bounce backscatter
        water = (yy < 3.0)
        speckle[water] = 25 # Specular reflection / dark return
        r = np.clip(speckle, 0, 255).astype(np.uint8)
        g = r
        b = r
    else:
        r = base_terrain + 40
        g = base_terrain + 60
        b = base_terrain + 80

    rgb = np.stack([
        np.clip(r, 0, 255).astype(np.uint8),
        np.clip(g, 0, 255).astype(np.uint8),
        np.clip(b, 0, 255).astype(np.uint8)
    ], axis=-1)

    # Save as TIFF with geotags simulated
    tifffile.imwrite(str(file_path), rgb, photometric='rgb')

def seed_demo_data():
    """
    Initializes projects and demo satellite images if database is empty or missing Dublin demo.
    """
    db = SessionLocal()
    try:
        # Check if Dublin demo exists
        dublin_exists = db.query(Image).filter(Image.id == "img-dublin-s2-2026").first() is not None
        has_images = db.query(Image).count() > 0

        if not has_images:
            # 1. Create Default Projects
            project_bengaluru = Project(
                name="Bengaluru Urban Growth Monitoring",
                description="Multi-temporal Sentinel-2 optical surveillance tracking arterial infrastructure expansion and land cover transitions from 2023 to 2026."
            )
            project_kerala = Project(
                name="Kerala Rapid Flood Inundation Assessment",
                description="Disaster mapping and damage evaluation post-monsoon river basin cresting."
            )
            project_punjab = Project(
                name="Punjab Agricultural & Crop Health Observatory",
                description="Sentinel-2 vegetation health and NDVI stress monitoring across agricultural tracts."
            )
            project_mumbai = Project(
                name="Mumbai Coastal Port Optical + SAR Fusion",
                description="Cross-sensor evaluation combining Sentinel-2 Optical reflectance and Sentinel-1 SAR C-band microwave penetration."
            )
            db.add_all([project_bengaluru, project_kerala, project_punjab, project_mumbai])
            db.commit()

            samples_info = [
                {
                    "id": "img-blr-2023",
                    "project_id": project_bengaluru.id,
                    "filename": "bengaluru_sentinel2_2023.tif",
                    "pattern": "urban_2023",
                    "modality": "Optical",
                    "sensor": "Sentinel-2 MSI",
                    "date": "2023-03-12",
                    "bounds": [12.92, 77.58, 12.98, 77.65],
                    "crs": "EPSG:4326",
                    "res": 10.0
                },
                {
                    "id": "img-blr-2026",
                    "project_id": project_bengaluru.id,
                    "filename": "bengaluru_sentinel2_2026.tif",
                    "pattern": "urban_2026",
                    "modality": "Optical",
                    "sensor": "Sentinel-2 MSI",
                    "date": "2026-03-05",
                    "bounds": [12.92, 77.58, 12.98, 77.65],
                    "crs": "EPSG:4326",
                    "res": 10.0
                },
                {
                    "id": "img-ker-flood",
                    "project_id": project_kerala.id,
                    "filename": "kerala_flood_aftermath_2024.tif",
                    "pattern": "flood",
                    "modality": "Optical",
                    "sensor": "Sentinel-2 MSI",
                    "date": "2024-08-18",
                    "bounds": [9.95, 76.25, 10.02, 76.35],
                    "crs": "EPSG:4326",
                    "res": 10.0
                },
                {
                    "id": "img-pun-agri",
                    "project_id": project_punjab.id,
                    "filename": "punjab_cropland_sentinel2.tif",
                    "pattern": "agri",
                    "modality": "Optical",
                    "sensor": "Sentinel-2 MSI",
                    "date": "2026-02-14",
                    "bounds": [30.90, 75.80, 30.96, 75.88],
                    "crs": "EPSG:4326",
                    "res": 10.0
                },
                {
                    "id": "img-mum-sar",
                    "project_id": project_mumbai.id,
                    "filename": "mumbai_coastal_sentinel1_sar.tif",
                    "pattern": "sar",
                    "modality": "SAR",
                    "sensor": "Sentinel-1 C-SAR",
                    "date": "2026-01-22",
                    "bounds": [18.92, 72.82, 19.00, 72.90],
                    "crs": "EPSG:4326",
                    "res": 10.0
                },
                {
                    "id": "img-mum-opt",
                    "project_id": project_mumbai.id,
                    "filename": "mumbai_coastal_sentinel2_optical.tif",
                    "pattern": "urban_2026",
                    "modality": "Optical",
                    "sensor": "Sentinel-2 MSI",
                    "date": "2026-01-22",
                    "bounds": [18.92, 72.82, 19.00, 72.90],
                    "crs": "EPSG:4326",
                    "res": 10.0
                }
            ]

            for s in samples_info:
                target_path = settings.DEMO_DIR / s["filename"]
                generate_synthetic_satellite_raster(target_path, pattern=s["pattern"])
                preview_filename = s["filename"].replace(".tif", ".png")
                preview_path = settings.PREVIEW_DIR / preview_filename
                with PILImage.open(target_path) as img:
                    img.save(preview_path, format="PNG")

                img_rec = Image(
                    id=s["id"],
                    project_id=s["project_id"],
                    filename=s["filename"],
                    original_filename=s["filename"],
                    file_path=str(target_path),
                    preview_path=f"/previews/{preview_filename}",
                    file_size=os.path.getsize(target_path),
                    file_format="GeoTIFF",
                    modality=s["modality"],
                    sensor=s["sensor"],
                    acquisition_date=s["date"],
                    is_demo=True
                )
                db.add(img_rec)
                db.flush()

                meta_rec = ImageMetadata(
                    image_id=img_rec.id,
                    width=512,
                    height=512,
                    bands=3,
                    crs=s["crs"],
                    resolution_m=s["res"],
                    min_lat=s["bounds"][0],
                    min_lon=s["bounds"][1],
                    max_lat=s["bounds"][2],
                    max_lon=s["bounds"][3],
                    cloud_cover=1.4 if s["modality"] == "Optical" else 0.0,
                    mean_brightness=135.0,
                    contrast_score=62.0,
                    is_georeferenced=True
                )
                db.add(meta_rec)

        if not dublin_exists:
            # Add Dublin Flagship Project
            project_dublin = Project(
                name="Dublin Urban Expansion & Coastal Remote Sensing (Tile 30UUE)",
                description="Multimodal Sentinel-1 SAR and Sentinel-2 Optical surveillance tracking Dublin urban densification, Liffey river corridor, and coastal change from 2023 to 2026."
            )
            db.add(project_dublin)
            db.commit()

            dublin_samples = [
                {
                    "id": "img-dublin-s2-2026",
                    "project_id": project_dublin.id,
                    "filename": "dublin_sentinel2_2026.tif",
                    "pattern": "dublin_2026",
                    "modality": "Optical",
                    "sensor": "Sentinel-2 MSI",
                    "date": "2026-09-08",
                    "bounds": [53.30, -6.38, 53.39, -6.15],
                    "crs": "EPSG:4326",
                    "res": 10.0,
                    "cloud": 0.0
                },
                {
                    "id": "img-dublin-s1-2026",
                    "project_id": project_dublin.id,
                    "filename": "dublin_sentinel1_sar_2026.tif",
                    "pattern": "dublin_sar",
                    "modality": "SAR",
                    "sensor": "Sentinel-1 C-SAR",
                    "date": "2026-09-08",
                    "bounds": [53.30, -6.38, 53.39, -6.15],
                    "crs": "EPSG:4326",
                    "res": 10.0,
                    "cloud": 0.0
                },
                {
                    "id": "img-dublin-s2-2023",
                    "project_id": project_dublin.id,
                    "filename": "dublin_sentinel2_2023.tif",
                    "pattern": "dublin_2023",
                    "modality": "Optical",
                    "sensor": "Sentinel-2 MSI",
                    "date": "2023-09-15",
                    "bounds": [53.30, -6.38, 53.39, -6.15],
                    "crs": "EPSG:4326",
                    "res": 10.0,
                    "cloud": 1.2
                }
            ]

            for s in dublin_samples:
                target_path = settings.DEMO_DIR / s["filename"]
                generate_synthetic_satellite_raster(target_path, pattern=s["pattern"])
                preview_filename = s["filename"].replace(".tif", ".png")
                preview_path = settings.PREVIEW_DIR / preview_filename
                with PILImage.open(target_path) as img:
                    img.save(preview_path, format="PNG")

                img_rec = Image(
                    id=s["id"],
                    project_id=s["project_id"],
                    filename=s["filename"],
                    original_filename=s["filename"],
                    file_path=str(target_path),
                    preview_path=f"/previews/{preview_filename}",
                    file_size=os.path.getsize(target_path),
                    file_format="GeoTIFF",
                    modality=s["modality"],
                    sensor=s["sensor"],
                    acquisition_date=s["date"],
                    is_demo=True
                )
                db.add(img_rec)
                db.flush()

                meta_rec = ImageMetadata(
                    image_id=img_rec.id,
                    width=512,
                    height=512,
                    bands=3,
                    crs=s["crs"],
                    resolution_m=s["res"],
                    min_lat=s["bounds"][0],
                    min_lon=s["bounds"][1],
                    max_lat=s["bounds"][2],
                    max_lon=s["bounds"][3],
                    cloud_cover=s["cloud"],
                    mean_brightness=132.0,
                    contrast_score=68.0,
                    is_georeferenced=True
                )
                db.add(meta_rec)

        db.commit()
    finally:
        db.close()
