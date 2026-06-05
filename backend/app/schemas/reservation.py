from datetime import datetime

from pydantic import BaseModel, EmailStr


class ReservationCreate(BaseModel):
    email: EmailStr
    full_name: str
    phone: str | None = None
    venue_id: int | None = None
    event_id: int | None = None
    date_requested: datetime | None = None
    party_size: int | None = None
    occasion: str | None = None
    preferences: str | None = None
    budget_range: str | None = None


class ReservationUpdate(BaseModel):
    status: str


class ReservationOut(ReservationCreate):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
