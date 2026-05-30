from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class VenueAdvisoryRating(Base):
    __tablename__ = "venue_advisory_ratings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    venue_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("venues.id", ondelete="CASCADE"), unique=True, index=True
    )
    rating: Mapped[Decimal] = mapped_column(Numeric(precision=4, scale=1), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
