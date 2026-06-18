import io
import os
import random
import uuid
from datetime import datetime, timezone

from PIL import Image

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from pydantic import BaseModel
from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies import get_current_admin, get_db
from app.models.admin_user import AdminUser
from app.models.blog import BlogPost
from app.models.event import Event
from app.models.guestlist import GuestlistEntry
from app.models.reservation import TableReservation
from app.models.venue import Venue
from app.models.venue_advisory_rating import VenueAdvisoryRating
from app.models.venue_view import VenueView
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.blog import BlogPostCreate, BlogPostOut, BlogPostUpdate
from app.schemas.event import EventCreate, EventOut, EventUpdate, SocialProofUpdate
from app.schemas.guestlist import GuestlistOut
from app.schemas.reservation import ReservationOut, ReservationUpdate
from app.schemas.venue import AdminVenueRow, ViewCountUpdate, VenueCreate, VenueOut, VenueUpdate
from app.models.notification_settings import NotificationSettings
from app.services.analytics_service import get_summary
from app.utils.notifications import send_email, send_telegram
from app.utils.security import create_access_token, hash_password, verify_password
from app.utils.slugify import slugify

UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "uploads")
ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


class RatingUpdate(BaseModel):
    rating: float

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ─── Auth ────────────────────────────────────────────────────────────────────

