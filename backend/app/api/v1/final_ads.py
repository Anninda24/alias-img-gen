from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.logging import logger
from app.models.final_ad import FinalRenderedCreativeRecord
from app.schemas.background import QAStatus
from app.schemas.final_ad import (
    FinalAdGenerateRequest,
    FinalAdRegenerateRequest,
    FinalAdResponse,
    FinalAdQAResult,
    TypographyStyle,
    CTAStyle,
    PriceBadgeStyle,
    ReadabilityEnhancementConfig,
)
from app.schemas.platform import TargetPlatform
from app.services.final_ad_service import FinalAdService
from app.providers.storage_provider import get_storage_provider


router = APIRouter(prefix="/final-ads", tags=["Phase 6: Deterministic Final Advertisement Rendering"])


@router.post("/generate", response_model=FinalAdResponse, status_code=status.HTTP_200_OK)
async def generate_final_ad(
    request: FinalAdGenerateRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Phase 6 Deterministic Final Advertisement Rendering.
    Overlays approved typography, CTA, brand elements, and price badges onto the approved composite.
    Strictly enforces all preceding pipeline gates (Brief, Asset, Strategy, Background, Composite).
    """
    logger.info(f"Received final ad render request for composite: {request.composite_id}")

    record = await FinalAdService.render_final_ad(
        db=db,
        composite_id=request.composite_id,
        typography_style=request.typography,
        cta_style=request.cta,
        price_badge_style=request.price_badge,
        readability_config=request.readability,
        force_regenerate=request.force_regenerate,
    )

    storage = get_storage_provider()
    image_url = await storage.get_public_url(record.storage_key)

    return FinalAdResponse(
        id=record.id,
        job_id=record.job_id,
        strategy_id=record.strategy_id,
        brief_id=record.brief_id,
        composite_id=record.composite_id,
        background_id=record.background_id,
        platform=TargetPlatform(record.platform),
        width=record.width,
        height=record.height,
        aspect_ratio=record.aspect_ratio,
        image_url=image_url,
        copy_spec=record.copy_spec,
        typography_spec=record.typography_spec,
        cta_spec=record.cta_spec,
        logo_spec=record.logo_spec,
        price_badge_spec=record.price_badge_spec,
        readability_spec=record.readability_spec,
        provenance_chain=record.provenance_chain,
        qa_status=QAStatus(record.qa_status),
        qa_result=FinalAdQAResult.model_validate(record.qa_result),
        attempt_number=record.attempt_number,
        is_cached=record.is_cached,
        created_at=record.created_at.isoformat() if hasattr(record.created_at, "isoformat") else str(record.created_at),
    )


@router.get("/{final_ad_id}", response_model=FinalAdResponse, status_code=status.HTTP_200_OK)
async def get_final_ad(
    final_ad_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieves a persisted FinalRenderedCreativeRecord by ID."""
    record = await db.get(FinalRenderedCreativeRecord, final_ad_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"FinalRenderedCreativeRecord with id '{final_ad_id}' not found.",
        )

    storage = get_storage_provider()
    image_url = await storage.get_public_url(record.storage_key)

    return FinalAdResponse(
        id=record.id,
        job_id=record.job_id,
        strategy_id=record.strategy_id,
        brief_id=record.brief_id,
        composite_id=record.composite_id,
        background_id=record.background_id,
        platform=TargetPlatform(record.platform),
        width=record.width,
        height=record.height,
        aspect_ratio=record.aspect_ratio,
        image_url=image_url,
        copy_spec=record.copy_spec,
        typography_spec=record.typography_spec,
        cta_spec=record.cta_spec,
        logo_spec=record.logo_spec,
        price_badge_spec=record.price_badge_spec,
        readability_spec=record.readability_spec,
        provenance_chain=record.provenance_chain,
        qa_status=QAStatus(record.qa_status),
        qa_result=FinalAdQAResult.model_validate(record.qa_result),
        attempt_number=record.attempt_number,
        is_cached=record.is_cached,
        created_at=record.created_at.isoformat() if hasattr(record.created_at, "isoformat") else str(record.created_at),
    )


@router.post("/{final_ad_id}/regenerate", response_model=FinalAdResponse, status_code=status.HTTP_200_OK)
async def regenerate_final_ad(
    final_ad_id: str,
    request: FinalAdRegenerateRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Deterministic layout recomposition for Phase 6.
    Re-renders typography, CTA, and badge elements with updated parameters.
    Bypasses cache and generates a new attempt.
    """
    existing = await db.get(FinalRenderedCreativeRecord, final_ad_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"FinalRenderedCreativeRecord with id '{final_ad_id}' not found.",
        )

    typo_style = request.typography or TypographyStyle.model_validate(existing.typography_spec)
    cta_style = request.cta or CTAStyle.model_validate(existing.cta_spec.get("style", {})) if existing.cta_spec else None
    badge_style = request.price_badge or (PriceBadgeStyle() if existing.price_badge_spec else None)
    read_cfg = request.readability or ReadabilityEnhancementConfig()

    record = await FinalAdService.render_final_ad(
        db=db,
        composite_id=existing.composite_id,
        typography_style=typo_style,
        cta_style=cta_style,
        price_badge_style=badge_style,
        readability_config=read_cfg,
        force_regenerate=True,
    )

    storage = get_storage_provider()
    image_url = await storage.get_public_url(record.storage_key)

    return FinalAdResponse(
        id=record.id,
        job_id=record.job_id,
        strategy_id=record.strategy_id,
        brief_id=record.brief_id,
        composite_id=record.composite_id,
        background_id=record.background_id,
        platform=TargetPlatform(record.platform),
        width=record.width,
        height=record.height,
        aspect_ratio=record.aspect_ratio,
        image_url=image_url,
        copy_spec=record.copy_spec,
        typography_spec=record.typography_spec,
        cta_spec=record.cta_spec,
        logo_spec=record.logo_spec,
        price_badge_spec=record.price_badge_spec,
        readability_spec=record.readability_spec,
        provenance_chain=record.provenance_chain,
        qa_status=QAStatus(record.qa_status),
        qa_result=FinalAdQAResult.model_validate(record.qa_result),
        attempt_number=record.attempt_number,
        is_cached=record.is_cached,
        created_at=record.created_at.isoformat() if hasattr(record.created_at, "isoformat") else str(record.created_at),
    )
