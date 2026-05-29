from pydantic import BaseModel


class TrackEvent(BaseModel):
    session_id: str
    email: str | None = None
    event_type: str  # "music_view" | "venue_view" | "quiz_step" | "filter"
    payload: dict = {}


class AnalyticsSummary(BaseModel):
    top_venues: list[dict]
    music_type_distribution: list[dict]
    top_events: list[dict]
    total_guestlist: int
    total_reservations: int
    pending_reservations: int


class TonightRequest(BaseModel):
    music_type: str | None = None
    vibe: str | None = None
    party_size: int | None = None
    budget: str | None = None
