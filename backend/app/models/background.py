import uuid
from typing import Dict, Any, Optional
from sqlalchemy import String, Integer, JSON, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from app.models.base import TimestampMixin


class GeneratedBackgroundRecord(Base, TimestampMixin):
    __tablename__ = "generated_backgrounds"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )
    job_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("creative_jobs.id"),
        index=True,
        nullable=False,
    )
    strategy_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("creative_strategies.id"),
        index=True,
        nullable=False,
    )
    brief_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("ad_briefs.id"),
        index=True,
        nullable=True,
    )
    platform: Mapped[str] = mapped_column(
        String(32),
        index=True,
        nullable=False,
    )
    width: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    height: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    aspect_ratio: Mapped[str] = mapped_column(
        String(16),
        nullable=False,
    )
    provider: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )
    model_name: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )
    prompt_spec: Mapped[Dict[str, Any]] = mapped_column(
        JSON,
        nullable=False,
    )
    prompt_version: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
    )
    attempt_number: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )
    storage_key: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )
    qa_status: Mapped[str] = mapped_column(
        String(20),
        index=True,
        nullable=False,
    )
    qa_result: Mapped[Dict[str, Any]] = mapped_column(
        JSON,
        nullable=False,
    )
    cache_key: Mapped[Optional[str]] = mapped_column(
        String(128),
        index=True,
        nullable=True,
    )
    is_cached: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
