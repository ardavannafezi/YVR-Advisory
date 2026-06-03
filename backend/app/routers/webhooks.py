import os
import random
import uuid
from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile, status
from sqlalchemy import Date, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.dependencies import get_db
from app.models.event import Event
from app.models.venue import Venue
from app.models.blog import BlogPost
from app.schemas.webhook import BlogWebhookResponse, N8nBlogPayload, N8nEventPayload, WebhookResponse
from app.utils.slugify import slugify
from datetime import datetime, timezone

UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "uploads")
ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])


def _verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != settings.n8n_webhook_api_key:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid API key")


def _apply_payload(event: Event, payload: N8nEventPayload, venue_id: int) -> None:
    event.name = payload.event_name
    event.venue_id = venue_id
    event.date = payload.date
    event.category = payload.category
    event.music_type = payload.music_type
    event.description = payload.description
    event.image_url = payload.image_url
    event.ticket_url = payload.ticket_url
    event.lineup = payload.lineup
    event.gallery = payload.gallery
    event.video_url = payload.video_url
    event.entry_types = payload.entry_types
    event.our_guestlist = payload.our_guestlist
    event.our_reservation = payload.our_reservation
    event.guestlist_closes_at = payload.guestlist_closes_at
    event.entry_closes_at = payload.entry_closes_at
    if payload.external_id:
        event.external_id = payload.external_id


