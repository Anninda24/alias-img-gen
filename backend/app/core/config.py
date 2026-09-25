from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path


class Settings(BaseSettings):
    PROJECT_NAME: str = "Alias Img-Gen"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database configuration
    # Defaults to local async SQLite for frictionless local reproduction.
    # Set to postgresql+asyncpg://user:pass@localhost:5432/dbname for PostgreSQL.
    DATABASE_URL: str = "sqlite+aiosqlite:///./alias_imggen.db"

    # CORS configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]

    # Storage configuration
    STORAGE_TYPE: str = "local"  # "local" or "s3"
    LOCAL_STORAGE_PATH: str = "./storage"
    STORAGE_PUBLIC_URL_PREFIX: str = "/api/v1/storage"

    # Worker configuration
    WORKER_TYPE: str = "async"  # "async" (in-process for dev) or "celery" (production)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
