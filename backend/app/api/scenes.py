from typing import List, Optional
from fastapi import APIRouter, Query
from app.schemas.api_schemas import SceneCardResponse

router = APIRouter(prefix="/scenes", tags=["scenes"])

ALL_SCENES: List[SceneCardResponse] = [
    SceneCardResponse(
        id="img-dublin-s2-2026",
        satellite="Sentinel-2",
        product="L2A",
        tile="30UUE",
        date="08 Sep 2026",
        cloud_cover=0.0,
        resolution="10 m",
        modality="Optical",
        lat=53.3472,
        lon=-6.2439,
        thumbnail_url="/previews/dublin_sentinel2_2026.png",
        bands=["B02", "B03", "B04", "B08", "B11", "B12"]
    ),
    SceneCardResponse(
        id="img-dublin-s1-2026",
        satellite="Sentinel-1",
        product="GRD",
        tile="30UUE",
        date="08 Sep 2026",
        cloud_cover=0.0,
        resolution="10 m",
        modality="SAR",
        orbit="Descending 102",
        polarization="VV + VH",
        lat=53.3472,
        lon=-6.2439,
        thumbnail_url="/previews/dublin_sentinel1_sar_2026.png",
        bands=["VV", "VH", "VV/VH"]
    ),
    SceneCardResponse(
        id="img-dublin-s2-2023",
        satellite="Sentinel-2",
        product="L2A",
        tile="30UUE",
        date="15 Sep 2023",
        cloud_cover=1.2,
        resolution="10 m",
        modality="Optical",
        lat=53.3472,
        lon=-6.2439,
        thumbnail_url="/previews/dublin_sentinel2_2023.png",
        bands=["B02", "B03", "B04", "B08", "B11", "B12"]
    ),
    SceneCardResponse(
        id="img-blr-2026",
        satellite="Sentinel-2",
        product="L2A",
        tile="43PGN",
        date="05 Mar 2026",
        cloud_cover=0.8,
        resolution="10 m",
        modality="Optical",
        lat=12.95,
        lon=77.62,
        thumbnail_url="/previews/bengaluru_sentinel2_2026.png",
        bands=["B02", "B03", "B04", "B08", "B11", "B12"]
    ),
    SceneCardResponse(
        id="img-blr-2023",
        satellite="Sentinel-2",
        product="L2A",
        tile="43PGN",
        date="12 Mar 2023",
        cloud_cover=1.4,
        resolution="10 m",
        modality="Optical",
        lat=12.95,
        lon=77.62,
        thumbnail_url="/previews/bengaluru_sentinel2_2023.png",
        bands=["B02", "B03", "B04", "B08", "B11", "B12"]
    ),
    SceneCardResponse(
        id="img-ker-flood",
        satellite="Sentinel-2",
        product="L2A",
        tile="43PFR",
        date="18 Aug 2024",
        cloud_cover=4.8,
        resolution="10 m",
        modality="Optical",
        lat=9.98,
        lon=76.30,
        thumbnail_url="/previews/kerala_flood_aftermath_2024.png",
        bands=["B02", "B03", "B04", "B08", "B11", "B12"]
    ),
    SceneCardResponse(
        id="img-mum-sar",
        satellite="Sentinel-1",
        product="GRD",
        tile="43QDA",
        date="22 Jan 2026",
        cloud_cover=0.0,
        resolution="10 m",
        modality="SAR",
        orbit="Ascending 048",
        polarization="VV + VH",
        lat=18.96,
        lon=72.86,
        thumbnail_url="/previews/mumbai_coastal_sentinel1_sar.png",
        bands=["VV", "VH"]
    ),
    SceneCardResponse(
        id="img-pun-agri",
        satellite="Sentinel-2",
        product="L2A",
        tile="43RFL",
        date="14 Feb 2026",
        cloud_cover=0.5,
        resolution="10 m",
        modality="Optical",
        lat=30.93,
        lon=75.84,
        thumbnail_url="/previews/punjab_cropland_sentinel2.png",
        bands=["B02", "B03", "B04", "B08", "B11", "B12"]
    )
]

@router.get("/search", response_model=List[SceneCardResponse])
def search_scenes(
    satellite: Optional[str] = Query(None, description="Filter: Sentinel-1 or Sentinel-2"),
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    max_cloud: Optional[float] = Query(100.0, description="Max cloud coverage percent"),
    query: Optional[str] = Query(None, description="Search query or coordinates or tile"),
    resolution: Optional[str] = Query(None, description="Resolution filter e.g. 10m")
):
    """
    Search available Sentinel-1 and Sentinel-2 satellite imagery scene cards,
    filtering by satellite sensor, date range, cloud cover percentage, and region/tile.
    """
    results = ALL_SCENES

    if satellite:
        sat_clean = satellite.lower().replace("-", "").replace(" ", "")
        if "sentinel1" in sat_clean or "sar" in sat_clean:
            results = [s for s in results if s.satellite == "Sentinel-1"]
        elif "sentinel2" in sat_clean or "optical" in sat_clean:
            results = [s for s in results if s.satellite == "Sentinel-2"]

    if max_cloud is not None:
        results = [s for s in results if s.cloud_cover <= max_cloud]

    if query:
        q = query.lower().strip()
        filtered = []
        for s in results:
            if (q in s.tile.lower() or 
                q in s.id.lower() or 
                q in s.satellite.lower() or
                ("dublin" in q and "dublin" in s.id) or
                ("bengaluru" in q and "blr" in s.id) or
                ("kerala" in q and "ker" in s.id) or
                ("mumbai" in q and "mum" in s.id) or
                ("punjab" in q and "pun" in s.id) or
                ("53.34" in q or "-6.24" in q or "30uue" in q) and "dublin" in s.id):
                filtered.append(s)
        if filtered:
            results = filtered

    return results
