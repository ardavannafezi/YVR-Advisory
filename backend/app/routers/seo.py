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

# AI crawlers — machine-readable content index
# https://llmstxt.org
User-agent: GPTBot
Allow: /
Allow: /llms.txt

User-agent: ClaudeBot
Allow: /
Allow: /llms.txt

User-agent: PerplexityBot
Allow: /
Allow: /llms.txt

User-agent: ChatGPT-User
Allow: /
Allow: /llms.txt
"""
    return Response(content=content, media_type="text/plain")


def _url_tag(loc: str, lastmod: str | None = None, changefreq: str = "weekly", priority: str = "0.8") -> str:
    lastmod_tag = f"<lastmod>{lastmod}</lastmod>" if lastmod else ""
    return f"  <url><loc>{loc}</loc>{lastmod_tag}<changefreq>{changefreq}</changefreq><priority>{priority}</priority></url>"


@router.get("/sitemap.xml", response_class=Response)
async def sitemap(db: AsyncSession = Depends(get_db)):
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    static_entries = [
        ("/", "daily", "1.0"),
        ("/venues", "daily", "0.9"),
        ("/events", "daily", "0.9"),
        ("/tonight", "daily", "0.9"),
        ("/blog", "weekly", "0.8"),
        ("/music", "weekly", "0.8"),
        ("/guestlist", "monthly", "0.7"),
        ("/reserve", "monthly", "0.7"),
    ]

    venues = (await db.execute(
        select(Venue.slug, Venue.updated_at).where(Venue.is_active == True)
    )).all()
    events = (await db.execute(
        select(Event.slug, Event.updated_at).where(Event.is_published == True)
    )).all()
    posts = (await db.execute(
        select(BlogPost.slug, BlogPost.updated_at).where(BlogPost.is_published == True)
    )).all()

    url_tags = [_url_tag(f"{SITE}{p}", now, cf, pri) for p, cf, pri in static_entries]
    url_tags += [_url_tag(f"{SITE}/venues/{s}", u.strftime("%Y-%m-%d") if u else None, "weekly", "0.8") for s, u in venues]
    url_tags += [_url_tag(f"{SITE}/events/{s}", u.strftime("%Y-%m-%d") if u else None, "daily", "0.9") for s, u in events]
    url_tags += [_url_tag(f"{SITE}/blog/{s}", u.strftime("%Y-%m-%d") if u else None, "monthly", "0.7") for s, u in posts]

    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(url_tags)}
</urlset>"""
    return Response(content=xml, media_type="application/xml")
