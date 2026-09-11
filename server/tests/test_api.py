import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import init_db
from app.demo.sample_generator import seed_demo_data

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    init_db()
    seed_demo_data()

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ONLINE"
    assert "SatQuery AI" in data["platform"]

def test_list_projects():
    response = client.get("/api/projects")
    assert response.status_code == 200
    projects = response.json()
    assert len(projects) >= 1

def test_list_images():
    response = client.get("/api/images")
    assert response.status_code == 200
    images = response.json()
    assert len(images) >= 4
    first_img = images[0]
    assert "id" in first_img
    assert "modality" in first_img
    assert first_img["metadata"] is not None

def test_area_calculation():
    payload = {
        "coordinates": [
            [77.60, 12.93],
            [77.61, 12.93],
            [77.61, 12.94],
            [77.60, 12.94]
        ]
    }
    response = client.post("/api/area/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["area_hectares"] > 100

def test_agent_analyze_query():
    images = client.get("/api/images").json()
    img_id = images[0]["id"]
    
    payload = {
        "image_id": img_id,
        "query": "Highlight water bodies and determine their coverage",
        "language": "en"
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["task_type"] in ["Grounding", "Land Cover", "VQA"]
    assert len(data["evidence_regions"]) >= 1
    assert data["confidence_score"] > 80
    assert len(data["timeline"]) >= 5

def test_compare_bitemporal():
    images = client.get("/api/images").json()
    blr_2023 = next((i for i in images if "2023" in i["filename"]), images[0])
    blr_2026 = next((i for i in images if "2026" in i["filename"]), images[1])

    response = client.get(f"/api/compare/bitemporal?image_a_id={blr_2023['id']}&image_b_id={blr_2026['id']}")
    assert response.status_code == 200
    data = response.json()
    assert "change_percentage" in data
    assert len(data["evidence_regions"]) >= 1

def test_report_generation():
    images = client.get("/api/images").json()
    img_id = images[0]["id"]

    payload = {
        "image_id": img_id,
        "query": "Evaluate urban growth and built-up land",
        "answer_en": "Built-up infrastructure expanded by 18.4% across the eastern sector.",
        "confidence_score": 91.0,
        "reliability_score": "High",
        "task_type": "Urban Growth Analysis",
        "model_name": "Bi-Temporal ChangeNet v4.0",
        "evidence_regions": [
            {
                "label": "Eastern Arterial Expansion",
                "type": "Built-up",
                "area_hectares": 42.5,
                "area_sqkm": 0.425,
                "confidence": 92.0
            }
        ]
    }
    response = client.post("/api/reports/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "report_id" in data
    assert data["download_url"].startswith("/api/reports/")

def test_pixel_inspect():
    images = client.get("/api/images").json()
    img_id = images[0]["id"]
    response = client.get(f"/api/pixel/inspect?image_id={img_id}&lat=53.3472&lon=-6.2439")
    assert response.status_code == 200
    data = response.json()
    assert "bands" in data
    assert "B02" in data["bands"]
    assert "B04" in data["bands"]
    assert "B08" in data["bands"]
    assert "indices" in data
    assert "NDVI" in data["indices"]
    assert "NDWI" in data["indices"]
    assert "elevation_m" in data

def test_scenes_search():
    response = client.get("/api/scenes/search?satellite=Sentinel-2")
    assert response.status_code == 200
    scenes = response.json()
    assert len(scenes) >= 1
    assert any(s["satellite"] == "Sentinel-2" for s in scenes)
    assert any("30UUE" in s["tile"] for s in scenes)

    response_sar = client.get("/api/scenes/search?satellite=Sentinel-1")
    assert response_sar.status_code == 200
    sar_scenes = response_sar.json()
    assert any(s["satellite"] == "Sentinel-1" for s in sar_scenes)

def test_timeseries():
    response = client.get("/api/timeseries?tile=30UUE&lat=53.3472&lon=-6.2439")
    assert response.status_code == 200
    data = response.json()
    assert "data_points" in data
    assert len(data["data_points"]) >= 4
    assert any(dp["year"] == "2026" for dp in data["data_points"])
    assert "trend_summary" in data

