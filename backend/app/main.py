from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import admin, analytics, blog, events, guestlist, music, reservations, seo, tonight, venues, webhooks

app = FastAPI(
    title="YVR Advisory API",
    description="Vancouver nightlife and events advisory platform",
    version="1.0.0",
    docs_url="/docs" if settings.environment != "production" else None,
    redoc_url="/redoc" if settings.environment != "production" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
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
