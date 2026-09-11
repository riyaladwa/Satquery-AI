from typing import List, Tuple, Dict, Any
from shapely.geometry import Polygon, LineString
from pyproj import Geod

# Standard WGS84 ellipsoid geodetic calculator
geod = Geod(ellps="WGS84")

def calculate_polygon_geodesics(coords: List[Tuple[float, float]]) -> Dict[str, Any]:
    """
    Given a list of (lon, lat) coordinates, calculates geodesic area and perimeter on WGS84 ellipsoid.
    """
    if len(coords) < 3:
        return {
            "area_sqm": 0.0,
            "area_sqkm": 0.0,
            "area_hectares": 0.0,
            "area_acres": 0.0,
            "perimeter_m": 0.0,
            "perimeter_km": 0.0,
            "vertex_count": len(coords)
        }
    
    # Ensure polygon is closed
    closed_coords = list(coords)
    if closed_coords[0] != closed_coords[-1]:
        closed_coords.append(closed_coords[0])
        
    lons = [c[0] for c in closed_coords]
    lats = [c[1] for c in closed_coords]
    
    # pyproj geometry_area_perimeter returns (area, perimeter)
    area, perimeter = geod.polygon_area_perimeter(lons, lats)
    area = abs(area)
    perimeter = abs(perimeter)
    
    return {
        "area_sqm": round(area, 2),
        "area_sqkm": round(area / 1_000_000.0, 4),
        "area_hectares": round(area / 10_000.0, 3),
        "area_acres": round(area * 0.000247105, 3),
        "perimeter_m": round(perimeter, 2),
        "perimeter_km": round(perimeter / 1000.0, 3),
        "vertex_count": len(coords)
    }

def calculate_line_length(coords: List[Tuple[float, float]]) -> Dict[str, Any]:
    """
    Calculates geodesic length of a linestring.
    """
    if len(coords) < 2:
        return {"length_m": 0.0, "length_km": 0.0}
    lons = [c[0] for c in coords]
    lats = [c[1] for c in coords]
    length = geod.line_length(lons, lats)
    return {
        "length_m": round(length, 2),
        "length_km": round(length / 1000.0, 3)
    }

def create_geojson_polygon(coords: List[Tuple[float, float]], properties: Dict[str, Any] = None) -> Dict[str, Any]:
    closed_coords = list(coords)
    if closed_coords and closed_coords[0] != closed_coords[-1]:
        closed_coords.append(closed_coords[0])
    return {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [closed_coords]
        },
        "properties": properties or {}
    }
