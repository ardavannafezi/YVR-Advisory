from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models.venue import Venue
from app.schemas.venue import VenueList, VenueOut

router = APIRouter(prefix="/api/venues", tags=["venues"])


@router.get("/featured", response_model=list[VenueOut])
async def get_featured(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Venue).where(Venue.is_active == True, Venue.is_featured == True).limit(4)
    )
    return result.scalars().all()


@router.get("", response_model=VenueList)
async def list_venues(
    music_type: str | None = Query(None),
    neighbourhood: str | None = Query(None),
    establishment_type: str | None = Query(None),
    vibe: str | None = Query(None),
    price_tier: str | None = Query(None),
    primary_night: str | None = Query(None),
    dress_code: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    q = select(Venue).where(Venue.is_active == True)
    if music_type:
        q = q.where(Venue.music_types.any(music_type))
    if establishment_type:
        q = q.where(Venue.establishment_type.ilike(f"%{establishment_type}%"))
    if neighbourhood:
        q = q.where(Venue.neighbourhood.ilike(f"%{neighbourhood}%"))
    if vibe:
        q = q.where(Venue.vibe_tags.any(vibe))
    if price_tier:
        q = q.where(Venue.price_tier == price_tier)
    if primary_night:
        q = q.where(Venue.primary_nights.any(primary_night))
    if dress_code:
        q = q.where(Venue.dress_code.ilike(f"%{dress_code}%"))

    total = await db.scalar(select(func.count()).select_from(q.subquery()))
    result = await db.execute(q.offset((page - 1) * limit).limit(limit))
    return VenueList(items=result.scalars().all(), total=total or 0, page=page, limit=limit)


@router.get("/{slug}", response_model=VenueOut)
async def get_venue(slug: str, db: AsyncSession = Depends(get_db)):
    venue = await db.scalar(select(Venue).where(Venue.slug == slug, Venue.is_active == True))
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    return venue
