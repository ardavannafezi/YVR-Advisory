from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies import get_db
from app.models.event import Event
from app.models.venue import Venue
from app.schemas.event import EventList, EventOut, EventRecommendRequest
from app.schemas.llms import EventLlmsItem, EventLlmsList
from app.schemas.sitemap import SitemapItem, SitemapList

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("/upcoming", response_model=list[EventOut])
async def get_upcoming(db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(Event)
        .options(selectinload(Event.venue))
        .where(Event.is_published == True, Event.date >= now)
        .order_by(Event.date)
        .limit(6)
    )
    return result.scalars().all()


@router.get("", response_model=EventList)
async def list_events(
    date_from: datetime | None = Query(None),
    date_to: datetime | None = Query(None),
    category: str | None = Query(None),
    music_type: str | None = Query(None),
    venue_id: int | None = Query(None),
    entry_type: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    q = (
        select(Event)
        .options(selectinload(Event.venue))
        .where(Event.is_published == True, Event.date >= now)
    )
    if date_from:
        q = q.where(Event.date >= date_from)
    if date_to:
        q = q.where(Event.date <= date_to)
    if category:
        q = q.where(Event.category.ilike(f"%{category}%"))
    if music_type:
        q = q.where(Event.music_type == music_type)
    if venue_id:
        q = q.where(Event.venue_id == venue_id)
    if entry_type:
        q = q.where(Event.entry_types.any(entry_type))

    total = await db.scalar(select(func.count()).select_from(q.subquery()))
    result = await db.execute(q.order_by(Event.date).offset((page - 1) * limit).limit(limit))
    return EventList(items=result.scalars().all(), total=total or 0, page=page, limit=limit)


@router.get("/sitemap", response_model=SitemapList)
async def event_sitemap(
    page: int = Query(1, ge=1),
    limit: int = Query(500, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    q = select(Event.slug, Event.updated_at).where(Event.is_published == True)
    total = await db.scalar(select(func.count()).select_from(q.subquery()))
    result = await db.execute(
        q.order_by(Event.updated_at.desc(), Event.id.desc()).offset((page - 1) * limit).limit(limit)
    )
    items = [SitemapItem(slug=slug, last_modified=updated_at) for slug, updated_at in result.all()]
    total_count = total or 0
    return SitemapList(
        items=items,
        total=total_count,
        page=page,
        limit=limit,
        has_next=page * limit < total_count,
    )


@router.get("/llms", response_model=EventLlmsList)
async def event_llms(
    page: int = Query(1, ge=1),
    limit: int = Query(250, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    q = (
        select(
            Event.name,
            Event.slug,
            Event.description,
            Event.date,
            Event.music_type,
            Venue.name.label("venue_name"),
            Event.updated_at,
        )
        .outerjoin(Venue, Event.venue_id == Venue.id)
        .where(Event.is_published == True)
    )
    total = await db.scalar(select(func.count()).select_from(q.subquery()))
    result = await db.execute(
        q.order_by(Event.date.desc(), Event.id.desc()).offset((page - 1) * limit).limit(limit)
    )
    items = [
        EventLlmsItem(
            name=name,
            slug=slug,
            description=description,
            date=date,
            music_type=music_type,
            venue_name=venue_name,
            updated_at=updated_at,
        )
        for name, slug, description, date, music_type, venue_name, updated_at in result.all()
    ]
    total_count = total or 0
    return EventLlmsList(
        items=items,
        total=total_count,
        page=page,
        limit=limit,
        has_next=page * limit < total_count,
    )


@router.post("/recommend", response_model=dict)
async def recommend_events(body: EventRecommendRequest, db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc)

    date_from: datetime | None = None
    date_to: datetime | None = None
    if body.date == "tonight":
        date_from = now.replace(hour=0, minute=0, second=0, microsecond=0)
        date_to = now.replace(hour=23, minute=59, second=59, microsecond=999999)
    elif body.date == "weekend":
        days_until_fri = (4 - now.weekday()) % 7
        fri = now + timedelta(days=days_until_fri)
        date_from = fri.replace(hour=0, minute=0, second=0, microsecond=0)
        date_to = (fri + timedelta(days=2)).replace(hour=23, minute=59, second=59, microsecond=999999)
    elif body.date == "week":
        date_from = now.replace(hour=0, minute=0, second=0, microsecond=0)
        date_to = (now + timedelta(days=7)).replace(hour=23, minute=59, second=59, microsecond=999999)

    q = (
        select(Event)
        .options(selectinload(Event.venue))
        .where(Event.is_published == True, Event.date >= now)
    )
    if date_from:
        q = q.where(Event.date >= date_from)
    if date_to:
        q = q.where(Event.date <= date_to)

    result = await db.execute(q.order_by(Event.date).limit(100))
    events = result.scalars().all()

    def score(event: Event) -> int:
        pts = 0
        venue = event.venue

        if body.venue_types and venue and venue.establishment_type:
            for vt in body.venue_types:
                if vt.lower() in (venue.establishment_type or "").lower():
                    pts += 35

        if body.music_types and event.music_type:
            for mt in body.music_types:
                if mt.lower() == (event.music_type or "").lower():
                    pts += 30

        days_away = (event.date - now).days
        if days_away == 0:
            pts += 40
        elif days_away <= 3:
            pts += 25
        elif days_away <= 7:
            pts += 15

        if event.our_guestlist or event.our_reservation:
            pts += 15
        if event.lineup:
            pts += 8
        if venue and getattr(venue, "is_featured", False):
            pts += 10
        if event.social_proof_count and event.social_proof_count > 20:
            pts += 5

        return pts

    scored = sorted([(score(e), e) for e in events], key=lambda x: (-x[0], x[1].date))
    threshold = 20
    primary = [e for s, e in scored if s >= threshold][:9]
    primary_ids = {e.id for e in primary}
    similar = [e for s, e in scored if s > 0 and e.id not in primary_ids][:6]

    return {
        "results": [EventOut.model_validate(e) for e in primary],
        "similar": [EventOut.model_validate(e) for e in similar],
    }


@router.post("/{event_id}/interest")
async def increment_interest(event_id: int, db: AsyncSession = Depends(get_db)):
    event = await db.get(Event, event_id)
    if not event or not event.is_published:
        raise HTTPException(status_code=404, detail="Event not found")
    event.social_proof_count = (event.social_proof_count or 0) + 1
    await db.commit()
    return {"social_proof_count": event.social_proof_count}


@router.get("/schema")
async def get_event_schema(db: AsyncSession = Depends(get_db)):
    from app.models.venue import Venue
    result = await db.execute(
        select(Venue).where(Venue.is_active == True).order_by(Venue.name)
    )
    venues = result.scalars().all()

    return {
        "description": "Complete reference for creating events on YVR Advisory. All available values and field formats.",
        "fields": {
            "name": {"type": "string", "required": True, "max_length": 300, "example": "Saturday Night Vibes"},
            "venue_id": {"type": "integer", "required": False, "note": "Use available_venues list to find the correct id. Leave null for auto-create via webhook."},
            "date": {"type": "datetime (ISO 8601 UTC)", "required": True, "example": "2025-06-14T22:00:00Z", "note": "Event start time. Always include timezone offset or use Z for UTC."},
            "category": {"type": "string", "required": False, "max_length": 100, "example": "rave, latin night, themed, industry night"},
            "music_type": {"type": "string (enum)", "required": False, "allowed_values": "see available_music_types"},
            "description": {"type": "string", "required": False, "note": "2–4 sentence event description shown to users."},
            "image_url": {"type": "string (URL)", "required": False, "note": "Hero image for event. Falls back to venue image if not set."},
            "ticket_url": {"type": "string (URL)", "required": False, "note": "External ticket link (e.g. dice.fm). Shown as Tickets CTA if our_guestlist and our_reservation are false."},
            "is_published": {"type": "boolean", "default": True, "note": "Set false to hide from public listings."},
            "gallery": {"type": "array of strings (URLs)", "required": False, "note": "Additional event images shown in gallery slider."},
            "video_url": {"type": "string (URL)", "required": False, "note": "YouTube URL or direct MP4. Shown in event detail page."},
            "entry_types": {
                "type": "array of strings (enum)",
                "required": False,
                "allowed_values": ["guestlist", "tickets", "reservation"],
                "note": "Informational badges shown on card. Does not control CTA visibility."
            },
            "our_guestlist": {"type": "boolean", "default": False, "note": "Enable YVR Advisory guestlist CTA. Venue must also have guestlist_enabled=true. Guestlist closes at venue's guestlist_close_time on the event day (Pacific time)."},
            "our_reservation": {"type": "boolean", "default": False, "note": "Enable YVR Advisory bottle service / table reservation CTA. Venue must also have bottle_service_enabled=true."},
            "lineup": {
                "type": "array of objects",
                "required": False,
                "item_schema": {
                    "name": "string (required)",
                    "instagram": "string URL (optional)",
                    "tiktok": "string URL (optional)",
                    "youtube": "string URL (optional)"
                },
                "example": [{"name": "DJ Example", "instagram": "https://instagram.com/djexample"}]
            },
            "external_id": {"type": "string", "required": False, "note": "Unique external identifier for upsert via n8n webhook. Prevents duplicate events."},
            "social_proof_count": {"type": "integer", "required": False, "note": "Number shown as 'X people interested'. Auto-assigned random 4–12 on creation."}
        },
        "guestlist_logic": {
            "note": "Guestlist availability is controlled by BOTH the event flag and the venue flag.",
            "rule": "CTA shows when: event.our_guestlist=true AND venue.guestlist_enabled=true AND current time is before venue.guestlist_close_time on the event's date (Pacific time).",
            "close_time_source": "venue.guestlist_close_time (HH:MM Pacific). Guestlist always closes at this time on the calendar day of the event."
        },
        "available_music_types": [
            "hip-hop", "house", "techno", "latin", "r&b", "edm", "pop", "live", "top-40", "k-pop", "country", "rock"
        ],
        "available_entry_types": [
            {"value": "guestlist", "label": "Guestlist"},
            {"value": "tickets", "label": "Tickets"},
            {"value": "reservation", "label": "Bottle Service / Reservation"}
        ],
        "available_venues": [
            {
                "id": v.id,
                "name": v.name,
                "slug": v.slug,
                "neighbourhood": v.neighbourhood,
                "establishment_type": v.establishment_type,
                "guestlist_enabled": v.guestlist_enabled,
                "bottle_service_enabled": v.bottle_service_enabled,
                "guestlist_close_time": v.guestlist_close_time,
                "music_types": v.music_types,
            }
            for v in venues
        ]
    }


@router.get("/{slug}", response_model=EventOut)
async def get_event(slug: str, db: AsyncSession = Depends(get_db)):
    event = await db.scalar(
        select(Event).options(selectinload(Event.venue)).where(Event.slug == slug, Event.is_published == True)
    )
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