@router.post("/auth/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    admin = await db.scalar(select(AdminUser).where(AdminUser.email == req.email, AdminUser.is_active == True))
    if not admin or not verify_password(req.password, admin.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return TokenResponse(access_token=create_access_token(admin.email))


# ─── Venues ──────────────────────────────────────────────────────────────────

@router.get("/venues", response_model=list[AdminVenueRow], dependencies=[Depends(get_current_admin)])
async def admin_list_venues(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Venue, VenueView.view_count, VenueAdvisoryRating.rating)
        .outerjoin(VenueView, Venue.id == VenueView.venue_id)
        .outerjoin(VenueAdvisoryRating, Venue.id == VenueAdvisoryRating.venue_id)
        .order_by(Venue.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    return [
        AdminVenueRow(
            id=v.id,
            slug=v.slug,
            name=v.name,
            neighbourhood=v.neighbourhood,
            music_types=v.music_types or [],
            is_active=v.is_active,
            is_featured=v.is_featured,
            view_count=vc,
            advisory_rating=float(ar) if ar is not None else None,
            created_at=v.created_at,
            updated_at=v.updated_at,
        )
        for v, vc, ar in result
    ]


@router.get("/venues/{venue_id}", response_model=VenueOut, dependencies=[Depends(get_current_admin)])
async def admin_get_venue(venue_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Venue, VenueAdvisoryRating.rating)
        .outerjoin(VenueAdvisoryRating, Venue.id == VenueAdvisoryRating.venue_id)
        .where(Venue.id == venue_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Venue not found")
    venue, rating = row
    out = VenueOut.model_validate(venue)
    out.advisory_rating = float(rating) if rating is not None else None
    return out


@router.post("/venues", response_model=VenueOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_admin)])
async def admin_create_venue(data: VenueCreate, db: AsyncSession = Depends(get_db)):
    slug = slugify(data.name)
    venue = Venue(**data.model_dump(), slug=slug)
    db.add(venue)
    await db.commit()
    await db.refresh(venue)
    return venue


@router.put("/venues/{venue_id}", response_model=VenueOut, dependencies=[Depends(get_current_admin)])
async def admin_update_venue(venue_id: int, data: VenueUpdate, db: AsyncSession = Depends(get_db)):
    venue = await db.get(Venue, venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(venue, k, v)
    await db.commit()
    await db.refresh(venue)
    return venue


@router.delete("/venues/{venue_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin)])
async def admin_delete_venue(venue_id: int, db: AsyncSession = Depends(get_db)):
    venue = await db.get(Venue, venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    await db.delete(venue)
    await db.commit()


@router.put("/venues/{venue_id}/views", dependencies=[Depends(get_current_admin)])
async def admin_update_venue_views(venue_id: int, data: ViewCountUpdate, db: AsyncSession = Depends(get_db)):
    venue = await db.get(Venue, venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    existing = await db.scalar(select(VenueView).where(VenueView.venue_id == venue_id))
    if existing:
        existing.view_count = data.view_count
    else:
        db.add(VenueView(venue_id=venue_id, view_count=data.view_count))
    await db.commit()
    return {"venue_id": venue_id, "view_count": data.view_count}


@router.put("/venues/{venue_id}/rating", dependencies=[Depends(get_current_admin)])
async def admin_update_venue_rating(venue_id: int, data: RatingUpdate, db: AsyncSession = Depends(get_db)):
    venue = await db.get(Venue, venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    stmt = pg_insert(VenueAdvisoryRating).values(venue_id=venue_id, rating=data.rating)
    stmt = stmt.on_conflict_do_update(
        index_elements=["venue_id"],
        set_={"rating": data.rating, "updated_at": func.now()},
    )
    await db.execute(stmt)
    await db.commit()
    return {"venue_id": venue_id, "rating": data.rating}


MAX_DIMENSION = 1920

def _to_webp(content: bytes) -> bytes:
    img = Image.open(io.BytesIO(content))
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA" if "transparency" in img.info or img.mode in ("RGBA", "LA", "PA") else "RGB")
    # Resize down if either dimension exceeds MAX_DIMENSION, preserve aspect ratio
    if img.width > MAX_DIMENSION or img.height > MAX_DIMENSION:
        img.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=75, method=4)
    return buf.getvalue()


@router.post("/upload", dependencies=[Depends(get_current_admin)])
async def admin_upload_file(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTS:
        raise HTTPException(status_code=400, detail="Image files only (.jpg .jpeg .png .webp .gif)")
    content = await file.read()
    # GIFs kept as-is (may be animated); everything else → WebP
    if ext != ".gif":
        content = _to_webp(content)
        ext = ".webp"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = os.path.join(UPLOAD_DIR, "venues", filename)
    with open(dest, "wb") as f:
        f.write(content)
    return {"url": f"/uploads/venues/{filename}"}


@router.post("/convert-images-webp", dependencies=[Depends(get_current_admin)])
async def convert_existing_images_to_webp(db: AsyncSession = Depends(get_db)):
    """One-time conversion of existing local uploads to WebP. Updates DB image_url fields."""
    venues_dir = os.path.join(UPLOAD_DIR, "venues")
    converted = []
    skipped = []

    if not os.path.isdir(venues_dir):
        return {"converted": 0, "skipped": 0, "detail": "uploads/venues dir not found"}

    for fname in os.listdir(venues_dir):
        fpath = os.path.join(venues_dir, fname)
        ext = os.path.splitext(fname)[1].lower()
        if ext in (".webp", ".gif") or not os.path.isfile(fpath):
            skipped.append(fname)
            continue
        if ext not in (".jpg", ".jpeg", ".png"):
            skipped.append(fname)
            continue
        try:
            with open(fpath, "rb") as f:
                original = f.read()
            webp_bytes = _to_webp(original)
            new_fname = os.path.splitext(fname)[0] + ".webp"
            new_path = os.path.join(venues_dir, new_fname)
            with open(new_path, "wb") as f:
                f.write(webp_bytes)

            old_url = f"/uploads/venues/{fname}"
            new_url = f"/uploads/venues/{new_fname}"

            # Update Venue image_url
            venues = (await db.execute(select(Venue).where(Venue.image_url == old_url))).scalars().all()
            for v in venues:
                v.image_url = new_url

            # Update Event image_url
            events = (await db.execute(select(Event).where(Event.image_url == old_url))).scalars().all()
            for e in events:
                e.image_url = new_url

            os.remove(fpath)
            converted.append(fname)
        except Exception as exc:
            skipped.append(f"{fname} (error: {exc})")

    await db.commit()
    return {"converted": len(converted), "skipped": len(skipped), "files": converted}


# ─── Events ──────────────────────────────────────────────────────────────────

@router.get("/events/{event_id}", response_model=EventOut, dependencies=[Depends(get_current_admin)])
async def admin_get_event(event_id: int, db: AsyncSession = Depends(get_db)):
    event = await db.scalar(select(Event).options(selectinload(Event.venue)).where(Event.id == event_id))
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.get("/events", response_model=list[EventOut], dependencies=[Depends(get_current_admin)])
async def admin_list_events(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Event).options(selectinload(Event.venue)).order_by(Event.date.desc()).offset((page - 1) * limit).limit(limit)
    )
    return result.scalars().all()


@router.post("/events", response_model=EventOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_admin)])
async def admin_create_event(data: EventCreate, db: AsyncSession = Depends(get_db)):
    if data.date and data.date < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Event date is in the past")
    base_slug = slugify(f"{data.name} {data.date.strftime('%Y-%m-%d')}")
    slug = base_slug
    # resolve slug collisions
    for i in range(1, 10):
        existing = await db.scalar(select(Event).where(Event.slug == slug))
        if not existing:
            break
        slug = f"{base_slug}-{i}"
    try:
        event = Event(**data.model_dump(), slug=slug, source="manual", social_proof_count=random.randint(4, 12))
        db.add(event)
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status_code=409, detail=f"Could not create event: {exc.orig}") from exc
    event = await db.scalar(select(Event).options(selectinload(Event.venue)).where(Event.id == event.id))
    return event


@router.put("/events/{event_id}/social-proof", dependencies=[Depends(get_current_admin)])
async def admin_set_social_proof(event_id: int, data: SocialProofUpdate, db: AsyncSession = Depends(get_db)):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    event.social_proof_count = data.count
    await db.commit()
    return {"event_id": event_id, "social_proof_count": event.social_proof_count}


@router.put("/events/{event_id}", response_model=EventOut, dependencies=[Depends(get_current_admin)])
async def admin_update_event(event_id: int, data: EventUpdate, db: AsyncSession = Depends(get_db)):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(event, k, v)
    await db.commit()
    event = await db.scalar(select(Event).options(selectinload(Event.venue)).where(Event.id == event_id))
    return event


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin)])
async def admin_delete_event(event_id: int, db: AsyncSession = Depends(get_db)):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    await db.delete(event)
    await db.commit()


