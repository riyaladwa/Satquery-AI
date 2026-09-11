import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR.parent / "data"

class Settings(BaseModel):
    PROJECT_NAME: str = "SatQuery AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    BASE_DIR: Path = BASE_DIR
    DATA_DIR: Path = DATA_DIR
    UPLOAD_DIR: Path = DATA_DIR / "uploads"
    DEMO_DIR: Path = DATA_DIR / "demo"
    REPORT_DIR: Path = DATA_DIR / "reports"
    PREVIEW_DIR: Path = DATA_DIR / "previews"
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DATA_DIR}/satquery.db")
    
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Model parameters
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DEFAULT_LANGUAGE: str = "en"
    SUPPORTED_LANGUAGES: list[str] = ["en", "hi", "kn"]

settings = Settings()

# Ensure directories exist
for p in [settings.DATA_DIR, settings.UPLOAD_DIR, settings.DEMO_DIR, settings.REPORT_DIR, settings.PREVIEW_DIR]:
    p.mkdir(parents=True, exist_ok=True)
