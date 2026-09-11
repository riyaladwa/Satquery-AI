from datetime import datetime
import json
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="analyst")
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("Project", back_populates="user")
    sessions = relationship("AnalysisSession", back_populates="user")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="projects")
    images = relationship("Image", back_populates="project")
    sessions = relationship("AnalysisSession", back_populates="project")
    reports = relationship("Report", back_populates="project")

class Image(Base):
    __tablename__ = "images"
    id = Column(String(64), primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    preview_path = Column(String(512), nullable=True)
    file_size = Column(Integer, default=0)
    file_format = Column(String(32), default="GeoTIFF")
    modality = Column(String(32), default="Optical")  # Optical, SAR, Multispectral
    sensor = Column(String(64), default="Sentinel-2")
    acquisition_date = Column(String(64), nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="images")
    metadata_rel = relationship("ImageMetadata", back_populates="image", uselist=False)
    sessions = relationship("AnalysisSession", back_populates="image")

class ImageMetadata(Base):
    __tablename__ = "image_metadata"
    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(String(64), ForeignKey("images.id"), nullable=False)
    width = Column(Integer, default=0)
    height = Column(Integer, default=0)
    bands = Column(Integer, default=3)
    crs = Column(String(64), default="EPSG:4326")
    resolution_m = Column(Float, default=10.0)
    min_lat = Column(Float, nullable=True)
    max_lat = Column(Float, nullable=True)
    min_lon = Column(Float, nullable=True)
    max_lon = Column(Float, nullable=True)
    cloud_cover = Column(Float, default=0.0)
    mean_brightness = Column(Float, default=128.0)
    contrast_score = Column(Float, default=50.0)
    is_georeferenced = Column(Boolean, default=True)
    extra_tags_json = Column(Text, default="{}")

    image = relationship("Image", back_populates="metadata_rel")

class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"
    id = Column(String(64), primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    image_id = Column(String(64), ForeignKey("images.id"), nullable=True)
    secondary_image_id = Column(String(64), nullable=True)  # For comparison
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(255), default="Satellite Analysis Session")
    analysis_type = Column(String(64), default="General")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="sessions")
    project = relationship("Project", back_populates="sessions")
    image = relationship("Image", back_populates="sessions")
    queries = relationship("QueryLog", back_populates="session")
    results = relationship("AnalysisResult", back_populates="session")
    reports = relationship("Report", back_populates="session")

class QueryLog(Base):
    __tablename__ = "queries"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), ForeignKey("analysis_sessions.id"), nullable=False)
    query_text = Column(Text, nullable=False)
    language = Column(String(10), default="en")
    source = Column(String(20), default="text")  # text, voice
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("AnalysisSession", back_populates="queries")
    result = relationship("AnalysisResult", back_populates="query", uselist=False)

class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    id = Column(String(64), primary_key=True, index=True)
    session_id = Column(String(64), ForeignKey("analysis_sessions.id"), nullable=False)
    query_id = Column(Integer, ForeignKey("queries.id"), nullable=True)
    task_type = Column(String(64), default="VQA")
    answer_text = Column(Text, nullable=False)
    answer_hindi = Column(Text, nullable=True)
    answer_kannada = Column(Text, nullable=True)
    confidence_score = Column(Float, default=85.0)
    reliability_score = Column(String(32), default="High")  # High, Medium, Low
    reliability_reason = Column(Text, nullable=True)
    model_name = Column(String(128), default="SatQuery RS-VLM")
    execution_time_ms = Column(Integer, default=450)
    timeline_json = Column(Text, default="[]")
    metrics_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("AnalysisSession", back_populates="results")
    query = relationship("QueryLog", back_populates="result")
    evidence_regions = relationship("EvidenceRegion", back_populates="result")

class EvidenceRegion(Base):
    __tablename__ = "evidence_regions"
    id = Column(Integer, primary_key=True, index=True)
    result_id = Column(String(64), ForeignKey("analysis_results.id"), nullable=False)
    label = Column(String(128), nullable=False)
    region_type = Column(String(64), default="polygon")  # polygon, bbox, point
    geojson = Column(Text, nullable=False)
    confidence = Column(Float, default=90.0)
    area_sqm = Column(Float, default=0.0)
    attributes_json = Column(Text, default="{}")

    result = relationship("AnalysisResult", back_populates="evidence_regions")

class ModelRun(Base):
    __tablename__ = "model_runs"
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(128), nullable=False)
    model_version = Column(String(32), default="1.0.0")
    task = Column(String(64), nullable=False)
    status = Column(String(32), default="SUCCESS")
    duration_ms = Column(Integer, default=0)
    input_shape = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Report(Base):
    __tablename__ = "reports"
    id = Column(String(64), primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    session_id = Column(String(64), ForeignKey("analysis_sessions.id"), nullable=True)
    title = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_size = Column(Integer, default=0)
    summary_text = Column(Text, nullable=True)
    language = Column(String(10), default="en")
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="reports")
    session = relationship("AnalysisSession", back_populates="reports")

class UserSettings(Base):
    __tablename__ = "user_settings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    theme = Column(String(32), default="dark")
    language = Column(String(10), default="en")
    map_provider = Column(String(64), default="esri-satellite")
    voice_enabled = Column(Boolean, default=True)
    auto_tts = Column(Boolean, default=False)
    confidence_threshold = Column(Float, default=60.0)
    updated_at = Column(DateTime, default=datetime.utcnow)
