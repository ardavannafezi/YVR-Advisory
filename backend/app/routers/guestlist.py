import asyncio

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models.event import Event
from app.models.guestlist import GuestlistEntry
from app.models.venue import Venue
from app.schemas.guestlist import GuestlistCreate, GuestlistOut
from app.utils.notifications import load_db_notif_settings, send_email, send_telegram

router = APIRouter(prefix="/api/guestlist", tags=["guestlist"])


@router.post("", response_model=GuestlistOut, status_code=status.HTTP_201_CREATED)
async def submit_guestlist(data: GuestlistCreate, db: AsyncSession = Depends(get_db)):
    entry = GuestlistEntry(**data.model_dump())
    db.add(entry)
    await db.commit()
    await db.refresh(entry)

    notif = await load_db_notif_settings(db)

    # Resolve event and venue names for notification
    event_name = "—"
    event_date = "—"
    venue_name = "—"

    if entry.event_id:
        event = await db.get(Event, entry.event_id)
        if event:
            event_name = event.name
            event_date = event.date.strftime("%-d %b %Y, %-I:%M %p") if event.date else "—"
            if event.venue_id:
                venue = await db.get(Venue, event.venue_id)
                if venue:
                    venue_name = venue.name
    elif entry.venue_id:
        venue = await db.get(Venue, entry.venue_id)
        if venue:
            venue_name = venue.name

    tg_msg = (
        f"🎟 <b>New Guestlist Signup</b>\n"
        f"👤 {entry.full_name} | {entry.email}\n"
        f"👥 Party of {entry.party_size or 1}\n"
        f"🎉 Event: {event_name}\n"
        f"📅 Date: {event_date}\n"
        f"📍 Venue: {venue_name}"
    )
    user_html = f"""
    <p>Hi {entry.full_name},</p>
    <p>You're confirmed on the guestlist. Your entry is under <strong>{entry.full_name}</strong>.</p>
    <p>Show your name at the door and you're in. See you tonight.</p>
    <br>
    <p>— YVR Advisory</p>
    """

    asyncio.create_task(send_telegram(tg_msg, **notif))
    asyncio.create_task(send_email(entry.email, "You're on the guestlist — YVR Advisory", user_html, **notif))

    return entry
