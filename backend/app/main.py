import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.config import settings
from app.database import AsyncSessionLocal
from app.models.admin_user import AdminUser
from app.routers import admin, analytics, blog, events, guestlist, music, reservations, seo, tonight, venues, webhooks
from app.utils.security import hash_password

logger = logging.getLogger(__name__)


async def _seed_admin() -> None:
    if not settings.admin_password:
        logger.warning("ADMIN_PASSWORD not set — skipping admin seed")
        return
    async with AsyncSessionLocal() as session:
        existing = await session.scalar(
            select(AdminUser).where(AdminUser.email == settings.admin_email)
        )
        if existing:
            existing.hashed_password = hash_password(settings.admin_password)
            existing.is_active = True
            await session.commit()
            logger.info("Admin user updated: %s", settings.admin_email)
        else:
            session.add(
                AdminUser(
                    email=settings.admin_email,
                    hashed_password=hash_password(settings.admin_password),
                )
            )
            await session.commit()
            logger.info("Admin user created: %s", settings.admin_email)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await _seed_admin()
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


@app.get("/health")
async def health():
    return {"status": "ok"}
