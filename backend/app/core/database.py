from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings
from app.core.logging import logger


# -----------------------------------------------------------------------------
# ARCHITECTURAL NOTE (PHASE 4.1 HARDENING):
# SQLite, aiosqlite, and Base.metadata.create_all() are development/MVP
# implementations intended for zero-setup local execution and offline testing.
# Production deployment will migrate to managed PostgreSQL (e.g. Cloud SQL / RDS)
# with Alembic migration scripts, connection pooling, and multi-region read replicas.
# -----------------------------------------------------------------------------

class Base(DeclarativeBase):
    pass


# Create async engine.
# Note: SQLite async requires 'connect_args={"check_same_thread": False}'
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    connect_args=connect_args,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db() -> None:
    logger.info("Initializing database schema...")
    import app.models  # Ensure all SQLAlchemy models are registered
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schema initialized successfully.")
