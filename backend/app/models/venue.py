from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import ARRAY, Boolean, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.event import Event


class Venue(Base):
    __tablename__ = "venues"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text)
    address: Mapped[str | None] = mapped_column(String(500))
    neighbourhood: Mapped[str | None] = mapped_column(String(100))
    phone: Mapped[str | None] = mapped_column(String(50))

    # Music & vibe
    music_types: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    vibe_tags: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)

    # Operational details
    primary_nights: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    hours: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    special_nights: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    special_occasion: Mapped[str | None] = mapped_column(Text)

    # Pricing
    price_tier: Mapped[str | None] = mapped_column(String(10))
    cover_charge_info: Mapped[str | None] = mapped_column(String(500))
    bottle_minimum: Mapped[int | None] = mapped_column(Integer)

    # Access & atmosphere
    dress_code: Mapped[str | None] = mapped_column(String(200))
    age_restriction: Mapped[int | None] = mapped_column(Integer)
    hospitality_company: Mapped[str | None] = mapped_column(String(200))

    establishment_type: Mapped[str | None] = mapped_column(String(100))
    primary_category: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)

    # Media
    capacity: Mapped[int | None] = mapped_column(Integer)
    image_url: Mapped[str | None] = mapped_column(String(1000))
    logo_url: Mapped[str | None] = mapped_column(String(1000))
    gallery_urls: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)

    # Maps
    latitude: Mapped[float | None] = mapped_column()
    longitude: Mapped[float | None] = mapped_column()

    # FAQs
    faqs: Mapped[list[dict[str, Any]] | None] = mapped_column(JSONB)

    website_url: Mapped[str | None] = mapped_column(String(1000))
    instagram_url: Mapped[str | None] = mapped_column(String(1000))
    reservation_link: Mapped[str | None] = mapped_column(String(1000))
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    events: Mapped[list["Event"]] = relationship("Event", back_populates="venue")
