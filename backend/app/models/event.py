from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.venue import Venue


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(300), index=True)
    slug: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    venue_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("venues.id"), index=True)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    category: Mapped[str | None] = mapped_column(String(100))
    music_type: Mapped[str | None] = mapped_column(String(100), index=True)
    description: Mapped[str | None] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(String(1000))
    ticket_url: Mapped[str | None] = mapped_column(String(1000))
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    source: Mapped[str] = mapped_column(String(50), default="manual")
    external_id: Mapped[str | None] = mapped_column(String(200), index=True)

    # Extended fields
    lineup: Mapped[list[dict[str, Any]] | None] = mapped_column(JSONB, nullable=True)
    gallery: Mapped[list[str] | None] = mapped_column(ARRAY(Text), nullable=True)
    video_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    entry_types: Mapped[list[str] | None] = mapped_column(ARRAY(Text), nullable=True)
    our_guestlist: Mapped[bool] = mapped_column(Boolean, default=False)
    our_reservation: Mapped[bool] = mapped_column(Boolean, default=False)
    guestlist_closes_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    entry_closes_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    social_proof_count: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    venue: Mapped["Venue | None"] = relationship("Venue", back_populates="events")
