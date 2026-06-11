from datetime import datetime

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, EmailStr
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_admin, get_db
from app.models.lead_capture import LeadCapture

router = APIRouter(tags=["leads"])


class LeadCaptureCreate(BaseModel):
    name: str
    email: EmailStr
    source_type: str
    venue_name: str | None = None
    venue_type: str | None = None
    music_type: str | None = None
    event_name: str | None = None
    redirect_url: str | None = None


class LeadCaptureOut(BaseModel):
    id: int
    name: str
    email: str
    source_type: str
    venue_name: str | None
    venue_type: str | None
    music_type: str | None
    event_name: str | None
    redirect_url: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


@router.post("/api/leads", response_model=LeadCaptureOut, status_code=201)
async def capture_lead(data: LeadCaptureCreate, db: AsyncSession = Depends(get_db)):
    lead = LeadCapture(**data.model_dump())
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    return lead


@router.get("/api/admin/leads", response_model=list[LeadCaptureOut], dependencies=[Depends(get_current_admin)])
async def admin_list_leads(
    q: str | None = Query(None),
    source_type: str | None = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LeadCapture).order_by(LeadCapture.created_at.desc())
    if q:
        like = f"%{q}%"
        stmt = stmt.where(
            or_(
                func.lower(LeadCapture.name).contains(q.lower()),
                func.lower(LeadCapture.email).contains(q.lower()),
                func.lower(LeadCapture.venue_name).contains(q.lower()),
                func.lower(LeadCapture.event_name).contains(q.lower()),
            )
        )
    if source_type:
        stmt = stmt.where(LeadCapture.source_type == source_type)
    stmt = stmt.offset(offset).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()
