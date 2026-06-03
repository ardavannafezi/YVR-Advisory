import asyncio

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models.reservation import TableReservation
from app.models.venue import Venue
from app.schemas.reservation import ReservationCreate, ReservationOut
from app.utils.notifications import load_db_notif_settings, send_email, send_telegram

router = APIRouter(prefix="/api/reservations", tags=["reservations"])


@router.post("", response_model=ReservationOut, status_code=status.HTTP_201_CREATED)
async def submit_reservation(data: ReservationCreate, db: AsyncSession = Depends(get_db)):
    if data.venue_id:
        venue = await db.get(Venue, data.venue_id)
        if venue and not venue.bottle_service_enabled:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bottle service not available for this venue")

    reservation = TableReservation(**data.model_dump())
    db.add(reservation)
    await db.commit()
    await db.refresh(reservation)

    notif = await load_db_notif_settings(db)

    date_str = reservation.date_requested.strftime("%b %d, %Y") if reservation.date_requested else "—"
    tg_msg = (
        f"🍾 <b>New Table Reservation</b>\n"
        f"👤 {reservation.full_name} | {reservation.email}\n"
        f"📞 {reservation.phone or '—'}\n"
        f"👥 Party of {reservation.party_size}\n"
        f"🗓 {date_str}\n"
        f"💰 Budget: {reservation.budget_range or '—'}\n"
        f"🎉 Occasion: {reservation.occasion or '—'}\n"
        f"📍 Event ID: {reservation.event_id or '—'} | Venue ID: {reservation.venue_id or '—'}"
    )
    user_html = f"""
    <p>Hi {reservation.full_name},</p>
    <p>Thank you for your reservation request. Our advisory team will be in contact with you shortly to confirm all the details.</p>
    <p>We look forward to making your night exceptional.</p>
    <br>
    <p>— YVR Advisory</p>
    """

    asyncio.create_task(send_telegram(tg_msg, **notif))
    asyncio.create_task(send_email(reservation.email, "Reservation Request Received — YVR Advisory", user_html, **notif))

    return reservation
