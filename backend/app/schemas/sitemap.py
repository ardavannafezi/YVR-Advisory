from datetime import datetime

from pydantic import BaseModel


class SitemapItem(BaseModel):
    slug: str
    last_modified: datetime | None = None


class SitemapList(BaseModel):
    items: list[SitemapItem]
    total: int
    page: int
    limit: int
    has_next: bool
