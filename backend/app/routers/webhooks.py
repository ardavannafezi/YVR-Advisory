import random
from datetime import date

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.dependencies import get_db
from app.models.event import Event
from app.models.venue import Venue
from app.schemas.webhook import N8nEventPayload, WebhookResponse
from app.utils.slugify import slugify

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


@router.post("/n8n", response_model=WebhookResponse, dependencies=[Depends(_verify_api_key)])
async def n8n_webhook(payload: N8nEventPayload, db: AsyncSession = Depends(get_db)):
    existing_event: Event | None = None

    if payload.external_id:
        existing_event = await db.scalar(select(Event).where(Event.external_id == payload.external_id))

    if not existing_event:
        existing_event = await db.scalar(
            select(Event).where(
                Event.name == payload.event_name,
                Event.date.cast(date) == payload.date.date(),
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
