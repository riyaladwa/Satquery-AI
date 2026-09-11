import pytest
from app.geospatial.vector import calculate_polygon_geodesics, calculate_line_length
from app.geospatial.quality import validate_image_quality

def test_polygon_geodesics():
    # Square around Bengaluru ~ 0.01 deg
    coords = [
        [77.60, 12.93],
        [77.61, 12.93],
        [77.61, 12.94],
        [77.60, 12.94]
    ]
    res = calculate_polygon_geodesics(coords)
    assert res["area_sqm"] > 1_000_000 # Roughly 1.1 km²
    assert res["area_sqkm"] > 1.0
    assert res["area_hectares"] > 100.0
    assert res["perimeter_km"] > 3.0

def test_quality_checker():
    meta = {
        "format": "GeoTIFF",
        "width": 1024,
        "height": 1024,
        "crs": "EPSG:4326",
        "resolution_m": 10.0,
        "cloud_cover": 2.5,
        "contrast_score": 55.0,
        "is_georeferenced": True
    }
    res = validate_image_quality(meta)
    assert res["is_acceptable"] is True
    assert res["overall_score"] >= 80.0
    assert res["reliability"] == "High"
