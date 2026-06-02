from datetime import datetime
from typing import Any

from pydantic import BaseModel


class N8nEventPayload(BaseModel):
    event_name: str
    venue_name: str
    date: datetime
    category: str | None = None
    music_type: str | None = None
    description: str | None = None
    image_url: str | None = None
    ticket_url: str | None = None
    external_id: str | None = None

    lineup: list[dict[str, Any]] | None = None
    gallery: list[str] | None = None
    video_url: str | None = None
    entry_types: list[str] | None = None
    our_guestlist: bool = False
    our_reservation: bool = False
    guestlist_closes_at: datetime | None = None
    entry_closes_at: datetime | None = None


class WebhookResponse(BaseModel):
    status: str
    action: str  # "created" | "updated"
    event_id: int


class N8nBlogPayload(BaseModel):
    title: str
    body: str
    summary: str | None = None
    cover_image_url: str | None = None
    tags: list[str] = []
    music_type: str | None = None
    author: str | None = None
    is_published: bool = True
    external_id: str | None = None


class BlogWebhookResponse(BaseModel):
    status: str
    action: str  # "created" | "updated"
    post_id: int
    slug: str
