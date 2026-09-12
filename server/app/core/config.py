import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent
# In Vercel serverless runtime or AWS Lambda, the filesystem is read-only except for /tmp
if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
    DATA_DIR = Path("/tmp/satquery_data")
else:
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
    
    # Database configuration with PostgreSQL & Supabase support
    raw_db_url: str = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL") or f"sqlite:///{DATA_DIR}/satquery.db"
    DATABASE_URL: str = raw_db_url.replace("postgres://", "postgresql://", 1) if raw_db_url.startswith("postgres://") else raw_db_url
    
    # Supabase Integration Parameters
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", os.getenv("VITE_SUPABASE_URL", ""))
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", os.getenv("VITE_SUPABASE_ANON_KEY", os.getenv("SUPABASE_KEY", "")))
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_STORAGE_BUCKET: str = os.getenv("SUPABASE_STORAGE_BUCKET", "satellite-images")

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
    try:
        p.mkdir(parents=True, exist_ok=True)
    except Exception:
        pass

