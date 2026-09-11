from fastapi import APIRouter, HTTPException
from app.schemas.api_schemas import AreaCalculationRequest, AreaCalculationResponse
from app.geospatial.vector import calculate_polygon_geodesics

router = APIRouter(prefix="/area", tags=["area"])

@router.post("/calculate", response_model=AreaCalculationResponse)
def calculate_area(req: AreaCalculationRequest):
    if len(req.coordinates) < 3:
        raise HTTPException(status_code=400, detail="Polygon must contain at least 3 coordinate points")
    
    # Coordinates come in as [lon, lat]
    coords = [(c[0], c[1]) for c in req.coordinates]
    metrics = calculate_polygon_geodesics(coords)
    return AreaCalculationResponse(**metrics)
