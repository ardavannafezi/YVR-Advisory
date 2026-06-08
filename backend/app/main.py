import asyncio
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import delete, select
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.config import settings
from app.database import AsyncSessionLocal
from app.models.admin_user import AdminUser
from app.models.event import Event
from app.models.notification_settings import NotificationSettings  # noqa: F401
from app.routers import admin, analytics, blog, events, guestlist, music, reservations, seo, tonight, venues, webhooks
from app.utils.notifications import load_db_notif_settings, send_email
from app.utils.security import hash_password
from app.utils.seed_venues import seed as seed_venues

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

VANCOUVER_TZ = ZoneInfo("America/Vancouver")


async def _seed_admin() -> None:
    if not settings.admin_password:
        logger.warning("ADMIN_PASSWORD env var not set — skipping admin seed")
        return
    logger.info("Seeding admin: email=%s", settings.admin_email)
    try:
        hashed = hash_password(settings.admin_password)
        async with AsyncSessionLocal() as session:
            stmt = (
                pg_insert(AdminUser)
                .values(email=settings.admin_email, hashed_password=hashed, is_active=True)
                .on_conflict_do_update(
                    index_elements=["email"],
                    set_={"hashed_password": hashed, "is_active": True},
                )
            )
            await session.execute(stmt)
            await session.commit()
            logger.info("Admin upserted OK: %s", settings.admin_email)
    except Exception:
        logger.exception("CRITICAL — failed to seed admin user")


UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "uploads")


async def _delete_past_events() -> None:
    """Delete all events whose date has passed (Vancouver time) and email a summary."""
    now_utc = datetime.now(timezone.utc)
    async with AsyncSessionLocal() as session:
        past_events = (
            await session.execute(select(Event).where(Event.date < now_utc))
        ).scalars().all()

        if not past_events:
            logger.info("Event cleanup: no past events to delete")
            return

        names = [f"{e.name} ({e.date.astimezone(VANCOUVER_TZ).strftime('%b %d %Y %I:%M %p PT')})" for e in past_events]
        ids = [e.id for e in past_events]

        await session.execute(delete(Event).where(Event.id.in_(ids)))
        await session.commit()

        logger.info("Event cleanup: deleted %d past events", len(ids))

        notif = await load_db_notif_settings(session)
        rows_html = "".join(f"<li>{name}</li>" for name in names)
        html_body = f"""
        <h2>YVR Advisory — Nightly Event Cleanup</h2>
        <p>Ran at {now_utc.astimezone(VANCOUVER_TZ).strftime('%Y-%m-%d %I:%M %p PT')}.</p>
        <p><strong>{len(ids)} past event(s) deleted:</strong></p>
        <ul>{rows_html}</ul>
        """
        await send_email(
            to="team@yvradvisory.ca",
            subject=f"[YVR Advisory] {len(ids)} past event(s) deleted",
            html_body=html_body,
            **notif,
        )


async def _seconds_until_next_3am_pt() -> float:
    """Seconds until next 3:00 AM Vancouver time."""
    now_pt = datetime.now(VANCOUVER_TZ)
    next_run = now_pt.replace(hour=3, minute=0, second=0, microsecond=0)
    if now_pt >= next_run:
        next_run = next_run + timedelta(days=1)
    return (next_run - now_pt).total_seconds()


async def _event_cleanup_scheduler() -> None:
    while True:
        delay = await _seconds_until_next_3am_pt()
        logger.info("Event cleanup scheduler: next run in %.0f seconds (3 AM PT)", delay)
        await asyncio.sleep(delay)
        try:
            await _delete_past_events()
        except Exception:
            logger.exception("Event cleanup failed")


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(f"{UPLOAD_DIR}/venues", exist_ok=True)
    await _seed_admin()
    await seed_venues()
    cleanup_task = asyncio.create_task(_event_cleanup_scheduler())
    yield
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    lifespan=lifespan,
    title="YVR Advisory API",
    description="Vancouver nightlife and events advisory platform",
    version="1.0.0",
    docs_url="/docs" if settings.environment != "production" else None,
    redoc_url="/redoc" if settings.environment != "production" else None,
)

_base_origins = [
    "https://yvradvisory.ca",
    "https://www.yvradvisory.ca",
    "http://localhost:3000",
    settings.frontend_url,
]
if settings.extra_cors_origins:
    _base_origins.extend([o.strip() for o in settings.extra_cors_origins.split(",") if o.strip()])

allowed_origins = list(set(o for o in _base_origins if o))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(venues.router)
app.include_router(events.router)
app.include_router(blog.router)
app.include_router(music.router)
app.include_router(guestlist.router)
app.include_router(reservations.router)
app.include_router(tonight.router)
app.include_router(analytics.router)
app.include_router(admin.router)
app.include_router(webhooks.router)
app.include_router(seo.router)


app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "admin_email_configured": settings.admin_email,
        "admin_password_set": bool(settings.admin_password),
    }
