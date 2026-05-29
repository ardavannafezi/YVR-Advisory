from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models.blog import BlogPost
from app.schemas.blog import BlogPostList, BlogPostOut

router = APIRouter(prefix="/api/blog", tags=["blog"])


@router.get("", response_model=BlogPostList)
async def list_posts(
    tags: str | None = Query(None),
    music_type: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(9, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    q = select(BlogPost).where(BlogPost.is_published == True)
    if tags:
        q = q.where(BlogPost.tags.any(tags))
    if music_type:
        q = q.where(BlogPost.music_type == music_type)

    total = await db.scalar(select(func.count()).select_from(q.subquery()))
    result = await db.execute(q.order_by(BlogPost.published_at.desc()).offset((page - 1) * limit).limit(limit))
    return BlogPostList(items=result.scalars().all(), total=total or 0, page=page, limit=limit)


@router.get("/{slug}", response_model=BlogPostOut)
async def get_post(slug: str, db: AsyncSession = Depends(get_db)):
    post = await db.scalar(select(BlogPost).where(BlogPost.slug == slug, BlogPost.is_published == True))
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post
