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


@router.get("/llms.txt", response_class=Response)
async def llms_txt(db: AsyncSession = Depends(get_db)):
    """Machine-readable content index for AI crawlers (llmstxt.org spec)."""
    venues = (await db.execute(
        select(Venue.name, Venue.slug, Venue.description, Venue.neighbourhood, Venue.establishment_type, Venue.music_types)
        .where(Venue.is_active == True)
        .order_by(Venue.name)
    )).all()

    events = (await db.execute(
        select(Event.name, Event.slug, Event.description, Event.date, Event.music_type)
        .where(Event.is_published == True)
        .order_by(Event.date.desc())
        .limit(200)
    )).all()

    posts = (await db.execute(
        select(BlogPost.title, BlogPost.slug, BlogPost.music_type, BlogPost.published_at)
        .where(BlogPost.is_published == True)
        .order_by(BlogPost.published_at.desc())
    )).all()

    lines = [
        "# YVR Advisory — Vancouver Nightlife Content Index",
        "",
        "> YVR Advisory is Vancouver's curated nightlife guide: nightclubs, cocktail bars, events,",
        "> guestlist signups, table reservations, and personalised recommendations.",
        f"> Site: {SITE}",
        "",
        "## Venues",
        "",
    ]

    for v in venues:
        meta = []
        if v.neighbourhood:
            meta.append(v.neighbourhood)
        if v.establishment_type:
            meta.append(v.establishment_type)
        if v.music_types:
            meta.append(", ".join(v.music_types))
        desc = v.description.split(".")[0] if v.description else ""
        line = f"- [{v.name}]({SITE}/venues/{v.slug})"
        if meta:
            line += f" — {' · '.join(meta)}"
        if desc:
            line += f". {desc}."
        lines.append(line)

    lines += ["", "## Upcoming Events", ""]
    for e in events:
        date_str = e.date.strftime("%Y-%m-%d") if e.date else ""
        line = f"- [{e.name}]({SITE}/events/{e.slug}) — {date_str}"
        if e.music_type:
            line += f" · {e.music_type}"
        if e.description:
            line += f". {e.description.split(chr(10))[0][:120]}"
        lines.append(line)

    lines += ["", "## Blog", ""]
    for p in posts:
        date_str = p.published_at.strftime("%Y-%m-%d") if p.published_at else ""
        line = f"- [{p.title}]({SITE}/blog/{p.slug})"
        if date_str:
            line += f" — {date_str}"
        if p.music_type:
            line += f" · {p.music_type}"
        lines.append(line)

    return Response(content="\n".join(lines), media_type="text/plain; charset=utf-8")
