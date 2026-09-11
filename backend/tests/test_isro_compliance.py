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

# ----------------------------------------------------------------------
# SCENARIO 1: SINGLE-IMAGE VQA
# ----------------------------------------------------------------------
def test_scenario_1_single_image_vqa():
    """
    Mandatory Capability 1:
    Upload one Sentinel-2 image.
    Ask: 'Describe the major land cover and objects visible.'
    Return: Answer + visual evidence + confidence.
    """
    # Test 1A: General VQA
    resp = client.post(
        "/api/analyze",
        json={
            "image_id": "img-dublin-s2-2026",
            "query": "Describe the major land cover and objects visible in this scene.",
            "language": "en"
        }
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["task_type"] in ["VQA", "Scene Description"]
    assert len(data["answer"]) > 20
    assert data["confidence_score"] >= 85.0
    assert len(data["evidence_regions"]) > 0
    assert "urban" in data["answer"].lower() or "built-up" in data["answer"].lower() or "water" in data["answer"].lower()

    # Verify timeline has observable steps
    step_names = [t["step"] for t in data["timeline"]]
    assert "Task identified" in step_names
    assert "Input identified" in step_names
    assert "Specialist selected" in step_names
    assert "Confidence estimated" in step_names

    # Test 1B: Existence query - "Is there a water body?"
    resp_water = client.post(
        "/api/analyze",
        json={
            "image_id": "img-dublin-s2-2026",
            "query": "Is there a water body?",
            "language": "en"
        }
    )
    assert resp_water.status_code == 200
    data_water = resp_water.json()
    assert "water" in data_water["answer"].lower()
    assert len(data_water["evidence_regions"]) > 0
    assert data_water["evidence_regions"][0]["area_hectares"] > 0

    # Test 1C: Existence query - "Are there buildings?"
    resp_bld = client.post(
        "/api/analyze",
        json={
            "image_id": "img-dublin-s2-2026",
            "query": "Are there buildings in this image?",
            "language": "en"
        }
    )
    assert resp_bld.status_code == 200
    data_bld = resp_bld.json()
    assert "built-up" in data_bld["answer"].lower() or "building" in data_bld["answer"].lower()


# ----------------------------------------------------------------------
# SCENARIO 2: SINGLE-IMAGE TEXT-GUIDED GROUNDING
# ----------------------------------------------------------------------
def test_scenario_2_text_guided_grounding():
    """
    Mandatory Capability 2:
    Upload one image.
    Ask: 'Highlight the water body.'
    Return: Highlighted region on map + answer + confidence.
    """
    resp = client.post(
        "/api/analyze",
        json={
            "image_id": "img-dublin-s2-2026",
            "query": "Highlight the water body.",
            "language": "en"
        }
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["task_type"] == "Grounding"
    assert "highlighted" in data["answer"].lower() or "grounded" in data["answer"].lower()
    assert len(data["evidence_regions"]) > 0

    grounded_region = data["evidence_regions"][0]
    assert "water" in grounded_region["label"].lower() or "water" in grounded_region["type"].lower()
    assert len(grounded_region["coordinates"]) >= 3  # Valid polygon
    assert grounded_region["area_hectares"] > 0
    assert grounded_region["confidence"] >= 90.0

    # Verify building grounding as well
    resp_bld = client.post(
        "/api/analyze",
        json={
            "image_id": "img-dublin-s2-2026",
            "query": "Highlight the buildings and structures.",
            "language": "en"
        }
    )
    assert resp_bld.status_code == 200
    assert resp_bld.json()["task_type"] == "Grounding"
    assert len(resp_bld.json()["evidence_regions"]) > 0


# ----------------------------------------------------------------------
# SCENARIO 3: BI-TEMPORAL CHANGE ANALYSIS
# ----------------------------------------------------------------------
def test_scenario_3_bitemporal_change():
    """
    Mandatory Capability 3:
    Upload two images of the same area from different dates (2023 vs 2026).
    Ask: 'What changed between these two dates?'
    Return: Change description + change heatmap/evidence + changed area + confidence.
    """
    resp = client.post(
        "/api/analyze",
        json={
            "image_id": "img-dublin-s2-2023",
            "secondary_image_id": "img-dublin-s2-2026",
            "query": "What changed between these two dates?",
            "language": "en"
        }
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["task_type"] == "Change Detection"
    assert "expansion" in data["answer"].lower() or "change" in data["answer"].lower()
    assert "metrics" in data
    assert "change_percentage" in data["metrics"]
    assert data["metrics"]["change_percentage"] > 0
    assert len(data["evidence_regions"]) >= 2  # Spatial change clusters
    assert data["detected_area"]["hectares"] > 0
    assert data["confidence_score"] >= 88.0


# ----------------------------------------------------------------------
# SCENARIO 4: CROSS-MODAL OPTICAL + SAR JOINT ANALYSIS
# ----------------------------------------------------------------------
def test_scenario_4_optical_sar_joint():
    """
    Mandatory Capability 4:
    Upload co-registered Sentinel-2 (Optical) + Sentinel-1 (SAR).
    Ask: 'Use both images to identify built-up and water-covered regions.'
    Return: Combined analysis + map evidence + explanation + confidence.
    """
    resp = client.post(
        "/api/analyze",
        json={
            "image_id": "img-dublin-s2-2026",
            "secondary_image_id": "img-dublin-s1-2026",
            "query": "Use both images to identify built-up and water-covered regions.",
            "language": "en"
        }
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["task_type"] == "Optical + SAR"
    assert "consensus" in data["answer"].lower() or "agreement" in data["answer"].lower()
    assert "metrics" in data
    assert "sensor_agreement_percentage" in data["metrics"]
    assert data["metrics"]["sensor_agreement_percentage"] >= 80.0
    assert len(data["evidence_regions"]) >= 2

    # Verify SAR backscatter and optical reflectance are both referenced in explanation
    assert "backscatter" in data["why_result"].lower() or "sar" in data["answer"].lower()


# ----------------------------------------------------------------------
# SCENARIO 5: AGENTIC ROUTING & AUDITABLE EXECUTION TIMELINE
# ----------------------------------------------------------------------
def test_scenario_5_agentic_routing_and_timeline():
    """
    Mandatory Capability 5:
    Ask different questions using different input configurations.
    Agent must dynamically select different specialist models and produce
    an auditable timeline with real backend operations (no fabrication).
    """
    # 1. Single Optical VQA -> VQA Specialist
    vqa_resp = client.post(
        "/api/analyze",
        json={"image_id": "img-dublin-s2-2026", "query": "Is there a water body?", "language": "en"}
    ).json()
    assert "VQA" in vqa_resp["model_name"] or "vqa" in vqa_resp["model_name"].lower()

    # 2. Grounding query -> GROUNDING_MODEL
    ground_resp = client.post(
        "/api/analyze",
        json={"image_id": "img-dublin-s2-2026", "query": "Highlight the water body", "language": "en"}
    ).json()
    assert "Grounder" in ground_resp["model_name"] or "ground" in ground_resp["task_type"].lower()

    # 3. Bi-temporal change -> CHANGE_ANALYSIS_MODEL
    change_resp = client.post(
        "/api/analyze",
        json={"image_id": "img-dublin-s2-2023", "secondary_image_id": "img-dublin-s2-2026", "query": "What changed?", "language": "en"}
    ).json()
    assert "Change" in change_resp["model_name"] or "change" in change_resp["task_type"].lower()

    # 4. Cross-modal Optical + SAR -> OPTICAL_SAR_ANALYSIS_MODEL
    fusion_resp = client.post(
        "/api/analyze",
        json={"image_id": "img-dublin-s2-2026", "secondary_image_id": "img-dublin-s1-2026", "query": "Use optical and SAR together", "language": "en"}
    ).json()
    assert "Fusion" in fusion_resp["model_name"] or "Optical + SAR" in fusion_resp["task_type"]

    # 5. Check timeline auditability
    timeline = fusion_resp["timeline"]
    steps = [t["step"] for t in timeline]
    assert "Task identified" in steps
    assert "Input identified" in steps
    assert "Modalities" in steps
    assert "Specialist selected" in steps
    assert "Spatial evidence generated" in steps
    assert "Area calculated" in steps
    assert "Confidence estimated" in steps
    assert "Final answer generated" in steps


# ----------------------------------------------------------------------
# INPUT VALIDATION & CO-REGISTRATION CHECK
# ----------------------------------------------------------------------
def test_incompatible_spatial_pair_rejection():
    """
    Mandatory Input Validation:
    If two images with zero/negligible spatial overlap are paired,
    the backend must reject with a user-facing error message:
    'These images cannot be used for paired analysis because their geographic coverage does not match.'
    """
    images_resp = client.get("/api/images").json()
    dublin_img = next(i for i in images_resp if "dublin" in i["id"])
    non_dublin_img = next((i for i in images_resp if "dublin" not in i["id"]), None)

    if non_dublin_img:
        resp = client.post(
            "/api/analyze",
            json={
                "image_id": dublin_img["id"],
                "secondary_image_id": non_dublin_img["id"],
                "query": "Compare these two scenes.",
                "language": "en"
            }
        )
        assert resp.status_code == 400
        assert "geographic coverage does not match" in resp.json()["detail"]


# ----------------------------------------------------------------------
# BENCHMARK EVALUATION ENDPOINT (VRSBench / RSVQA / CDVQA)
# ----------------------------------------------------------------------
def test_benchmark_evaluate_api():
    """
    Tests programmatic evaluation on public benchmark datasets (RSVQA, CDVQA).
    """
    # Test supported benchmarks metadata
    sup_resp = client.get("/api/benchmark/supported")
    assert sup_resp.status_code == 200
    b_ids = [b["id"] for b in sup_resp.json()["benchmarks"]]
    assert "RSVQA" in b_ids
    assert "VRSBench" in b_ids
    assert "CDVQA" in b_ids
    assert "ISRO-SAC-2026" in b_ids

    # Test evaluating a single benchmark item
    eval_resp = client.post(
        "/api/benchmark/evaluate",
        json={
            "benchmark_name": "RSVQA",
            "question_id": "rsvqa-test-101",
            "image_id": "img-dublin-s2-2026",
            "query": "Is there a water body?",
            "ground_truth_answer": "Yes, water is present."
        }
    )
    assert eval_resp.status_code == 200
    eval_data = eval_resp.json()
    assert eval_data["question_id"] == "rsvqa-test-101"
    assert eval_data["benchmark_name"] == "RSVQA"
    assert eval_data["prediction"] is not None
    assert eval_data["confidence"] > 80.0
    assert eval_data["score"] is not None  # Matched ground truth
    assert eval_data["latency_ms"] >= 0
