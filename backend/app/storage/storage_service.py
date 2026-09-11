import os
import shutil
from pathlib import Path
from typing import BinaryIO
from app.core.config import settings

class StorageService:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        self.demo_dir = settings.DEMO_DIR
        self.report_dir = settings.REPORT_DIR
        self.preview_dir = settings.PREVIEW_DIR

    def save_upload(self, file_obj: BinaryIO, filename: str) -> Path:
        target_path = self.upload_dir / filename
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file_obj, buffer)
        return target_path

    def save_preview(self, img_bytes: bytes, filename: str) -> Path:
        target_path = self.preview_dir / filename
        with open(target_path, "wb") as f:
            f.write(img_bytes)
        return target_path

    def save_report(self, report_bytes: bytes, filename: str) -> Path:
        target_path = self.report_dir / filename
        with open(target_path, "wb") as f:
            f.write(report_bytes)
        return target_path

    def get_file_path(self, relative_or_absolute: str) -> Path:
        p = Path(relative_or_absolute)
        if p.is_absolute() and p.exists():
            return p
        # Check in uploads, demo, reports, previews
        for d in [self.upload_dir, self.demo_dir, self.report_dir, self.preview_dir]:
            candidate = d / relative_or_absolute
            if candidate.exists():
                return candidate
        return p

storage = StorageService()
