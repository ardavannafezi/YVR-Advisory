from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

from pydantic import BaseModel

from app.schemas.venue import VenueOut


class LineupArtist(BaseModel):
    name: str
    instagram: str | None = None
    tiktok: str | None = None
    youtube: str | None = None


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

    lineup: list[dict[str, Any]] | None = None
    gallery: list[str] | None = None
    video_url: str | None = None
    entry_types: list[str] | None = None
    our_guestlist: bool = False
    our_reservation: bool = False
    guestlist_closes_at: datetime | None = None
    entry_closes_at: datetime | None = None


class EventCreate(EventBase):
    pass


class EventUpdate(EventBase):
    name: str | None = None
    date: datetime | None = None
    social_proof_count: int | None = None


class EventOut(EventBase):
    id: int
    slug: str
    source: str
    external_id: str | None = None
    social_proof_count: int | None = None
    venue: VenueOut | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    def model_post_init(self, __context: Any) -> None:
        """Inherit fields from venue when not set on the event."""
        if self.venue:
            if not self.image_url and self.venue.image_url:
                object.__setattr__(self, "image_url", self.venue.image_url)
            if not self.description and self.venue.description:
                object.__setattr__(self, "description", self.venue.description)
            if not self.music_type and self.venue.music_types:
                object.__setattr__(self, "music_type", self.venue.music_types[0] if self.venue.music_types else None)

        # Auto-compute guestlist_closes_at from venue's guestlist_close_time if not already set
        if (
            self.our_guestlist
            and self.venue
            and self.venue.guestlist_close_time
            and not self.guestlist_closes_at
        ):
            try:
                pt = ZoneInfo("America/Vancouver")
                h, m = (int(x) for x in self.venue.guestlist_close_time.split(":"))
                event_date_pt = self.date.astimezone(pt)
                close_dt_pt = event_date_pt.replace(hour=h, minute=m, second=0, microsecond=0)
                close_dt_utc = close_dt_pt.astimezone(ZoneInfo("UTC"))
                object.__setattr__(self, "guestlist_closes_at", close_dt_utc)
            except Exception:
                pass


class EventList(BaseModel):
    items: list[EventOut]
    total: int
    page: int
    limit: int


class EventRecommendRequest(BaseModel):
    venue_types: list[str] = []
    music_types: list[str] = []
    date: str | None = None  # "tonight" | "weekend" | "week" | None


class SocialProofUpdate(BaseModel):
    count: int
