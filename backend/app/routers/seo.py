from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.dependencies import get_db
from app.models.blog import BlogPost
from app.models.event import Event
from app.models.venue import Venue

router = APIRouter(tags=["seo"])

SITE = settings.frontend_url


@router.get("/robots.txt", response_class=Response)
async def robots():
    content = f"""User-agent: *
Allow: /
Disallow: /admin/

Sitemap: {SITE}/sitemap.xml
"""
    return Response(content=content, media_type="text/plain")


@router.get("/sitemap.xml", response_class=Response)
async def sitemap(db: AsyncSession = Depends(get_db)):
    static_urls = ["/", "/venues", "/events", "/blog", "/music", "/tonight", "/reserve", "/guestlist"]

    venues = await db.execute(select(Venue.slug).where(Venue.is_active == True))
    events = await db.execute(select(Event.slug).where(Event.is_published == True))
    posts = await db.execute(select(BlogPost.slug).where(BlogPost.is_published == True))

    urls = (
        [f"{SITE}{p}" for p in static_urls]
        + [f"{SITE}/venues/{s}" for (s,) in venues]
        + [f"{SITE}/events/{s}" for (s,) in events]
        + [f"{SITE}/blog/{s}" for (s,) in posts]
    )

    url_tags = "\n".join(
        f"  <url><loc>{u}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>"
        for u in urls
    )
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{url_tags}
</urlset>"""
    return Response(content=xml, media_type="application/xml")
