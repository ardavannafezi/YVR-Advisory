import asyncio
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.dependencies import get_db
from app.models.event import Event
from app.models.guestlist import GuestlistEntry
from app.models.venue import Venue
from app.schemas.guestlist import GuestlistCreate, GuestlistOut
from app.utils.email_templates import guestlist_admin_email, guestlist_user_email
from app.utils.notifications import load_db_notif_settings, send_email, send_telegram

router = APIRouter(prefix="/api/guestlist", tags=["guestlist"])

PT = ZoneInfo("America/Vancouver")


def _compute_guestlist_close(event: Event, venue: Venue | None) -> datetime | None:
    """Return effective guestlist close datetime (UTC). Event-level takes priority; falls back to venue default."""
    if event.guestlist_closes_at:
        return event.guestlist_closes_at
    if venue and venue.guestlist_close_time:
        try:
            h, m = map(int, venue.guestlist_close_time.split(":"))
        except ValueError:
            return None
        event_pt = event.date.astimezone(PT)
        close_pt = event_pt.replace(hour=h, minute=m, second=0, microsecond=0)
        if close_pt <= event_pt:
            close_pt += timedelta(days=1)
        return close_pt.astimezone(timezone.utc)
    return None


@router.post("", response_model=GuestlistOut, status_code=status.HTTP_201_CREATED)
async def submit_guestlist(data: GuestlistCreate, db: AsyncSession = Depends(get_db)):
    event: Event | None = None
    venue: Venue | None = None

    if data.event_id:
        event = await db.get(Event, data.event_id)
        if event and event.venue_id:
            venue = await db.get(Venue, event.venue_id)
    if venue is None and data.venue_id:
        venue = await db.get(Venue, data.venue_id)

    # Venue must have guestlist enabled
    if venue and not venue.guestlist_enabled:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Guestlist not available for this venue")

    # Guestlist must still be open
    if event:
        close_dt = _compute_guestlist_close(event, venue)
        if close_dt and datetime.now(timezone.utc) >= close_dt:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Guestlist signup has closed")

    entry = GuestlistEntry(**data.model_dump())
    db.add(entry)
    await db.commit()
    await db.refresh(entry)

    notif = await load_db_notif_settings(db)

    event_name = event.name if event else "—"
    event_date = event.date.astimezone(PT).strftime("%-d %b %Y, %-I:%M %p PT") if event and event.date else "—"
    venue_name = venue.name if venue else "—"
    party = entry.party_size or 1

    tg_msg = (
        f"🎟 <b>New Guestlist Signup</b>\n"
        f"👤 {entry.full_name} | {entry.email}\n"
        f"👥 Party of {party}\n"
        f"🎉 Event: {event_name}\n"
        f"📅 Date: {event_date}\n"
        f"📍 Venue: {venue_name}"
    )

    user_html = guestlist_user_email(
        full_name=entry.full_name,
        event_name=event_name,
        event_date=event_date,
        venue_name=venue_name,
        party_size=party,
    )
    admin_html = guestlist_admin_email(
        full_name=entry.full_name,
        email=entry.email,
        event_name=event_name,
        event_date=event_date,
        venue_name=venue_name,
        party_size=party,
        source_page=entry.source_page or "",
    )

    asyncio.create_task(send_telegram(tg_msg, **notif))
    asyncio.create_task(send_email(
        entry.email,
        "Guestlist Request Received — YVR Advisory",
        user_html,
        **notif,
    ))
    if settings.admin_email:
        asyncio.create_task(send_email(
            settings.admin_email,
            f"New Guestlist Signup — {entry.full_name}",
            admin_html,
            **notif,
        ))

    return entry
