# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YVR Advisory — high-end Vancouver nightlife advisory platform. Venue discovery, event listings, quiz-based recommendations ("Where to Go Tonight"), guestlist signups, table reservations. Railway deployment, Next.js 14 frontend, FastAPI backend.

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

# Venue seeding — idempotent (skips existing slugs), runs automatically on Railway deploy
python -m app.utils.seed_venues
```

### Frontend type-checking (`cd frontend`)
```bash
npx tsc --noEmit   # TypeScript type check without emitting files
```

No test suite yet.

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

- **Framework:** Next.js 14 App Router + TypeScript
- **Styling:** Tailwind CSS (gold `#c9a84c` / black `#0a0a0a`) + Framer Motion
- **Fonts:** Playfair Display (headings), Inter (body)
- **Key pages:** `src/app/` — home, `venues/`, `events/`, `blog/`, `music/`, `tonight/`, `where-to-go/` (alias for tonight quiz), `guestlist/`, `reserve/`, `admin/`
- **Components:** `src/components/` — subfolders: `admin/`, `blog/`, `events/`, `forms/`, `home/`, `layout/`, `music/`, `tonight/`, `ui/`, `venues/`
- **API layer:** `src/lib/api.ts` — thin fetch wrapper over `NEXT_PUBLIC_API_URL`
- **Auth:** `src/lib/auth.ts` — JWT token storage for admin routes
- **Shared types:** `src/types/index.ts`
- **Animations:** `src/styles/animations.ts`, via Framer Motion
- **ISR revalidation:** venue detail 10 min, event detail 5 min, blog 60 min; triggered via `/api/revalidate` with `REVALIDATE_SECRET`

### Backend (`backend/`)

- **Framework:** FastAPI (async), SQLAlchemy 2.0 + asyncpg
- **Entry point:** `app/main.py` — mounts all routers, configures CORS
- **Settings:** `app/config.py` via Pydantic-Settings (reads env vars)
- **DB session:** `app/database.py` — async engine; injected via `app/dependencies.py`
- **Migrations:** Alembic; versions `001`–`013` in `alembic/versions/`; run `alembic upgrade head` before start; new: `alembic revision --autogenerate -m "description"`
- **Auth:** JWT Bearer via python-jose; `get_current_admin` dependency gates all `/api/admin/*` routes
- **Services layer:** `app/services/` — `analytics_service.py`, `event_service.py`; business logic extracted from routers
- **SEO router:** `app/routers/seo.py` — serves `/robots.txt`, XML sitemap, `/llms.txt` (AI crawler index) dynamically from DB
- **Static files:** `/uploads` mounted from `UPLOAD_DIR` env var (default `uploads/`); venue images stored at `uploads/venues/`

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
| `VenueAdvisoryRating` | `venue_id` (unique FK), `rating` (float) — editorial score on venue detail |
| `NotificationSettings` | singleton row (id=1); SMTP fields + `telegram_bot_token`, `telegram_chat_id`; admin-managed |

### Adding a Venue

Add entry to `VENUES` list in `backend/app/utils/seed_venues.py`, run `python -m app.utils.seed_venues`. Non-obvious field formats:

- `dress_code`: `"Label — detail"` — part before ` — ` shown in quick-stats card
- `hours`: JSONB keyed by lowercase day; `null` = closed. Example: `{"monday": null, "friday": "9:00 PM – 3:00 AM"}`
- `faqs`: JSONB array of `{"question": "...", "answer": "..."}` objects
- `establishment_type`: must be one of `Nightclub`, `Cocktail Bar`, `Bar & Restaurant`, `Rooftop Lounge`
- `primary_category`: optional free-text override for venue's primary category label (migration 008)
- `guestlist_enabled` / `bottle_service_enabled`: boolean flags controlling which CTAs appear on venue detail (migration 013)

### Key API Flows

**Quiz recommendations** (`POST /api/tonight/recommend`): scores venues by music match (+40), vibe overlap (+20 each), event tonight (+20).

**n8n event ingestion** (`POST /api/webhooks/n8n`, `X-API-Key` required): upserts events by `external_id` or name+venue+date match; auto-creates venue if missing; triggers ISR revalidation on frontend.

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
EXTRA_CORS_ORIGINS=...   # comma-separated extra origins appended to CORS allowlist
UPLOAD_DIR=uploads       # filesystem path for static file uploads
```

## SEO Architecture

- `generateMetadata()` on every server page — required for all new pages
- JSON-LD structured data on venue (`NightClub`), event, blog detail pages
- Dynamic OG images via `app/api/og/route.tsx`
- `sitemap.ts` fetches all slugs from API at build time
- `robots.txt`, XML sitemap, and `llms.txt` served dynamically by backend `seo` router (not static files)
- ISR: venue 10 min, event 5 min, blog 60 min; on-demand via `POST /api/revalidate` (requires `REVALIDATE_SECRET`)

## Analytics

Anonymous by default — `session_id` in `localStorage`. Linked to email when user submits guestlist/reservation. Each quiz step fires `POST /api/analytics/track`. All data in `user_preferences` table, aggregated in admin dashboard.

## UI Conventions

- **Loading states:** Skeleton loading (animated placeholder boxes), not spinners or text, for card/list/grid content. Match skeleton shape to actual content layout.

## Local Development

**Do not run app locally.** Frontend, backend, database all run on Railway. Changes deploy on `git push`. Never run `python`, `python3`, `uvicorn`, `npm run dev`, or any server/migration commands locally.

## Deployment (Railway)

- **Frontend:** Nixpacks builder; start command `npm run start -- --port $PORT`; health check `/`
- **Backend:** Dockerfile (Python 3.12-slim); pre-deploy `alembic upgrade head`; start `sh -c 'uvicorn app.main:app --host 0.0.0.0 --port $PORT'`; health check `/health`
- **Database:** Railway Postgres add-on; connection string injected as `DATABASE_URL`

CORS locked to `https://yvradvisory.ca`, `https://www.yvradvisory.ca`, `http://localhost:3000`, `FRONTEND_URL`.

## Reference Docs

Deeper docs in `docs/`:
- `architecture.md` — data flow diagrams
- `api-reference.md` — full endpoint table (public + admin)
- `venue-schema.md` — complete `venues` column reference
- `deployment.md` — Railway deploy details
- `n8n-integration.md` — n8n webhook payload format