# Architecture

## System Overview

```
User Browser
     │
     ▼
[Next.js Frontend] ──SSR/ISR──► [FastAPI Backend] ──► [PostgreSQL]
     │                                 │
     │                                 ├── /api/webhooks/n8n ◄── [n8n]
     │                                 └── /api/admin/*  ◄── Admin Dashboard
     │
     └── /admin/* (JWT-guarded client routes)
```

## Data Flow

### Guestlist / Reservation
1. User fills form on frontend
2. Frontend POSTs to `/api/guestlist` or `/api/reservations`
3. Backend stores entry + fires analytics upsert on `user_preferences`
4. Admin sees entries in dashboard

### "Where to Go Tonight"
1. User completes multi-step quiz on `/tonight`
2. Each step fires `POST /api/analytics/track` with `session_id`
3. Final step POSTs to `POST /api/tonight/recommend`
4. Backend scores venues (music match +40, vibe overlap +20 each, event tonight +20)
5. Returns ranked venue list with associated events

### n8n Event Ingestion
1. n8n workflow triggers (scraper, manual post, calendar, etc.)
2. n8n POSTs to `POST /api/webhooks/n8n` with `X-API-Key` header
3. Backend upserts event: lookup by `external_id` → fallback name+venue+date match
4. If venue doesn't exist, auto-creates it
5. Frontend ISR revalidates within 5-10 minutes (or on-demand via `/api/revalidate`)

## SEO Strategy

- Next.js SSG for static pages (home, music genres, blog list)
- ISR for dynamic pages (venue detail: 10min, event detail: 5min, blog: 60min)
- `generateMetadata()` on every server page
- JSON-LD structured data on venue/event/blog detail pages
- Dynamic OG images via `app/api/og/route.tsx`
- `sitemap.ts` fetches all slugs from API at build time

## Analytics

Anonymous by default (session_id in localStorage). Linked to email when user submits a form. Stored in `user_preferences` table. Aggregated in admin dashboard.
