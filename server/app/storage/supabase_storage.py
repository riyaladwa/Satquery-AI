import logging
from typing import Optional
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

def is_supabase_storage_enabled() -> bool:
    """Returns True if Supabase URL and keys are configured."""
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
    return bool(settings.SUPABASE_URL and key and not "placeholder" in settings.SUPABASE_URL.lower())

def _get_headers(content_type: Optional[str] = None) -> dict:
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
    headers = {
        "Authorization": f"Bearer {key}",
        "apikey": key
    }
    if content_type:
        headers["Content-Type"] = content_type
    return headers

def ensure_bucket_exists() -> bool:
    """Proactively ensures the storage bucket exists on Supabase."""
    if not is_supabase_storage_enabled():
        return False
    bucket = settings.SUPABASE_STORAGE_BUCKET
    url = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/bucket"
    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.post(
                url,
                headers=_get_headers("application/json"),
                json={"id": bucket, "name": bucket, "public": True}
            )
            return res.status_code in (200, 201, 400, 409)
    except Exception as e:
        logger.warning(f"Could not check Supabase bucket creation: {e}")
        return False

def upload_bytes_to_supabase(
    path: str,
    data: bytes,
    content_type: str = "application/octet-stream"
) -> Optional[str]:
    """
    Uploads raw bytes to Supabase Storage bucket and returns the public CDN URL.
    Falls back gracefully if Supabase is unreachable or credentials are not configured.
    """
    if not is_supabase_storage_enabled():
        return None

    clean_path = path.lstrip('/')
    bucket = settings.SUPABASE_STORAGE_BUCKET
    base_url = settings.SUPABASE_URL.rstrip('/')
    upload_url = f"{base_url}/storage/v1/object/{bucket}/{clean_path}"
    public_url = f"{base_url}/storage/v1/object/public/{bucket}/{clean_path}"

    headers = _get_headers(content_type)
    headers["x-upsert"] = "true"

    try:
        with httpx.Client(timeout=30.0) as client:
            # Upload with upsert enabled
            res = client.post(upload_url, headers=headers, content=data)
            if res.status_code in (200, 201):
                logger.info(f"Uploaded {clean_path} to Supabase Storage: {public_url}")
                return public_url
            
            # If 400 duplicate and upsert header wasn't accepted, try PUT
            if res.status_code == 400 or res.status_code == 409:
                put_res = client.put(upload_url, headers=headers, content=data)
                if put_res.status_code in (200, 201):
                    return public_url

            logger.warning(f"Supabase upload returned {res.status_code}: {res.text}")
            return None
    except Exception as e:
        logger.error(f"Error uploading {clean_path} to Supabase Storage: {e}")
        return None

def download_bytes_from_supabase(path: str) -> Optional[bytes]:
    """Downloads raw bytes from Supabase Storage."""
    if not is_supabase_storage_enabled():
        return None

    clean_path = path.lstrip('/')
    bucket = settings.SUPABASE_STORAGE_BUCKET
    base_url = settings.SUPABASE_URL.rstrip('/')
    download_url = f"{base_url}/storage/v1/object/{bucket}/{clean_path}"

    try:
        with httpx.Client(timeout=30.0) as client:
            res = client.get(download_url, headers=_get_headers())
            if res.status_code == 200:
                return res.content
            return None
    except Exception as e:
        logger.error(f"Error downloading {clean_path} from Supabase: {e}")
        return None
