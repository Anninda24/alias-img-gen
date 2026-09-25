import os
from pathlib import Path
from typing import Optional
from app.core.config import settings
from app.core.logging import logger
from app.providers.base import StorageProvider


class LocalStorageProvider(StorageProvider):
    """
    Local filesystem storage provider for frictionless offline development.
    """

    def __init__(self, base_dir: Optional[str] = None):
        self.base_dir = Path(base_dir or settings.LOCAL_STORAGE_PATH)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _resolve_path(self, key: str) -> Path:
        # Sanitize path to prevent directory traversal
        sanitized = os.path.normpath(key).lstrip("/\\")
        return self.base_dir / sanitized

    async def save_bytes(self, data: bytes, key: str, content_type: str = "image/png") -> str:
        target_path = self._resolve_path(key)
        target_path.parent.mkdir(parents=True, exist_ok=True)
        target_path.write_bytes(data)
        logger.info(f"Saved {len(data)} bytes to storage key: {key}")
        return key

    async def get_bytes(self, key: str) -> bytes:
        target_path = self._resolve_path(key)
        if not target_path.exists():
            raise FileNotFoundError(f"Storage key not found: {key}")
        return target_path.read_bytes()

    async def get_public_url(self, key: str) -> str:
        clean_key = os.path.normpath(key).replace("\\", "/").lstrip("/")
        return f"{settings.STORAGE_PUBLIC_URL_PREFIX}/{clean_key}"

    async def exists(self, key: str) -> bool:
        return self._resolve_path(key).exists()


_storage_instance: Optional[StorageProvider] = None


def get_storage_provider() -> StorageProvider:
    global _storage_instance
    if _storage_instance is None:
        if settings.STORAGE_TYPE == "local":
            _storage_instance = LocalStorageProvider()
        else:
            # Future: S3 / Cloudflare R2 provider
            _storage_instance = LocalStorageProvider()
    return _storage_instance
