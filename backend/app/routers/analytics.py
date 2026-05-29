from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.analytics import TrackEvent
from app.services.analytics_service import upsert_preference

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.post("/track", status_code=status.HTTP_204_NO_CONTENT)
async def track(event: TrackEvent, db: AsyncSession = Depends(get_db)):
    await upsert_preference(event.session_id, event.email, event.event_type, event.payload, db)
