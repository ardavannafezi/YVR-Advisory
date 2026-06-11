from datetime import datetime

from pydantic import BaseModel


class VenueLlmsItem(BaseModel):
    name: str
    slug: str
    description: str | None = None
    neighbourhood: str | None = None
    establishment_type: str | None = None
    music_types: list[str] = []
    updated_at: datetime | None = None


class EventLlmsItem(BaseModel):
    name: str
    slug: str
    description: str | None = None
    date: datetime | None = None
    music_type: str | None = None
    venue_name: str | None = None
    updated_at: datetime | None = None


class BlogLlmsItem(BaseModel):
    title: str
    slug: str
    summary: str | None = None
    music_type: str | None = None
    tags: list[str] = []
    author: str | None = None
    published_at: datetime | None = None
    updated_at: datetime | None = None


class VenueLlmsList(BaseModel):
    items: list[VenueLlmsItem]
    total: int
    page: int
    limit: int
    has_next: bool


class EventLlmsList(BaseModel):
    items: list[EventLlmsItem]
    total: int
    page: int
    limit: int
    has_next: bool


class BlogLlmsList(BaseModel):
    items: list[BlogLlmsItem]
    total: int
    page: int
    limit: int
    has_next: bool
