from datetime import datetime

from pydantic import BaseModel

from app.schemas.venue import VenueOut


class EventBase(BaseModel):
    name: str
    venue_id: int | None = None
    date: datetime
    category: str | None = None
    music_type: str | None = None
    description: str | None = None
    image_url: str | None = None
    ticket_url: str | None = None
    is_published: bool = True


class EventCreate(EventBase):
    pass


class EventUpdate(EventBase):
    name: str | None = None
    date: datetime | None = None


class EventOut(EventBase):
    id: int
    slug: str
    source: str
    external_id: str | None = None
    venue: VenueOut | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class EventList(BaseModel):
    items: list[EventOut]
    total: int
    page: int
    limit: int
