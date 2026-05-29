from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies import get_db
from app.models.event import Event
from app.models.venue import Venue

router = APIRouter(prefix="/api/music", tags=["music"])


@router.get("/genres")
async def list_genres(db: AsyncSession = Depends(get_db)):
    venue_counts = await db.execute(
        select(func.unnest(Venue.music_types).label("genre"), func.count().label("venue_count"))
        .where(Venue.is_active == True)
        .group_by("genre")
    )
    rows = venue_counts.all()
    return [{"genre": r.genre, "venue_count": r.venue_count} for r in rows]


@router.get("/{genre}")
async def genre_detail(genre: str, db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc)
    venues = await db.execute(
        select(Venue).where(Venue.is_active == True, Venue.music_types.any(genre))
    )
    events = await db.execute(
        select(Event)
        .options(selectinload(Event.venue))
        .where(Event.is_published == True, Event.music_type == genre, Event.date >= now)
        .order_by(Event.date)
        .limit(10)
    )
    return {
        "genre": genre,
        "venues": venues.scalars().all(),
        "events": events.scalars().all(),
    }