@router.delete("/events-past", dependencies=[Depends(get_current_admin)])
async def admin_delete_past_events(db: AsyncSession = Depends(get_db)):
    now_utc = datetime.now(timezone.utc)
    result = await db.execute(select(Event).where(Event.date < now_utc))
    past_events = result.scalars().all()
    if not past_events:
        return {"deleted": 0}
    ids = [e.id for e in past_events]
    await db.execute(delete(Event).where(Event.id.in_(ids)))
    await db.commit()
    return {"deleted": len(ids)}


# ─── Blog ────────────────────────────────────────────────────────────────────

@router.get("/blog", response_model=list[BlogPostOut], dependencies=[Depends(get_current_admin)])
async def admin_list_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BlogPost).order_by(BlogPost.created_at.desc()).offset((page - 1) * limit).limit(limit)
    )
    return result.scalars().all()


@router.post("/blog", response_model=BlogPostOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_admin)])
async def admin_create_post(data: BlogPostCreate, db: AsyncSession = Depends(get_db)):
    slug = slugify(data.title)
    post = BlogPost(**data.model_dump(), slug=slug)
    if data.is_published and not post.published_at:
        post.published_at = datetime.now(timezone.utc)
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post


@router.get("/blog/{post_id}", response_model=BlogPostOut, dependencies=[Depends(get_current_admin)])
async def admin_get_post(post_id: int, db: AsyncSession = Depends(get_db)):
    post = await db.get(BlogPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.put("/blog/{post_id}", response_model=BlogPostOut, dependencies=[Depends(get_current_admin)])
async def admin_update_post(post_id: int, data: BlogPostUpdate, db: AsyncSession = Depends(get_db)):
    post = await db.get(BlogPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(post, k, v)
    if data.is_published and not post.published_at:
        post.published_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(post)
    return post


@router.delete("/blog/{post_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin)])
async def admin_delete_post(post_id: int, db: AsyncSession = Depends(get_db)):
    post = await db.get(BlogPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    await db.delete(post)
    await db.commit()


# ─── n8n Context ─────────────────────────────────────────────────────────────

@router.get("/n8n-context", dependencies=[Depends(get_current_admin)])
async def admin_n8n_context(db: AsyncSession = Depends(get_db)):
    """Same data as GET /api/webhooks/context but JWT-protected for admin preview."""
    from app.config import settings as cfg

    venues_rows = (await db.execute(
        select(Venue).where(Venue.is_active == True).order_by(Venue.name)
    )).scalars().all()

    tag_rows = (await db.execute(
        select(BlogPost.tags).where(BlogPost.is_published == True)
    )).all()
    existing_blog_tags: list[str] = sorted({t for (tags,) in tag_rows if tags for t in tags})

    SITE = cfg.frontend_url
    return {
        "site_url": SITE,
        "venues": [
            {
                "name": v.name,
                "slug": v.slug,
                "url": f"{SITE}/venues/{v.slug}",
                "establishment_type": v.establishment_type,
                "neighbourhood": v.neighbourhood,
                "music_types": v.music_types or [],
                "vibe_tags": v.vibe_tags or [],
                "price_tier": v.price_tier,
                "is_active": v.is_active,
            }
            for v in venues_rows
        ],
        "all_music_types": sorted({mt for v in venues_rows for mt in (v.music_types or [])}),
        "all_vibe_tags": sorted({tag for v in venues_rows for tag in (v.vibe_tags or [])}),
        "existing_blog_tags": existing_blog_tags,
        "event_music_types": ["house", "techno", "hip-hop", "r&b", "latin", "edm", "open-format", "top40", "afrobeats"],
        "establishment_types": ["Nightclub", "Cocktail Bar", "Bar & Restaurant", "Rooftop Lounge"],
        "key_pages": {
            "home": SITE,
            "venues": f"{SITE}/venues",
            "events": f"{SITE}/events",
            "blog": f"{SITE}/blog",
            "tonight": f"{SITE}/tonight",
            "guestlist": f"{SITE}/guestlist",
            "reserve": f"{SITE}/reserve",
        },
    }


# ─── Guestlist ───────────────────────────────────────────────────────────────

@router.get("/guestlist", response_model=list[GuestlistOut], dependencies=[Depends(get_current_admin)])
async def admin_list_guestlist(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GuestlistEntry).order_by(GuestlistEntry.created_at.desc()).offset((page - 1) * limit).limit(limit)
    )
    return result.scalars().all()


# ─── Reservations ────────────────────────────────────────────────────────────

@router.get("/reservations", response_model=list[ReservationOut], dependencies=[Depends(get_current_admin)])
async def admin_list_reservations(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TableReservation).order_by(TableReservation.created_at.desc()).offset((page - 1) * limit).limit(limit)
    )
    return result.scalars().all()


@router.put("/reservations/{res_id}", response_model=ReservationOut, dependencies=[Depends(get_current_admin)])
async def admin_update_reservation(res_id: int, data: ReservationUpdate, db: AsyncSession = Depends(get_db)):
    res = await db.get(TableReservation, res_id)
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    res.status = data.status
    await db.commit()
    await db.refresh(res)
    return res


# ─── Analytics ───────────────────────────────────────────────────────────────

@router.get("/analytics/summary", dependencies=[Depends(get_current_admin)])
async def admin_analytics_summary(db: AsyncSession = Depends(get_db)):
    return await get_summary(db)


@router.get("/analytics/emails", dependencies=[Depends(get_current_admin)])
async def admin_analytics_emails(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(GuestlistEntry.email, func.count(GuestlistEntry.id).label("submissions"))
        .group_by(GuestlistEntry.email)
        .order_by(func.count(GuestlistEntry.id).desc())
        .limit(100)
    )
    return [{"email": r.email, "submissions": r.submissions} for r in result]


# ─── Notification settings ────────────────────────────────────────────────────

class NotificationSettingsIn(BaseModel):
    resend_api_key: str = ""
    email_from: str = ""
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""


class NotificationSettingsOut(BaseModel):
    resend_api_key: str = ""
    email_from: str = ""
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""

    model_config = {"from_attributes": True}


class TestEmailRequest(BaseModel):
    to: str


@router.get("/settings/notifications", response_model=NotificationSettingsOut, dependencies=[Depends(get_current_admin)])
async def get_notification_settings(db: AsyncSession = Depends(get_db)):
    row = await db.scalar(select(NotificationSettings).where(NotificationSettings.id == 1))
    if not row:
        return NotificationSettingsOut()
    return NotificationSettingsOut.model_validate(row)


@router.post("/settings/notifications", response_model=NotificationSettingsOut, dependencies=[Depends(get_current_admin)])
async def save_notification_settings(data: NotificationSettingsIn, db: AsyncSession = Depends(get_db)):
    row = await db.scalar(select(NotificationSettings).where(NotificationSettings.id == 1))
    if not row:
        row = NotificationSettings(id=1)
        db.add(row)
    row.resend_api_key = data.resend_api_key or None
    row.email_from = data.email_from or None
    row.telegram_bot_token = data.telegram_bot_token or None
    row.telegram_chat_id = data.telegram_chat_id or None
    await db.commit()
    await db.refresh(row)
    return NotificationSettingsOut.model_validate(row)


@router.post("/settings/test-email", dependencies=[Depends(get_current_admin)])
async def send_test_email(req: TestEmailRequest, db: AsyncSession = Depends(get_db)):
    from app.utils.notifications import load_db_notif_settings
    from app.utils.email_templates import test_email
    notif = await load_db_notif_settings(db)
    await send_email(req.to, "Test Email — YVR Advisory", test_email(), **notif)
    return {"ok": True}


@router.post("/settings/test-telegram", dependencies=[Depends(get_current_admin)])
async def send_test_telegram(db: AsyncSession = Depends(get_db)):
    from app.utils.notifications import load_db_notif_settings
    notif = await load_db_notif_settings(db)
    await send_telegram("🔔 YVR Advisory — Telegram notifications are working.", **notif)
    return {"ok": True}
