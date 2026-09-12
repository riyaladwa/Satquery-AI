from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import UserSettings

router = APIRouter(prefix="/settings", tags=["settings"])

class UserSettingsSchema(BaseModel):
    theme: str = "dark"
    language: str = "en"
    map_provider: str = "esri-satellite"
    voice_enabled: bool = True
    auto_tts: bool = False
    confidence_threshold: float = 60.0
    user_id: Optional[str] = None

@router.get("", response_model=UserSettingsSchema)
def get_user_settings(user_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Retrieves user settings for the given user_id, or defaults."""
    query = db.query(UserSettings)
    if user_id:
        settings_rec = query.filter(UserSettings.user_id == user_id).first()
    else:
        settings_rec = query.first()

    if not settings_rec:
        # Create default record if none exists
        settings_rec = UserSettings(
            user_id=user_id,
            theme="dark",
            language="en",
            map_provider="esri-satellite",
            voice_enabled=True,
            auto_tts=False,
            confidence_threshold=60.0
        )
        db.add(settings_rec)
        db.commit()
        db.refresh(settings_rec)

    return UserSettingsSchema(
        theme=settings_rec.theme or "dark",
        language=settings_rec.language or "en",
        map_provider=settings_rec.map_provider or "esri-satellite",
        voice_enabled=settings_rec.voice_enabled if settings_rec.voice_enabled is not None else True,
        auto_tts=settings_rec.auto_tts if settings_rec.auto_tts is not None else False,
        confidence_threshold=settings_rec.confidence_threshold if settings_rec.confidence_threshold is not None else 60.0,
        user_id=settings_rec.user_id
    )

@router.put("", response_model=UserSettingsSchema)
def update_user_settings(payload: UserSettingsSchema, db: Session = Depends(get_db)):
    """Updates user settings in the Supabase/PostgreSQL database."""
    query = db.query(UserSettings)
    if payload.user_id:
        settings_rec = query.filter(UserSettings.user_id == payload.user_id).first()
    else:
        settings_rec = query.first()

    if not settings_rec:
        settings_rec = UserSettings(user_id=payload.user_id)
        db.add(settings_rec)

    settings_rec.theme = payload.theme
    settings_rec.language = payload.language
    settings_rec.map_provider = payload.map_provider
    settings_rec.voice_enabled = payload.voice_enabled
    settings_rec.auto_tts = payload.auto_tts
    settings_rec.confidence_threshold = payload.confidence_threshold
    if payload.user_id:
        settings_rec.user_id = payload.user_id

    db.commit()
    db.refresh(settings_rec)

    return UserSettingsSchema(
        theme=settings_rec.theme,
        language=settings_rec.language,
        map_provider=settings_rec.map_provider,
        voice_enabled=settings_rec.voice_enabled,
        auto_tts=settings_rec.auto_tts,
        confidence_threshold=settings_rec.confidence_threshold,
        user_id=settings_rec.user_id
    )
