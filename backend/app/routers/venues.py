from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models.venue import Venue
from app.models.venue_advisory_rating import VenueAdvisoryRating
from app.models.venue_view import VenueView
from app.schemas.venue import VenueList, VenueOut

router = APIRouter(prefix="/api/venues", tags=["venues"])


def _attach_rating(venue: Venue, rating_val: float | None) -> VenueOut:
    out = VenueOut.model_validate(venue)
    out.advisory_rating = rating_val
    return out


@router.get("/featured", response_model=list[VenueOut])
async def get_featured(
    category: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    filters = [Venue.is_active == True, Venue.is_featured == True]
    if category:
        filters.append(Venue.primary_categories.any(category))

    result = await db.execute(
        select(Venue, VenueAdvisoryRating.rating)
        .outerjoin(VenueAdvisoryRating, Venue.id == VenueAdvisoryRating.venue_id)
        .where(*filters)
        .limit(4)
    )
    rows = result.all()
    return [_attach_rating(v, float(r) if r is not None else None) for v, r in rows]


@router.get("", response_model=VenueList)
async def list_venues(
    music_type: str | None = Query(None),
    neighbourhood: str | None = Query(None),
    establishment_type: str | None = Query(None),
    primary_category: str | None = Query(None),
    vibe: str | None = Query(None),
    price_tier: str | None = Query(None),
    primary_night: str | None = Query(None),
    dress_code: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    filters = [Venue.is_active == True]

    if music_type:
        filters.append(Venue.music_types.any(music_type))
    if establishment_type:
        filters.append(Venue.establishment_type.ilike(f"%{establishment_type}%"))
    if primary_category:
        filters.append(Venue.primary_categories.any(primary_category))
    if neighbourhood:
        filters.append(Venue.neighbourhood.ilike(f"%{neighbourhood}%"))
    if vibe:
        filters.append(Venue.vibe_tags.any(vibe))
    if price_tier:
        filters.append(Venue.price_tier == price_tier)
    if primary_night:
        filters.append(Venue.primary_nights.any(primary_night))
    if dress_code:
        filters.append(Venue.dress_code.ilike(f"%{dress_code}%"))

    q = (
        select(Venue, VenueAdvisoryRating.rating)
        .outerjoin(VenueView, Venue.id == VenueView.venue_id)
        .outerjoin(VenueAdvisoryRating, Venue.id == VenueAdvisoryRating.venue_id)
        .where(*filters)
        .order_by(func.coalesce(VenueView.view_count, 0).desc())
    )

    count_q = select(func.count()).select_from(
        select(Venue).where(*filters).subquery()
    )

    total = await db.scalar(count_q)
    result = await db.execute(q.offset((page - 1) * limit).limit(limit))
    rows = result.all()
    items = [_attach_rating(v, float(r) if r is not None else None) for v, r in rows]
    return VenueList(items=items, total=total or 0, page=page, limit=limit)


@router.get("/{slug}", response_model=VenueOut)
async def get_venue(slug: str, db: AsyncSession = Depends(get_db)):
    row = await db.execute(
        select(Venue, VenueAdvisoryRating.rating)
        .outerjoin(VenueAdvisoryRating, Venue.id == VenueAdvisoryRating.venue_id)
        .where(Venue.slug == slug, Venue.is_active == True)
    )
    pair = row.one_or_none()
    if not pair:
        raise HTTPException(status_code=404, detail="Venue not found")
    venue, rating = pair
    return _attach_rating(venue, float(rating) if rating is not None else None)


@router.post("/{slug}/view", status_code=204)
async def increment_view(slug: str, db: AsyncSession = Depends(get_db)):
    venue = await db.scalar(select(Venue).where(Venue.slug == slug, Venue.is_active == True))
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")

    stmt = pg_insert(VenueView).values(venue_id=venue.id, view_count=1)
    stmt = stmt.on_conflict_do_update(
        index_elements=["venue_id"],
        set_={"view_count": VenueView.view_count + 1, "updated_at": func.now()},
    )
    await db.execute(stmt)
    await db.commit()


@router.put("/{venue_id}/advisory-rating", status_code=204)
async def set_advisory_rating(
    venue_id: int,
    rating: float = Query(..., ge=0, le=10),
    db: AsyncSession = Depends(get_db),
):
    venue = await db.scalar(select(Venue).where(Venue.id == venue_id, Venue.is_active == True))
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")

    stmt = pg_insert(VenueAdvisoryRating).values(venue_id=venue_id, rating=rating)
    stmt = stmt.on_conflict_do_update(
        index_elements=["venue_id"],
        set_={"rating": rating, "updated_at": func.now()},
    )
    await db.execute(stmt)
    await db.commit()
