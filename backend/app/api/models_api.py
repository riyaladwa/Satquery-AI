from fastapi import APIRouter
from app.models.registry import model_registry

router = APIRouter(prefix="/models", tags=["models"])

@router.get("")
def get_model_registry():
    return {
        "models": model_registry.list_models(),
        "total_active": len(model_registry.list_models()),
        "orchestrator_status": "ONLINE",
        "engine": "Hybrid Specialist / Local Geospatial AI Engine"
    }
