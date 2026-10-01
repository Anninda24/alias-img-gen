from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.health import router as health_router
from app.api.v1.storage import router as storage_router
from app.api.v1.briefs import router as briefs_router
from app.api.v1.assets import router as assets_router
from app.api.v1.strategies import router as strategies_router
from app.api.v1.backgrounds import router as backgrounds_router
from app.api.v1.composites import router as composites_router
from app.api.v1.final_ads import router as final_ads_router
from app.api.v1.jobs import router as jobs_router

api_v1_router = APIRouter()
api_v1_router.include_router(auth_router)
api_v1_router.include_router(health_router)
api_v1_router.include_router(storage_router)
api_v1_router.include_router(briefs_router)
api_v1_router.include_router(assets_router)
api_v1_router.include_router(strategies_router)
api_v1_router.include_router(backgrounds_router)
api_v1_router.include_router(composites_router)
api_v1_router.include_router(final_ads_router)
api_v1_router.include_router(jobs_router)