@router.post("/upload", dependencies=[Depends(_verify_api_key)])
async def webhook_upload(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTS:
        raise HTTPException(status_code=400, detail="Image files only (.jpg .jpeg .png .webp .gif)")
    dest_dir = os.path.join(UPLOAD_DIR, "events")
    os.makedirs(dest_dir, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    content = await file.read()
    with open(os.path.join(dest_dir, filename), "wb") as f:
        f.write(content)
    return {"url": f"/uploads/events/{filename}"}


@router.post("/n8n", response_model=WebhookResponse, dependencies=[Depends(_verify_api_key)])
async def n8n_webhook(payload: N8nEventPayload, db: AsyncSession = Depends(get_db)):
    existing_event: Event | None = None

    if payload.external_id:
        existing_event = await db.scalar(select(Event).where(Event.external_id == payload.external_id))

    if not existing_event:
        existing_event = await db.scalar(
            select(Event).where(
                Event.name == payload.event_name,
                Event.date.cast(Date) == payload.date.date(),
            )
        )

    venue = await db.scalar(select(Venue).where(Venue.name == payload.venue_name))
    if not venue:
        slug_base = slugify(payload.venue_name)
        venue = Venue(name=payload.venue_name, slug=slug_base)
        db.add(venue)
        await db.flush()

    if existing_event:
        existing_event.source = "n8n"
        _apply_payload(existing_event, payload, venue.id)
        await db.commit()
        return WebhookResponse(status="ok", action="updated", event_id=existing_event.id)

    slug_base = slugify(f"{payload.event_name} {payload.date.strftime('%Y-%m-%d')}")
    new_event = Event(
        name=payload.event_name,
        slug=slug_base,
        source="n8n",
        is_published=True,
        social_proof_count=random.randint(4, 12),
    )
    _apply_payload(new_event, payload, venue.id)
    db.add(new_event)
    await db.commit()
    await db.refresh(new_event)
    return WebhookResponse(status="ok", action="created", event_id=new_event.id)


@router.get("/context", dependencies=[Depends(_verify_api_key)])
async def get_n8n_context(db: AsyncSession = Depends(get_db)):
    """Comprehensive knowledge base for n8n bots — venues, events, blog, pages, schema, backlinks."""
    from datetime import timezone
    from sqlalchemy import func as sqlfunc

    SITE = settings.frontend_url

    # ── Venues ────────────────────────────────────────────────────────────────
    venues_rows = (await db.execute(
        select(Venue).where(Venue.is_active == True).order_by(Venue.name)
    )).scalars().all()

    # ── Upcoming events (published, future or today) ───────────────────────
    now = datetime.now(timezone.utc)
    from app.models.event import Event as EventModel
    from sqlalchemy.orm import selectinload as sil
    events_rows = (await db.execute(
        select(EventModel)
        .options(sil(EventModel.venue))
        .where(EventModel.is_published == True, EventModel.date >= now)
        .order_by(EventModel.date.asc())
        .limit(50)
    )).scalars().all()

    # ── Blog posts ────────────────────────────────────────────────────────────
    blog_rows = (await db.execute(
        select(BlogPost).where(BlogPost.is_published == True).order_by(BlogPost.published_at.desc())
    )).scalars().all()

    blog_tags: list[str] = sorted({t for b in blog_rows for t in (b.tags or [])})

    # ── Build response ────────────────────────────────────────────────────────
    return {
        "site_url": SITE,
        "site_description": (
            "YVR Advisory is Vancouver's nightlife advisor — curated nightclubs, cocktail bars, "
            "upcoming events, guestlist access at select partner clubs, and quiz-based recommendations "
            "to help people find the right venue for their night."
        ),

        # ── Pages ─────────────────────────────────────────────────────────────
        "pages": [
            {
                "name": "Home",
                "url": SITE,
                "purpose": "Landing page — featured nightclubs and lounges, upcoming events strip, advisor section explaining the platform.",
                "sections": ["Hero (where to go tonight CTA)", "Featured Nightclubs", "Featured Lounges & Bars", "Upcoming Events", "Advisor Section (3 pillars: Curated Venues / Live Events / Honest Advice)", "CTA Banner (quiz / guestlist)"],
            },
            {
                "name": "Venues",
                "url": f"{SITE}/venues",
                "purpose": "Full venue directory — filterable by category (Nightclubs / Lounges / Bars / Live Music), music type, neighbourhood, price tier, and best night. Sorted by advisory rating then views.",
                "sections": ["Editorial header", "Category tabs (All / Nightclubs / Lounges / Bars / Live Music)", "Filter panel (music type, neighbourhood, best night, price)", "Venue card grid with image, tags, description, and View Venue CTA"],
                "filters": ["primary_category", "music_type", "neighbourhood", "price_tier", "primary_night"],
            },
            {
                "name": "Events",
                "url": f"{SITE}/events",
                "purpose": "Upcoming events listing — filterable by music type, category, date. Each event links to a detail page with guestlist/ticket/reservation CTAs.",
                "sections": ["Events grid (music type filter, date filter)", "Event cards with venue, date, music type, entry types, CTAs"],
            },
            {
                "name": "Journal / Blog",
                "url": f"{SITE}/blog",
                "purpose": "Editorial content — nightlife guides, venue spotlights, music and culture pieces for Vancouver nightlife.",
                "sections": ["Blog post grid", "Tag filter", "Individual post pages at /blog/{slug}"],
            },
            {
                "name": "Music",
                "url": f"{SITE}/music",
                "purpose": "Music-focused discovery — venues and events filtered by music genre (techno, house, hip-hop, latin, etc.).",
            },
            {
                "name": "Where to Go Tonight",
                "url": f"{SITE}/tonight",
                "purpose": "Quiz-based recommendation engine — 4 steps: music preference, vibe, group size, budget. Scores and ranks venues, highlights events happening tonight.",
                "quiz_steps": [
                    {"step": 1, "question": "What's your sound?", "options": ["techno", "house", "hip-hop", "latin", "r&b", "edm", "pop", "live"]},
                    {"step": 2, "question": "What's the vibe?", "options": ["high-energy", "upscale", "intimate", "underground", "rooftop", "dark", "craft cocktails"]},
                    {"step": 3, "question": "How many people?", "options": ["just me", "couple", "small group (3–6)", "large group (7+)"]},
                    {"step": 4, "question": "Budget?", "options": ["free entry", "cover ok", "bottle service"]},
                ],
            },
            {
                "name": "Join Guestlist",
                "url": f"{SITE}/guestlist",
                "purpose": "Guestlist signup form — name, email, party size, date. YVR Advisory submits on behalf of users to partner clubs.",
            },
            {
                "name": "Reserve a Table",
                "url": f"{SITE}/reserve",
                "purpose": "Table/bottle service reservation inquiry form — name, email, venue, date, party size, notes.",
            },
        ],

        # ── Venues ────────────────────────────────────────────────────────────
        "venues": [
            {
                "name": v.name,
                "slug": v.slug,
                "url": f"{SITE}/venues/{v.slug}",
                "establishment_type": v.establishment_type,
                "neighbourhood": v.neighbourhood,
                "address": v.address,
                "music_types": v.music_types or [],
                "vibe_tags": v.vibe_tags or [],
                "primary_categories": v.primary_categories or [],
                "price_tier": v.price_tier,
                "primary_nights": v.primary_nights or [],
                "hours": v.hours,
                "dress_code": v.dress_code,
                "age_restriction": v.age_restriction,
                "cover_charge_info": v.cover_charge_info,
                "bottle_minimum": v.bottle_minimum,
                "guestlist_enabled": v.guestlist_enabled,
                "bottle_service_enabled": v.bottle_service_enabled,
                "guestlist_close_time": v.guestlist_close_time,
                "is_featured": v.is_featured,
                "website_url": v.website_url,
                "instagram_url": v.instagram_url,
                "reservation_link": v.reservation_link,
            }
            for v in venues_rows
        ],

        # ── Upcoming events ────────────────────────────────────────────────────
        "upcoming_events": [
            {
                "name": e.name,
                "slug": e.slug,
                "url": f"{SITE}/events/{e.slug}",
                "venue_name": e.venue.name if e.venue else None,
                "venue_url": f"{SITE}/venues/{e.venue.slug}" if e.venue else None,
                "date": e.date.isoformat(),
                "category": e.category,
                "music_type": e.music_type,
                "description": e.description,
                "lineup": e.lineup,
                "entry_types": e.entry_types or [],
                "our_guestlist": e.our_guestlist,
                "our_reservation": e.our_reservation,
                "ticket_url": e.ticket_url,
                "guestlist_closes_at": e.guestlist_closes_at.isoformat() if e.guestlist_closes_at else None,
                "image_url": e.image_url,
            }
            for e in events_rows
        ],

        # ── Blog ──────────────────────────────────────────────────────────────
        "blog_posts": [
            {
                "title": b.title,
                "slug": b.slug,
                "url": f"{SITE}/blog/{b.slug}",
                "summary": b.summary,
                "tags": b.tags or [],
                "music_type": b.music_type,
                "published_at": b.published_at.isoformat() if b.published_at else None,
            }
            for b in blog_rows
        ],

        # ── Taxonomy ──────────────────────────────────────────────────────────
        "taxonomy": {
            "establishment_types": ["Nightclub", "Cocktail Bar", "Bar & Restaurant", "Rooftop Lounge"],
            "music_types": sorted({mt for v in venues_rows for mt in (v.music_types or [])}),
            "vibe_tags": sorted({tag for v in venues_rows for tag in (v.vibe_tags or [])}),
            "neighbourhoods": sorted({v.neighbourhood for v in venues_rows if v.neighbourhood}),
            "blog_tags": blog_tags,
            "event_categories": ["rave", "latin night", "hip-hop night", "themed", "residency", "open format", "live music", "rooftop"],
            "event_music_types": ["house", "techno", "hip-hop", "r&b", "latin", "edm", "open-format", "top-40", "afrobeats", "pop", "live"],
            "price_tiers": ["$", "$$", "$$$"],
        },

        # ── Event webhook schema ───────────────────────────────────────────────
        "event_webhook": {
            "endpoint": "https://back.yvradvisory.ca/api/webhooks/n8n",
            "method": "POST",
            "auth": "X-API-Key header",
            "description": "POST to ingest or update an event. Upserts by external_id, then by name+date match.",
            "fields": {
                "event_name": "string — required. Full event name.",
                "venue_name": "string — required. Must match an existing venue name exactly (or a new venue row is auto-created with just the name).",
                "date": "ISO 8601 datetime with timezone — required. e.g. 2025-06-07T22:00:00-07:00",
                "category": "string | null — e.g. 'rave', 'latin night', 'hip-hop night', 'open format', 'residency'",
                "music_type": "string | null — e.g. 'techno', 'house', 'hip-hop', 'latin', 'r&b', 'edm'",
                "description": "string | null — event description for the detail page",
                "image_url": "string | null — full URL to event cover image",
                "ticket_url": "string | null — external ticketing link",
                "lineup": "array of objects | null — e.g. [{\"name\": \"DJ Name\", \"time\": \"12:00 AM\"}]",
                "gallery": "array of strings | null — list of image URLs",
                "video_url": "string | null — YouTube/Vimeo embed or direct URL",
                "entry_types": "array of strings | null — e.g. ['Guestlist', 'Tickets', 'Door']",
                "our_guestlist": "boolean — true if YVR Advisory is managing the guestlist for this event",
                "our_reservation": "boolean — true if YVR Advisory handles table reservations for this event",
                "guestlist_closes_at": "ISO 8601 datetime | null — when guestlist signup closes",
                "entry_closes_at": "ISO 8601 datetime | null — when door/ticket entry closes",
                "external_id": "string | null — your unique identifier for idempotent upserts",
            },
        },

        # ── Backlinks ─────────────────────────────────────────────────────────
        "backlink_targets": [
            {
                "url": SITE,
                "anchor_suggestions": ["YVR Advisory", "Vancouver nightlife guide", "Vancouver club guide"],
                "purpose": "Homepage — main brand link",
            },
            {
                "url": f"{SITE}/venues",
                "anchor_suggestions": ["Vancouver nightclubs", "Vancouver venues", "best clubs in Vancouver"],
                "purpose": "Venues directory",
            },
            {
                "url": f"{SITE}/events",
                "anchor_suggestions": ["events tonight in Vancouver", "Vancouver nightlife events", "upcoming events Vancouver"],
                "purpose": "Events listing",
            },
            {
                "url": f"{SITE}/tonight",
                "anchor_suggestions": ["where to go in Vancouver tonight", "Vancouver nightlife recommendations", "best night out Vancouver"],
                "purpose": "Quiz recommendation tool",
            },
            {
                "url": f"{SITE}/guestlist",
                "anchor_suggestions": ["Vancouver guestlist", "club guestlist Vancouver", "free entry Vancouver clubs"],
                "purpose": "Guestlist signup",
            },
            *[
                {
                    "url": f"{SITE}/venues/{v.slug}",
                    "anchor_suggestions": [v.name, f"{v.name} Vancouver", f"{v.name} {v.neighbourhood or ''}".strip()],
                    "purpose": f"Venue page — {v.establishment_type or 'venue'} in {v.neighbourhood or 'Vancouver'}",
                }
                for v in venues_rows
            ],
        ],
    }


@router.post("/n8n-blog", response_model=BlogWebhookResponse, dependencies=[Depends(_verify_api_key)])
async def n8n_blog_webhook(payload: N8nBlogPayload, db: AsyncSession = Depends(get_db)):
    existing: BlogPost | None = None

    if payload.external_id:
        existing = await db.scalar(select(BlogPost).where(BlogPost.external_id == payload.external_id))

    if not existing:
        existing = await db.scalar(select(BlogPost).where(BlogPost.title == payload.title))

    if existing:
        existing.title = payload.title
        existing.body = payload.body
        existing.summary = payload.summary
        existing.cover_image_url = payload.cover_image_url
        existing.tags = payload.tags
        existing.music_type = payload.music_type
        existing.author = payload.author
        existing.is_published = payload.is_published
        if payload.is_published and not existing.published_at:
            existing.published_at = datetime.now(timezone.utc)
        if payload.external_id:
            existing.external_id = payload.external_id
        await db.commit()
        await db.refresh(existing)
        return BlogWebhookResponse(status="ok", action="updated", post_id=existing.id, slug=existing.slug)

    slug = slugify(payload.title)
    post = BlogPost(
        title=payload.title,
        slug=slug,
        body=payload.body,
        summary=payload.summary,
        cover_image_url=payload.cover_image_url,
        tags=payload.tags,
        music_type=payload.music_type,
        author=payload.author,
        is_published=payload.is_published,
        published_at=datetime.now(timezone.utc) if payload.is_published else None,
        external_id=payload.external_id,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return BlogWebhookResponse(status="ok", action="created", post_id=post.id, slug=post.slug)
