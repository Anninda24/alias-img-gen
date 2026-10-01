"""
Vision Verification Service.

Cost-controlled orchestrator for the final-ad vision QA step.

Architecture:
  AI generation -> cheap deterministic QA -> retry if needed
  -> deterministic composite -> final render -> ONE vision QA call

Cost controls:
  - Disabled by default (ENABLE_VISION_QA=False in config).
  - Only runs after the FINAL rendered advertisement, never after intermediate stages.
  - Configurable max calls per pipeline run (VISION_QA_MAX_CALLS_PER_PIPELINE).
  - Records exact expected-value payload sent for audit.
  - Advisory: vision result DOES NOT override deterministic QA status.

Dependency invalidation:
  - When a deterministic upstream input changes (product, background, composite),
    any downstream final ad must be marked stale.
  - vision_qa_status is cleared when an ad is re-rendered from a changed input.
"""
import time
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from app.core.logging import logger
from app.core.config import settings
from app.schemas.background import QAStatus
from app.schemas.vision_verification import VisionVerificationResult


class VisionVerificationService:
    """
    Orchestrates vision QA with strict cost controls.

    Usage:
        service = VisionVerificationService(provider)
        result = await service.verify_final_ad(
            image_bytes=rendered_bytes,
            expected_values=expected_payload,
        )
        # result is None if vision QA is disabled or quota exceeded
    """

    def __init__(self, provider=None):
        from app.providers.mock_vision_provider import MockVisionQAProvider
        self._provider = provider or MockVisionQAProvider()
        self._calls_this_pipeline = 0

    def reset_pipeline_quota(self) -> None:
        """Reset per-pipeline call counter. Call at the start of each new pipeline run."""
        self._calls_this_pipeline = 0

    @property
    def is_enabled(self) -> bool:
        return settings.ENABLE_VISION_QA

    async def verify_final_ad(
        self,
        image_bytes: bytes,
        expected_values: Dict[str, Any],
        pipeline_call_count: int = 0,
    ) -> Optional[VisionVerificationResult]:
        """
        Run vision QA on the rendered final advertisement.

        Returns VisionVerificationResult if vision QA is enabled and quota permits,
        otherwise returns None (deterministic QA still runs regardless).

        Cost controls enforced:
        - ENABLE_VISION_QA must be True
        - pipeline_call_count must be < VISION_QA_MAX_CALLS_PER_PIPELINE
        """
        if not self.is_enabled:
            logger.debug("[VisionQA] Disabled by ENABLE_VISION_QA=False. Skipping.")
            return None

        max_calls = settings.VISION_QA_MAX_CALLS_PER_PIPELINE
        if pipeline_call_count >= max_calls:
            logger.warning(
                f"[VisionQA] Pipeline quota reached ({pipeline_call_count}/{max_calls}). "
                "Skipping vision call to control cost."
            )
            return None

        if not image_bytes:
            logger.warning("[VisionQA] Empty image bytes. Skipping vision call.")
            return None

        logger.info(
            f"[VisionQA] Running final-ad vision verification. "
            f"call={pipeline_call_count + 1}/{max_calls} "
            f"provider={settings.VISION_QA_PROVIDER}"
        )

        start = time.monotonic()
        try:
            raw = await self._provider.evaluate_creative(
                image_bytes=image_bytes,
                spec=expected_values,
            )
        except Exception as exc:
            logger.error(f"[VisionQA] Provider call failed: {exc}. Returning WARNING advisory.")
            # Fail safe: return WARNING, do not block the pipeline on provider failures
            from app.schemas.vision_verification import (
                VisionCheckResult, VisionVerificationChecks
            )
            def _warn_check(detail: str) -> VisionCheckResult:
                return VisionCheckResult(passed=False, severity=QAStatus.WARNING, detail=detail)
            def _pass_check() -> VisionCheckResult:
                return VisionCheckResult(passed=True, severity=QAStatus.PASS)

            fail_checks = VisionVerificationChecks(
                text_readable=_warn_check("Vision provider unavailable"),
                text_no_clipping=_pass_check(),
                text_no_unexpected_content=_pass_check(),
                product_visible=_pass_check(),
                product_placement_reasonable=_pass_check(),
                product_no_corruption=_pass_check(),
                composition_hierarchy=_pass_check(),
                composition_no_clutter=_pass_check(),
                branding_colors_present=_pass_check(),
                branding_no_unauthorized=_pass_check(),
                no_ai_artifacts=_pass_check(),
                no_watermarks=_pass_check(),
            )
            return VisionVerificationResult(
                status=QAStatus.WARNING,
                checks=fail_checks,
                issues=[],
                warnings=[f"Vision QA provider error: {exc}"],
                summary="Vision QA skipped due to provider error. Deterministic QA is authoritative.",
                advisory=True,
                provider=settings.VISION_QA_PROVIDER,
                model_name="unavailable",
                latency_ms=int((time.monotonic() - start) * 1000),
                verified_at=datetime.now(timezone.utc).isoformat(),
                expected_values_sent=expected_values,
            )

        latency_ms = int((time.monotonic() - start) * 1000)

        # Parse and enrich with timestamp
        if isinstance(raw, dict):
            from app.schemas.vision_verification import VisionVerificationResult as VVR
            raw["verified_at"] = datetime.now(timezone.utc).isoformat()
            raw["latency_ms"] = latency_ms
            result = VVR.model_validate(raw)
        else:
            result = raw

        logger.info(
            f"[VisionQA] Result: status={result.status.value} "
            f"issues={len(result.issues)} warnings={len(result.warnings)} "
            f"latency={latency_ms}ms advisory={result.advisory}"
        )

        return result


def build_expected_values_payload(
    platform: str,
    aspect_ratio: str,
    width: int,
    height: int,
    headline: str,
    subheadline: str,
    cta: str,
    offer_text: Optional[str] = None,
    brand_primary_color: Optional[str] = None,
    logo_url: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Build the compact expected-value payload sent to the vision model.
    Only includes what the vision model should inspect -- no unnecessary pipeline history.
    """
    payload: Dict[str, Any] = {
        "platform": platform,
        "aspect_ratio": aspect_ratio,
        "dimensions": {"width": width, "height": height},
        "expected_text": {
            "headline": headline,
            "subheadline": subheadline,
            "cta": cta,
        },
    }
    if offer_text:
        payload["expected_text"]["offer"] = offer_text
    if brand_primary_color:
        payload["brand_primary_color"] = brand_primary_color
    if logo_url:
        payload["logo_present"] = True
    return payload


# Singleton for the current provider (swappable for tests)
def get_vision_verification_service() -> VisionVerificationService:
    """
    Factory: returns the configured VisionVerificationService.
    In dev: MockVisionQAProvider (no API calls).
    In prod: set VISION_QA_PROVIDER=google_gemini and import the real provider.
    """
    provider_name = settings.VISION_QA_PROVIDER.lower()
    if provider_name == "mock":
        from app.providers.mock_vision_provider import MockVisionQAProvider
        provider = MockVisionQAProvider()
    else:
        # Future: load real Gemini Vision provider from a registry
        logger.warning(
            f"[VisionQA] Unknown provider '{provider_name}', falling back to mock. "
            "Implement app.providers.gemini_vision_provider.GeminiVisionQAProvider "
            "and register it here."
        )
        from app.providers.mock_vision_provider import MockVisionQAProvider
        provider = MockVisionQAProvider()

    return VisionVerificationService(provider=provider)
