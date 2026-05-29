from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.event import Event
from app.models.venue import Venue
from app.schemas.analytics import TonightRequest


async def get_tonight_recommendations(req: TonightRequest, db: AsyncSession) -> list[dict]:
    now = datetime.now(timezone.utc)
    tonight_end = now.replace(hour=23, minute=59, second=59)

    venues = await db.execute(select(Venue).where(Venue.is_active == True))
    all_venues = venues.scalars().all()

    events_tonight = await db.execute(
        select(Event)
        .options(selectinload(Event.venue))
        .where(Event.is_published == True, Event.date >= now, Event.date <= tonight_end)
    )
    tonight_venue_ids = {e.venue_id for e in events_tonight.scalars().all()}

    scored: list[dict] = []
    for venue in all_venues:
        score = 0
        if req.music_type and req.music_type in (venue.music_types or []):
            score += 40
        if req.vibe and venue.vibe_tags:
            overlap = sum(1 for tag in venue.vibe_tags if req.vibe.lower() in tag.lower())
            score += min(overlap * 20, 40)
        if venue.id in tonight_venue_ids:
            score += 20
        if score > 0:
            scored.append({"venue": venue, "score": score, "has_event_tonight": venue.id in tonight_venue_ids})

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:5]
