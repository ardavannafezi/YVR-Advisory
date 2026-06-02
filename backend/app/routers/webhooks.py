import os
import random
import uuid
from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile, status
from sqlalchemy import Date, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.dependencies import get_db
from app.models.event import Event
from app.models.venue import Venue
from app.models.blog import BlogPost
from app.schemas.webhook import BlogWebhookResponse, N8nBlogPayload, N8nEventPayload, WebhookResponse
from app.utils.slugify import slugify
from datetime import datetime, timezone

UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "uploads")
ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])


def _verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != settings.n8n_webhook_api_key:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid API key")


def _apply_payload(event: Event, payload: N8nEventPayload, venue_id: int) -> None:
    event.name = payload.event_name
    event.venue_id = venue_id
    event.date = payload.date
    event.category = payload.category
    event.music_type = payload.music_type
    event.description = payload.description
    event.image_url = payload.image_url
    event.ticket_url = payload.ticket_url
    event.lineup = payload.lineup
    event.gallery = payload.gallery
    event.video_url = payload.video_url
    event.entry_types = payload.entry_types
    event.our_guestlist = payload.our_guestlist
    event.our_reservation = payload.our_reservation
    event.guestlist_closes_at = payload.guestlist_closes_at
    event.entry_closes_at = payload.entry_closes_at
    if payload.external_id:
        event.external_id = payload.external_id


@router.post("/upload", dependencies=[Depends(_verify_api_key)])
async def webhook_upload(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTS:
        raise HTTPException(status_code=400, detail="Image files only (.jpg .jpeg .png .webp .gif)")
    dest_dir = os.path.join(UPLOAD_DIR, "events")
    os.makedirs(dest_dir, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    content = await file.read()
    with open(os.path.join(dest_dir, filename), "wb") as f:
        f.write(content)
    return {"url": f"/uploads/events/{filename}"}


@router.post("/n8n", response_model=WebhookResponse, dependencies=[Depends(_verify_api_key)])
async def n8n_webhook(payload: N8nEventPayload, db: AsyncSession = Depends(get_db)):
    existing_event: Event | None = None

    if payload.external_id:
        existing_event = await db.scalar(select(Event).where(Event.external_id == payload.external_id))

    if not existing_event:
        existing_event = await db.scalar(
            select(Event).where(
                Event.name == payload.event_name,
                Event.date.cast(Date) == payload.date.date(),
            )
        )

    venue = await db.scalar(select(Venue).where(Venue.name == payload.venue_name))
    if not venue:
        slug_base = slugify(payload.venue_name)
        venue = Venue(name=payload.venue_name, slug=slug_base)
        db.add(venue)
        await db.flush()

    if existing_event:
        existing_event.source = "n8n"
        _apply_payload(existing_event, payload, venue.id)
        await db.commit()
        return WebhookResponse(status="ok", action="updated", event_id=existing_event.id)

    slug_base = slugify(f"{payload.event_name} {payload.date.strftime('%Y-%m-%d')}")
    new_event = Event(
        name=payload.event_name,
        slug=slug_base,
        source="n8n",
        is_published=True,
        social_proof_count=random.randint(4, 12),
    )
    _apply_payload(new_event, payload, venue.id)
    db.add(new_event)
    await db.commit()
    await db.refresh(new_event)
    return WebhookResponse(status="ok", action="created", event_id=new_event.id)


@router.get("/context", dependencies=[Depends(_verify_api_key)])
async def get_n8n_context(db: AsyncSession = Depends(get_db)):
    """Knowledge base for n8n bots — returns venues, types, tags, and page URLs."""
    from app.models.blog import BlogPost as BP
    from sqlalchemy import func as sqlfunc

    venues_rows = (await db.execute(
        select(Venue).where(Venue.is_active == True).order_by(Venue.name)
    )).scalars().all()

    tag_rows = (await db.execute(
        select(BlogPost.tags).where(BlogPost.is_published == True)
    )).all()
    existing_blog_tags: list[str] = sorted({t for (tags,) in tag_rows if tags for t in tags})

    SITE = settings.frontend_url

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


@router.post("/n8n-blog", response_model=BlogWebhookResponse, dependencies=[Depends(_verify_api_key)])
async def n8n_blog_webhook(payload: N8nBlogPayload, db: AsyncSession = Depends(get_db)):
    existing: BlogPost | None = None

    if payload.external_id:
        existing = await db.scalar(select(BlogPost).where(BlogPost.external_id == payload.external_id))

    if not existing:
        existing = await db.scalar(select(BlogPost).where(BlogPost.title == payload.title))

    if existing:
        existing.title = payload.title
        existing.body = payload.body
        existing.summary = payload.summary
        existing.cover_image_url = payload.cover_image_url
        existing.tags = payload.tags
        existing.music_type = payload.music_type
        existing.author = payload.author
        existing.is_published = payload.is_published
        if payload.is_published and not existing.published_at:
            existing.published_at = datetime.now(timezone.utc)
        if payload.external_id:
            existing.external_id = payload.external_id
        await db.commit()
        await db.refresh(existing)
        return BlogWebhookResponse(status="ok", action="updated", post_id=existing.id, slug=existing.slug)

    slug = slugify(payload.title)
    post = BlogPost(
        title=payload.title,
        slug=slug,
        body=payload.body,
        summary=payload.summary,
        cover_image_url=payload.cover_image_url,
        tags=payload.tags,
        music_type=payload.music_type,
        author=payload.author,
        is_published=payload.is_published,
        published_at=datetime.now(timezone.utc) if payload.is_published else None,
        external_id=payload.external_id,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return BlogWebhookResponse(status="ok", action="created", post_id=post.id, slug=post.slug)
