from datetime import datetime

from pydantic import BaseModel, HttpUrl


class VenueBase(BaseModel):
    name: str
    description: str | None = None
    address: str | None = None
    neighbourhood: str | None = None
    music_types: list[str] = []
    vibe_tags: list[str] = []
    capacity: int | None = None
    image_url: str | None = None
    website_url: str | None = None
    instagram_url: str | None = None
    is_featured: bool = False
    is_active: bool = True


class VenueCreate(VenueBase):
    pass


class VenueUpdate(VenueBase):
    name: str | None = None


class VenueOut(VenueBase):
    id: int
    slug: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class VenueList(BaseModel):
    items: list[VenueOut]
    total: int
    page: int
    limit: int
