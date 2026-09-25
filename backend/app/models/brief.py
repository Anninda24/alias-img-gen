import uuid
from typing import Optional, Dict, Any, List
from sqlalchemy import String, Float, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin


class AdBrief(Base, TimestampMixin):
    __tablename__ = "ad_briefs"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )
    brand_name: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    product_name: Mapped[str] = mapped_column(String(150), index=True, nullable=False)
    campaign_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="USD", nullable=False)
    platforms: Mapped[List[str]] = mapped_column(JSON, nullable=False)
    validation_status: Mapped[str] = mapped_column(String(20), default="PASS", index=True, nullable=False)
    payload: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    validation_report: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
