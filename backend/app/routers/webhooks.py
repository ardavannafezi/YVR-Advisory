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
        existing_event.name = payload.event_name
        existing_event.venue_id = venue.id
        existing_event.date = payload.date
        existing_event.category = payload.category
        existing_event.music_type = payload.music_type
        existing_event.description = payload.description
        existing_event.image_url = payload.image_url
        existing_event.ticket_url = payload.ticket_url
        existing_event.source = "n8n"
        if payload.external_id:
            existing_event.external_id = payload.external_id
        await db.commit()
        return WebhookResponse(status="ok", action="updated", event_id=existing_event.id)

    slug_base = slugify(f"{payload.event_name} {payload.date.strftime('%Y-%m-%d')}")
    new_event = Event(
        name=payload.event_name,
        slug=slug_base,
        venue_id=venue.id,
        date=payload.date,
        category=payload.category,
        music_type=payload.music_type,
        description=payload.description,
        image_url=payload.image_url,
        ticket_url=payload.ticket_url,
        source="n8n",
        external_id=payload.external_id,
        is_published=True,
    )
    db.add(new_event)
    await db.commit()
    await db.refresh(new_event)
    return WebhookResponse(status="ok", action="created", event_id=new_event.id)
