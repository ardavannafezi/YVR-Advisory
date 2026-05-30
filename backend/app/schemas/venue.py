from datetime import datetime
from typing import Any

from pydantic import BaseModel


class VenueBase(BaseModel):
    name: str
    description: str | None = None
    address: str | None = None
    neighbourhood: str | None = None
    phone: str | None = None

    # Music & vibe
    music_types: list[str] = []
    vibe_tags: list[str] = []

    # Operational
    primary_nights: list[str] = []
    hours: dict[str, Any] | None = None
    special_nights: list[str] = []
    special_occasion: str | None = None

    # Pricing
    price_tier: str | None = None
    cover_charge_info: str | None = None
    bottle_minimum: int | None = None

    # Access & atmosphere
    dress_code: str | None = None
    age_restriction: int | None = None
    hospitality_company: str | None = None

    establishment_type: str | None = None
    primary_category: str | None = None

    # Media
    capacity: int | None = None
    image_url: str | None = None
    logo_url: str | None = None
    gallery_urls: list[str] = []

    # Maps
    latitude: float | None = None
    longitude: float | None = None

    # FAQs
    faqs: list[dict[str, Any]] | None = None

    website_url: str | None = None
    instagram_url: str | None = None
    reservation_link: str | None = None
    is_featured: bool = False
    is_active: bool = True


class VenueCreate(VenueBase):
    pass


class VenueUpdate(VenueBase):
    name: str | None = None


class VenueOut(VenueBase):
    id: int
    slug: str
    advisory_rating: float | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class VenueList(BaseModel):
    items: list[VenueOut]
    total: int
    page: int
    limit: int


class AdminVenueRow(BaseModel):
    id: int
    slug: str
    name: str
    neighbourhood: str | None = None
    music_types: list[str] = []
    is_active: bool
    is_featured: bool
    view_count: int | None = None
    advisory_rating: float | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ViewCountUpdate(BaseModel):
    view_count: int
