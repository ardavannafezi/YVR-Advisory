from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies import get_db
from app.models.event import Event
from app.schemas.event import EventList, EventOut

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

    total = await db.scalar(select(func.count()).select_from(q.subquery()))
    result = await db.execute(q.order_by(Event.date).offset((page - 1) * limit).limit(limit))
    return EventList(items=result.scalars().all(), total=total or 0, page=page, limit=limit)


@router.get("/{slug}", response_model=EventOut)
async def get_event(slug: str, db: AsyncSession = Depends(get_db)):
    event = await db.scalar(
        select(Event).options(selectinload(Event.venue)).where(Event.slug == slug, Event.is_published == True)
    )
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
