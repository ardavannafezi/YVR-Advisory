import asyncio

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models.reservation import TableReservation
from app.schemas.reservation import ReservationCreate, ReservationOut
from app.utils.notifications import send_email, send_telegram

router = APIRouter(prefix="/api/reservations", tags=["reservations"])


@router.post("", response_model=ReservationOut, status_code=status.HTTP_201_CREATED)
async def submit_reservation(data: ReservationCreate, db: AsyncSession = Depends(get_db)):
    reservation = TableReservation(**data.model_dump())
    db.add(reservation)
    await db.commit()
    await db.refresh(reservation)

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

    asyncio.create_task(send_telegram(tg_msg))
    asyncio.create_task(send_email(reservation.email, "Reservation Request Received — YVR Advisory", user_html))

    return reservation
