from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.storage import router as storage_router
from app.api.v1.briefs import router as briefs_router
from app.api.v1.assets import router as assets_router
from app.api.v1.strategies import router as strategies_router

api_v1_router = APIRouter()
api_v1_router.include_router(health_router)
api_v1_router.include_router(storage_router)
api_v1_router.include_router(briefs_router)
api_v1_router.include_router(assets_router)
api_v1_router.include_router(strategies_router)
