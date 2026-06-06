import asyncio

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.dependencies import get_db
from app.models.reservation import TableReservation
from app.models.venue import Venue
from app.schemas.reservation import ReservationCreate, ReservationOut
from app.utils.email_templates import reservation_admin_email, reservation_user_email
from app.utils.notifications import load_db_notif_settings, send_email, send_telegram

router = APIRouter(prefix="/api/reservations", tags=["reservations"])


@router.post("", response_model=ReservationOut, status_code=status.HTTP_201_CREATED)
async def submit_reservation(data: ReservationCreate, db: AsyncSession = Depends(get_db)):
    venue: Venue | None = None
    if data.venue_id:
        venue = await db.get(Venue, data.venue_id)
        if venue and not venue.bottle_service_enabled:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bottle service not available for this venue")

    reservation = TableReservation(**data.model_dump())
    db.add(reservation)
    await db.commit()
    await db.refresh(reservation)

    notif = await load_db_notif_settings(db)

    venue_name = venue.name if venue else "—"
    date_str = reservation.date_requested.strftime("%B %-d, %Y") if reservation.date_requested else "—"

    tg_msg = (
        f"🍾 <b>New Table Reservation</b>\n"
        f"👤 {reservation.full_name} | {reservation.email}\n"
        f"📞 {reservation.phone or '—'}\n"
        f"👥 Party of {reservation.party_size}\n"
        f"🗓 {date_str}\n"
        f"💰 Budget: {reservation.budget_range or '—'}\n"
        f"🎉 Occasion: {reservation.occasion or '—'}\n"
        f"📍 Venue: {venue_name}"
    )

    user_html = reservation_user_email(
        full_name=reservation.full_name,
        venue_name=venue_name,
        date_str=date_str,
        party_size=reservation.party_size,
        occasion=reservation.occasion or "",
        budget_range=reservation.budget_range or "",
    )
    admin_html = reservation_admin_email(
        full_name=reservation.full_name,
        email=reservation.email,
        phone=reservation.phone or "",
        venue_name=venue_name,
        date_str=date_str,
        party_size=reservation.party_size,
        occasion=reservation.occasion or "",
        budget_range=reservation.budget_range or "",
    )

    asyncio.create_task(send_telegram(tg_msg, **notif))
    asyncio.create_task(send_email(
        reservation.email,
        "Reservation Request Received — YVR Advisory",
        user_html,
        **notif,
    ))
    if settings.admin_email:
        asyncio.create_task(send_email(
            settings.admin_email,
            f"New Table Reservation — {reservation.full_name}",
            admin_html,
            **notif,
        ))

    return reservation
