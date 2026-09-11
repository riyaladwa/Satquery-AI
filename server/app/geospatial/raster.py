import io
from pathlib import Path
from typing import Optional, Tuple, Dict, Any
import numpy as np
from PIL import Image as PILImage
import tifffile

def read_geotiff_metadata(file_path: Path) -> Dict[str, Any]:
    """
    Extracts geospatial and image metadata from GeoTIFF or standard images.
    """
    metadata: Dict[str, Any] = {
        "width": 0,
        "height": 0,
        "bands": 3,
        "crs": "EPSG:4326",
        "resolution_m": 10.0,
        "bounds": [12.92, 77.58, 12.98, 77.65], # Default sample center [min_lat, min_lon, max_lat, max_lon]
        "is_georeferenced": True,
        "cloud_cover": 0.0,
        "mean_brightness": 128.0,
        "contrast_score": 60.0,
        "format": "Unknown"
    }
    
    suffix = file_path.suffix.lower()
    if suffix in [".tif", ".tiff"]:
        try:
            with tifffile.TiffFile(str(file_path)) as tif:
                page = tif.pages[0]
                metadata["width"] = int(page.imagewidth)
                metadata["height"] = int(page.imagelength)
                metadata["bands"] = int(page.samplesperpixel)
                metadata["format"] = "GeoTIFF"
                
                # Check for GeoTIFF tags
                geotags = page.geotiff_tags
                if geotags:
                    metadata["is_georeferenced"] = True
                    # If ModelTiepointTag / ModelPixelScaleTag present
                    if "ModelPixelScaleTag" in geotags:
                        scales = geotags["ModelPixelScaleTag"]
                        # Approximate resolution in meters or degrees
                        metadata["resolution_m"] = round(float(scales[0]) * (111000 if scales[0] < 0.01 else 1.0), 2)
                    if "GTCitationGeoKey" in geotags:
                        metadata["crs"] = str(geotags["GTCitationGeoKey"])
                
                # Sample raster stats
                data = page.asarray()
                if data is not None and data.size > 0:
                    metadata["mean_brightness"] = round(float(np.mean(data)), 1)
                    metadata["contrast_score"] = round(float(np.std(data)), 1)
                    # Simple cloud metric: pixels > 230 in 8-bit scale
                    if data.dtype == np.uint8:
                        clouds = np.sum(data > 230) / data.size
                    else:
                        norm_data = (data - np.min(data)) / (np.max(data) - np.min(data) + 1e-5)
                        clouds = np.sum(norm_data > 0.9) / data.size
                    metadata["cloud_cover"] = round(float(clouds * 100), 2)
                    
        except Exception as e:
            # Fallback to PIL
            return _read_standard_image_metadata(file_path, metadata)
    else:
        return _read_standard_image_metadata(file_path, metadata)
        
    return metadata

def _read_standard_image_metadata(file_path: Path, metadata: Dict[str, Any]) -> Dict[str, Any]:
    try:
        with PILImage.open(file_path) as img:
            metadata["width"] = img.width
            metadata["height"] = img.height
            metadata["bands"] = len(img.getbands())
            metadata["format"] = img.format or file_path.suffix.upper().replace(".", "")
            
            # Analyze brightness and contrast
            grayscale = img.convert("L")
            arr = np.array(grayscale)
            metadata["mean_brightness"] = round(float(np.mean(arr)), 1)
            metadata["contrast_score"] = round(float(np.std(arr)), 1)
            metadata["cloud_cover"] = round(float(np.sum(arr > 235) / arr.size * 100), 2)
    except Exception:
        pass
    return metadata

def generate_preview(file_path: Path, max_size: Tuple[int, int] = (1024, 1024)) -> bytes:
    """
    Generates a web-friendly PNG preview of the raster image.
    """
    suffix = file_path.suffix.lower()
    if suffix in [".tif", ".tiff"]:
        try:
            with tifffile.TiffFile(str(file_path)) as tif:
                arr = tif.pages[0].asarray()
                if arr.ndim == 2:
                    # Grayscale or single band
                    norm = ((arr - arr.min()) / (arr.max() - arr.min() + 1e-5) * 255).astype(np.uint8)
                    img = PILImage.fromarray(norm, mode="L").convert("RGB")
                elif arr.ndim == 3:
                    if arr.shape[0] in [1, 3, 4] and arr.shape[0] < arr.shape[2]:
                        arr = np.transpose(arr, (1, 2, 0))
                    # Take first 3 bands (e.g. RGB)
                    rgb = arr[:, :, :3]
                    norm = ((rgb - rgb.min()) / (rgb.max() - rgb.min() + 1e-5) * 255).astype(np.uint8)
                    img = PILImage.fromarray(norm)
                else:
                    img = PILImage.new("RGB", (512, 512), (30, 40, 55))
        except Exception:
            with PILImage.open(file_path) as img_raw:
                img = img_raw.convert("RGB")
    else:
        with PILImage.open(file_path) as img_raw:
            img = img_raw.convert("RGB")
            
    img.thumbnail(max_size, PILImage.Resampling.LANCZOS)
    output = io.BytesIO()
    img.save(output, format="PNG", optimize=True)
    return output.getvalue()
