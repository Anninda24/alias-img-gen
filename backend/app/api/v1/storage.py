import mimetypes
from pathlib import Path
from fastapi import APIRouter, HTTPException, Response
from app.core.config import settings
from app.providers.storage_provider import get_storage_provider

router = APIRouter(prefix="/storage", tags=["Storage"])


@router.get("/{file_path:path}")
async def serve_stored_file(file_path: str):
    """
    Serves stored assets in local development mode with proper MIME types.
    """
    storage = get_storage_provider()
    try:
        data = await storage.get_bytes(file_path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Requested file not found in storage")

    content_type, _ = mimetypes.guess_type(file_path)
    if not content_type:
        content_type = "application/octet-stream"

    return Response(content=data, media_type=content_type)
