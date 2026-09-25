# Alias Img-Gen: AI Advertisement Creative Automation Platform

> **"AI decides the creative direction. Deterministic code controls the final advertisement."**
> **"Validate → Understand → Strategize → Generate → Composite → Render → Validate → Approve"**

---

## Phase 1 Overview

Phase 1 establishes the core engineering foundations of the platform:
- **FastAPI backend** with async database support (PostgreSQL ready via `asyncpg`, zero-broker SQLite fallback via `aiosqlite` for local dev).
- **Next.js 16 (App Router + React 19 + TypeScript + Tailwind CSS)** modern SaaS dashboard shell with live health telemetry.
- **Provider abstractions** (`StorageProvider`, `LLMStrategyProvider`, `ImageGenProvider`, `VisionQAProvider`, and `JobWorker`).
- **Mock providers** for local zero-cost testing and validation.
- **Local storage abstraction** with safe path resolution and public URL endpoint (`/api/v1/storage/{path}`).
- **In-process async background worker pool** for frictionless local development without requiring Redis or Celery.
- **Comprehensive test suite** with pytest covering health checks, storage lifecycle, mock providers, and async worker execution.

---

## Project Structure

```text
Alias_Img-Gen/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Health, Status, Storage serving routes
│   │   ├── core/            # Configuration, Database engine, Logging
│   │   ├── models/          # SQLAlchemy ORM declarative models (CreativeJob, etc.)
│   │   ├── providers/       # Storage, LLM, ImageGen, and VisionQA interfaces & mocks
│   │   ├── schemas/         # Pydantic v2 schemas
│   │   ├── services/        # Async background worker pool
│   │   └── main.py          # FastAPI application entrypoint
│   ├── tests/               # Pytest async test suite
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js 16 App Router pages
│   │   ├── components/      # Sidebar, Header, HealthDashboard
│   │   └── lib/             # API client, TypeScript types
│   ├── package.json
│   └── tailwind.config.ts
├── storage/                 # Local filesystem storage repository
├── docker-compose.yml       # Production PostgreSQL & Redis configuration
└── README.md
```

---

## Local Development Setup

### 1. Prerequisites
- **Python**: 3.10+ (Tested on Python 3.14)
- **Node.js**: 20+ (Tested on Node.js 24)
- **npm**: 10+

### 2. Backend Setup & Startup

From project root:
```powershell
# 1. Activate the Python virtual environment
.\backend\venv\Scripts\Activate.ps1

# 2. Run the automated test suite
python -m pytest backend/tests -v

# 3. Start the FastAPI development server
uvicorn app.main:app --reload --app-dir backend --port 8000
```
- API Documentation (Swagger UI): [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- Health Check: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
- System Status: [http://localhost:8000/api/v1/status](http://localhost:8000/api/v1/status)

### 3. Frontend Setup & Startup

In a separate terminal:
```powershell
cd frontend
npm run dev
```
- Dashboard UI: [http://localhost:3000](http://localhost:3000)

---

## Running Automated Tests

```powershell
.\backend\venv\Scripts\python.exe -m pytest backend/tests -v
```

All 9 foundation tests verify:
- Root API endpoint
- Health check with DB and Storage probe
- System Status endpoint
- Mock LLM Strategy Provider
- Mock Image Generation Provider (procedural PNG generator)
- Mock Vision QA Provider (advisory QA evaluation)
- In-process Async Job Worker lifecycle
- LocalStorageProvider save, exists, get, and public URL generation
- Storage error boundary handling (FileNotFound)

---

## Architectural Principles & Scope Adherence
1. **Lightweight Foundation**: Runs directly on Windows without requiring external Redis or Celery services during development.
2. **PostgreSQL Ready**: Switch from SQLite to PostgreSQL at any time simply by setting `DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname` in `backend/.env`.
3. **Advisory Vision QA**: Vision QA is treated as an advisory quality indicator rather than a brittle hard-gate.
4. **Separation of Concerns**: AI specifies creative concepts and scenery prompts; deterministic code manages exact layouts, font scales, and price renders.
