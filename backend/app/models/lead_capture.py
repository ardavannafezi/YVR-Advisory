from datetime import datetime

from sqlalchemy import Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class LeadCapture(Base):
    __tablename__ = "lead_captures"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(300))
    email: Mapped[str] = mapped_column(String(320), index=True)
    source_type: Mapped[str] = mapped_column(String(50))  # "ticket" | "external_guestlist" | "external_reservation"
    venue_name: Mapped[str | None] = mapped_column(String(300))
    venue_type: Mapped[str | None] = mapped_column(String(100))
    music_type: Mapped[str | None] = mapped_column(String(100))
    event_name: Mapped[str | None] = mapped_column(String(300))
    redirect_url: Mapped[str | None] = mapped_column(String(2000))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
