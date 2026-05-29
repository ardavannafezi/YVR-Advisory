from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models.reservation import TableReservation
from app.schemas.reservation import ReservationCreate, ReservationOut

router = APIRouter(prefix="/api/reservations", tags=["reservations"])


@router.post("", response_model=ReservationOut, status_code=status.HTTP_201_CREATED)
async def submit_reservation(data: ReservationCreate, db: AsyncSession = Depends(get_db)):
    reservation = TableReservation(**data.model_dump())
    db.add(reservation)
    await db.commit()
    await db.refresh(reservation)
    return reservation
