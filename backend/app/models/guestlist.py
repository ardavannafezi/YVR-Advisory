from datetime import datetime

from sqlalchemy import ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class GuestlistEntry(Base):
    __tablename__ = "guestlist_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(320), index=True)
    full_name: Mapped[str] = mapped_column(String(300))
    event_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("events.id", ondelete="SET NULL"))
    venue_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("venues.id", ondelete="SET NULL"))
    music_type: Mapped[str | None] = mapped_column(String(100))
    party_size: Mapped[int | None] = mapped_column(Integer)
    source_page: Mapped[str | None] = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
