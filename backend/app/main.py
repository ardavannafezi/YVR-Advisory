import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.config import settings
from app.database import AsyncSessionLocal
from app.models.admin_user import AdminUser
from app.models.notification_settings import NotificationSettings  # noqa: F401
from app.routers import admin, analytics, blog, events, guestlist, music, reservations, seo, tonight, venues, webhooks
from app.utils.security import hash_password
from app.utils.seed_venues import seed as seed_venues

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


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


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(f"{UPLOAD_DIR}/venues", exist_ok=True)
    await _seed_admin()
    await seed_venues()
    yield


app = FastAPI(
    lifespan=lifespan,
    title="YVR Advisory API",
    description="Vancouver nightlife and events advisory platform",
    version="1.0.0",
    docs_url="/docs" if settings.environment != "production" else None,
    redoc_url="/redoc" if settings.environment != "production" else None,
)

allowed_origins = [
    "https://yvradvisory.ca",
    "https://www.yvradvisory.ca",
    "http://localhost:3000",
    settings.frontend_url,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(allowed_origins)),
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
