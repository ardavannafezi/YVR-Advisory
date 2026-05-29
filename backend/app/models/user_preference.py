from datetime import datetime

from sqlalchemy import ARRAY, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    email: Mapped[str | None] = mapped_column(String(320), index=True)
    music_types_viewed: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    venue_types_viewed: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    venue_names_viewed: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    quiz_answers: Mapped[dict | None] = mapped_column(JSON)
    last_seen: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
