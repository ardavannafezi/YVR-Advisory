from datetime import datetime

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


class WebhookResponse(BaseModel):
    status: str
    action: str  # "created" | "updated"
    event_id: int
