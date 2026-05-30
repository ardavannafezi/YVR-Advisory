from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.guestlist import GuestlistEntry
from app.models.reservation import TableReservation
from app.models.user_preference import UserPreference
from app.models.venue import Venue
from app.models.event import Event
from app.models.venue_view import VenueView


async def upsert_preference(session_id: str, email: str | None, event_type: str, payload: dict, db: AsyncSession) -> None:
    pref = await db.scalar(select(UserPreference).where(UserPreference.session_id == session_id))
    if not pref:
        pref = UserPreference(session_id=session_id, email=email)
        db.add(pref)

    if email and not pref.email:
        pref.email = email

    if event_type == "music_view":
        genre = payload.get("genre")
        if genre and genre not in (pref.music_types_viewed or []):
            pref.music_types_viewed = (pref.music_types_viewed or []) + [genre]
    elif event_type == "venue_view":
        name = payload.get("venue_name")
        if name and name not in (pref.venue_names_viewed or []):
            pref.venue_names_viewed = (pref.venue_names_viewed or []) + [name]
        vtype = payload.get("venue_type")
        if vtype and vtype not in (pref.venue_types_viewed or []):
            pref.venue_types_viewed = (pref.venue_types_viewed or []) + [vtype]
    elif event_type == "quiz_step":
        pref.quiz_answers = {**(pref.quiz_answers or {}), **payload}

    await db.commit()


async def get_summary(db: AsyncSession) -> dict:
    top_venues_raw = await db.execute(
        select(Venue.name, func.count(GuestlistEntry.id).label("count"))
        .join(GuestlistEntry, GuestlistEntry.venue_id == Venue.id, isouter=True)
        .group_by(Venue.name)
        .order_by(func.count(GuestlistEntry.id).desc())
        .limit(5)
    )
    top_venues = [{"name": r.name, "count": r.count} for r in top_venues_raw]

    total_guestlist = await db.scalar(select(func.count(GuestlistEntry.id))) or 0
    total_reservations = await db.scalar(select(func.count(TableReservation.id))) or 0
    pending = await db.scalar(
        select(func.count(TableReservation.id)).where(TableReservation.status == "pending")
    ) or 0

    top_views_raw = await db.execute(
        select(Venue.name, VenueView.view_count)
        .join(VenueView, Venue.id == VenueView.venue_id)
        .order_by(VenueView.view_count.desc())
        .limit(10)
    )
    top_venue_views = [{"name": r.name, "views": r.view_count} for r in top_views_raw]

    return {
        "top_venues": top_venues,
        "top_venue_views": top_venue_views,
        "music_type_distribution": [],
        "top_events": [],
        "total_guestlist": total_guestlist,
        "total_reservations": total_reservations,
        "pending_reservations": pending,
    }
