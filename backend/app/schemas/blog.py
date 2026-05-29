from datetime import datetime

from pydantic import BaseModel


class BlogPostBase(BaseModel):
    title: str
    summary: str | None = None
    body: str
    cover_image_url: str | None = None
    tags: list[str] = []
    music_type: str | None = None
    author: str | None = None
    is_published: bool = False


class BlogPostCreate(BlogPostBase):
    pass


class BlogPostUpdate(BlogPostBase):
    title: str | None = None
    body: str | None = None


class BlogPostOut(BlogPostBase):
    id: int
    slug: str
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BlogPostList(BaseModel):
    items: list[BlogPostOut]
    total: int
    page: int
    limit: int
