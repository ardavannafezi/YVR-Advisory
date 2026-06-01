from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies import get_db
from app.models.event import Event
from app.models.venue import Venue
from app.schemas.event import EventList, EventOut, EventRecommendRequest

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


@router.get("/{slug}", response_model=EventOut)
async def get_event(slug: str, db: AsyncSession = Depends(get_db)):
    event = await db.scalar(
        select(Event).options(selectinload(Event.venue)).where(Event.slug == slug, Event.is_published == True)
    )
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
