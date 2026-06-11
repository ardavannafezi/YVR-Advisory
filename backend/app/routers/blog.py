from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models.blog import BlogPost
from app.schemas.blog import BlogPostList, BlogPostOut
from app.schemas.llms import BlogLlmsItem, BlogLlmsList
from app.schemas.sitemap import SitemapItem, SitemapList

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


@router.get("/sitemap", response_model=SitemapList)
async def blog_sitemap(
    page: int = Query(1, ge=1),
    limit: int = Query(500, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    q = select(BlogPost.slug, BlogPost.updated_at).where(BlogPost.is_published == True)
    total = await db.scalar(select(func.count()).select_from(q.subquery()))
    result = await db.execute(
        q.order_by(BlogPost.published_at.desc(), BlogPost.id.desc()).offset((page - 1) * limit).limit(limit)
    )
    items = [SitemapItem(slug=slug, last_modified=updated_at) for slug, updated_at in result.all()]
    total_count = total or 0
    return SitemapList(
        items=items,
        total=total_count,
        page=page,
        limit=limit,
        has_next=page * limit < total_count,
    )


@router.get("/llms", response_model=BlogLlmsList)
async def blog_llms(
    page: int = Query(1, ge=1),
    limit: int = Query(250, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    q = (
        select(
            BlogPost.title,
            BlogPost.slug,
            BlogPost.summary,
            BlogPost.music_type,
            BlogPost.tags,
            BlogPost.author,
            BlogPost.published_at,
            BlogPost.updated_at,
        )
        .where(BlogPost.is_published == True)
    )
    total = await db.scalar(select(func.count()).select_from(q.subquery()))
    result = await db.execute(
        q.order_by(BlogPost.published_at.desc(), BlogPost.id.desc()).offset((page - 1) * limit).limit(limit)
    )
    items = [
        BlogLlmsItem(
            title=title,
            slug=slug,
            summary=summary,
            music_type=music_type,
            tags=tags or [],
            author=author,
            published_at=published_at,
            updated_at=updated_at,
        )
        for title, slug, summary, music_type, tags, author, published_at, updated_at in result.all()
    ]
    total_count = total or 0
    return BlogLlmsList(
        items=items,
        total=total_count,
        page=page,
        limit=limit,
        has_next=page * limit < total_count,
    )


@router.get("/{slug}", response_model=BlogPostOut)
async def get_post(slug: str, db: AsyncSession = Depends(get_db)):
    post = await db.scalar(select(BlogPost).where(BlogPost.slug == slug, BlogPost.is_published == True))
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post
