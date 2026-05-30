# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YVR Advisory is a high-end Vancouver nightlife advisory platform — venue discovery, event listings, a quiz-based recommendation engine ("Where to Go Tonight"), guestlist signups, and table reservations. Deployed on Railway with a Next.js 14 frontend and FastAPI backend.

## Commands

### Frontend (`cd frontend`)
```bash
npm run dev      # Dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

### Backend (`cd backend`)
```bash
pip install -r requirements.txt
alembic upgrade head                          # Run migrations
uvicorn app.main:app --reload                 # Dev server at localhost:8000
uvicorn app.main:app --host 0.0.0.0 --port 8000  # Explicit port

# Admin seeded automatically on startup via ADMIN_EMAIL + ADMIN_PASSWORD env vars (atomic upsert)
# Fallback: create admin manually (run from backend/ with DATABASE_URL set)
python -m app.utils.create_admin email@example.com password
```

### Frontend type-checking (`cd frontend`)
```bash
npx tsc --noEmit   # TypeScript type check without emitting files
```

No test suite exists yet.

## Architecture

```
User Browser
     │
     ▼
[Next.js 14 Frontend] ──SSR/ISR──► [FastAPI Backend] ──► [PostgreSQL (Railway)]
                                          │
                                          ├── /api/webhooks/n8n ◄── [n8n] (event ingestion)
                                          └── /api/admin/* (JWT-protected CRUD)
```

### Frontend (`frontend/`)

- **Framework:** Next.js 14 App Router with TypeScript
- **Styling:** Tailwind CSS (gold `#c9a84c` / black `#0a0a0a` theme) + Framer Motion
- **Fonts:** Playfair Display (headings), Inter (body)
- **Key pages:** `src/app/` — home, `venues/`, `events/`, `blog/`, `music/`, `tonight/` (quiz), `guestlist/`, `reserve/`, `admin/`
- **API layer:** `src/lib/api.ts` — thin fetch wrapper over `NEXT_PUBLIC_API_URL`
- **Auth:** `src/lib/auth.ts` — JWT token storage for admin routes
- **Shared types:** `src/types/index.ts`
- **Animations:** defined in `src/styles/animations.ts`, used via Framer Motion
- **ISR revalidation:** venue detail 10 min, event detail 5 min, blog 60 min; triggered via `/api/revalidate` with `REVALIDATE_SECRET`

### Backend (`backend/`)

- **Framework:** FastAPI (async) with SQLAlchemy 2.0 + asyncpg
- **Entry point:** `app/main.py` — mounts all routers, configures CORS
- **Settings:** `app/config.py` via Pydantic-Settings (reads env vars)
- **DB session:** `app/database.py` — async engine; injected via `app/dependencies.py`
- **Migrations:** Alembic; versions `001`–`007` in `alembic/versions/`; run `alembic upgrade head` before starting
- **Auth:** JWT Bearer via python-jose; `get_current_admin` dependency gates all `/api/admin/*` routes

### Data Models

| Model | Key fields |
|---|---|
| `Venue` | `slug` (unique), `music_types[]`, `vibe_tags[]`, `is_featured`, `is_active` |
| `Event` | `slug`, `venue_id` (FK), `date`, `music_type`, `external_id` (n8n upsert key) |
| `BlogPost` | `slug`, `tags[]`, `music_type`, `published_at` |
| `GuestlistEntry` | `email`, `party_size`, `source_page` |
| `TableReservation` | `email`, `venue_id`, `date_requested`, `status` (pending/approved/rejected) |
| `UserPreference` | `session_id` (unique), `quiz_answers` (JSON), arrays of viewed items |
| `AdminUser` | `email` (unique), `hashed_password` |
| `VenueView` | `venue_id` (unique FK), `view_count` — one row per venue, upserted on each page load |
| `VenueAdvisoryRating` | `venue_id` (unique FK), `rating` (float) — editorial score shown on venue detail |

### Key API Flows

**Quiz recommendations** (`POST /api/tonight/recommend`): scores venues by music match (+40), vibe overlap (+20 each), event tonight (+20).

**n8n event ingestion** (`POST /api/webhooks/n8n`, `X-API-Key` required): upserts events by `external_id` or name+venue+date match; auto-creates venue if missing; triggers ISR revalidation on the frontend.

**Admin CRUD**: all `/api/admin/*` endpoints require JWT Bearer. Login via `POST /api/admin/auth/login`.

## Environment Variables

**Frontend (`.env.local`):**
```
NEXT_PUBLIC_API_URL=...        # defaults to https://back.yvradvisory.ca if unset
NEXT_PUBLIC_SITE_URL=...
REVALIDATE_SECRET=...
```

**Backend (`.env`):**
```
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/yvradvisory
SECRET_KEY=...
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
N8N_WEBHOOK_API_KEY=...
FRONTEND_URL=...
ENVIRONMENT=development
```

## Deployment (Railway)

- **Frontend:** Nixpacks builder; start command `npm run start -- --port $PORT`; health check `/`
- **Backend:** Dockerfile (Python 3.12-slim); pre-deploy `alembic upgrade head`; start `sh -c 'uvicorn app.main:app --host 0.0.0.0 --port $PORT'`; health check `/health`
- **Database:** Railway Postgres add-on; connection string injected as `DATABASE_URL`

CORS is locked to `https://yvradvisory.ca`, `https://www.yvradvisory.ca`, `http://localhost:3000`, and `FRONTEND_URL`.
