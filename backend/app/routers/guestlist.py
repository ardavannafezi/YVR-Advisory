from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models.guestlist import GuestlistEntry
from app.schemas.guestlist import GuestlistCreate, GuestlistOut

router = APIRouter(prefix="/api/guestlist", tags=["guestlist"])


@router.post("", response_model=GuestlistOut, status_code=status.HTTP_201_CREATED)
async def submit_guestlist(data: GuestlistCreate, db: AsyncSession = Depends(get_db)):
    entry = GuestlistEntry(**data.model_dump())
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry
