from datetime import datetime

from pydantic import BaseModel, EmailStr


class GuestlistCreate(BaseModel):
    email: EmailStr
    full_name: str
    event_id: int | None = None
    venue_id: int | None = None
    music_type: str | None = None
    party_size: int | None = None
    source_page: str | None = None


class GuestlistOut(GuestlistCreate):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
