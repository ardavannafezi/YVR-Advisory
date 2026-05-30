from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class VenueView(Base):
    __tablename__ = "venue_views"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    venue_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("venues.id", ondelete="CASCADE"), unique=True, index=True
    )
    view_count: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
