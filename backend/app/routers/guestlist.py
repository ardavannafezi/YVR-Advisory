import asyncio

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models.guestlist import GuestlistEntry
from app.schemas.guestlist import GuestlistCreate, GuestlistOut
from app.utils.notifications import send_email, send_telegram

router = APIRouter(prefix="/api/guestlist", tags=["guestlist"])


@router.post("", response_model=GuestlistOut, status_code=status.HTTP_201_CREATED)
async def submit_guestlist(data: GuestlistCreate, db: AsyncSession = Depends(get_db)):
    entry = GuestlistEntry(**data.model_dump())
    db.add(entry)
    await db.commit()
    await db.refresh(entry)

    tg_msg = (
        f"🎟 <b>New Guestlist Signup</b>\n"
        f"👤 {entry.full_name} | {entry.email}\n"
        f"👥 Party of {entry.party_size or 1}\n"
        f"📍 Event ID: {entry.event_id or '—'} | Venue ID: {entry.venue_id or '—'}"
    )
    user_html = f"""
    <p>Hi {entry.full_name},</p>
    <p>You're confirmed on the guestlist. Your entry is under <strong>{entry.full_name}</strong>.</p>
    <p>Show your name at the door and you're in. See you tonight.</p>
    <br>
    <p>— YVR Advisory</p>
    """

    asyncio.create_task(send_telegram(tg_msg))
    asyncio.create_task(send_email(entry.email, "You're on the guestlist — YVR Advisory", user_html))

    return entry
