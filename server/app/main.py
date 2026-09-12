import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.database.session import init_db
from app.demo.sample_generator import seed_demo_data

from app.api.projects import router as projects_router
from app.api.images import router as images_router
from app.api.analyze import router as analyze_router
from app.api.compare import router as compare_router
from app.api.area import router as area_router
from app.api.reports import router as reports_router
from app.api.models_api import router as models_router
from app.api.history import router as history_router
from app.api.pixel import router as pixel_router
from app.api.scenes import router as scenes_router
from app.api.timeseries import router as timeseries_router
from app.api.benchmark import router as benchmark_router
from app.api.settings_api import router as settings_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and seed demo dataset
    init_db()
    seed_demo_data()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Multimodal Remote Sensing Vision-Language Geospatial Analysis Platform",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for previews and generated reports
app.mount("/previews", StaticFiles(directory=str(settings.PREVIEW_DIR)), name="previews")
app.mount("/reports-files", StaticFiles(directory=str(settings.REPORT_DIR)), name="reports-files")

# Mount API routers
app.include_router(projects_router, prefix=settings.API_V1_STR)
app.include_router(images_router, prefix=settings.API_V1_STR)
app.include_router(analyze_router, prefix=settings.API_V1_STR)
app.include_router(compare_router, prefix=settings.API_V1_STR)
app.include_router(area_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(models_router, prefix=settings.API_V1_STR)
app.include_router(history_router, prefix=settings.API_V1_STR)
app.include_router(pixel_router, prefix=settings.API_V1_STR)
app.include_router(scenes_router, prefix=settings.API_V1_STR)
app.include_router(timeseries_router, prefix=settings.API_V1_STR)
app.include_router(benchmark_router, prefix=settings.API_V1_STR)
app.include_router(settings_router, prefix=settings.API_V1_STR)


@app.get("/api/health")
def health_check():
    return {
        "status": "ONLINE",
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "processing_engine": "ACTIVE",
        "model_registry": "ONLINE",
        "storage": "READY"
    }

@app.get("/")
def root():
    return {
        "message": "SatQuery AI Remote Sensing Backend Gateway",
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
