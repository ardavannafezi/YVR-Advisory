from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.analytics import TonightRequest
from app.services.event_service import get_tonight_recommendations

router = APIRouter(prefix="/api/tonight", tags=["tonight"])


@router.post("/recommend")
async def recommend(req: TonightRequest, db: AsyncSession = Depends(get_db)):
    results = await get_tonight_recommendations(req, db)
    return {
        "recommendations": [
            {
                "venue": {
                    "id": r["venue"].id,
                    "name": r["venue"].name,
                    "slug": r["venue"].slug,
                    "description": r["venue"].description,
                    "image_url": r["venue"].image_url,
                    "music_types": r["venue"].music_types,
                    "vibe_tags": r["venue"].vibe_tags,
                    "neighbourhood": r["venue"].neighbourhood,
                },
                "score": r["score"],
                "has_event_tonight": r["has_event_tonight"],
            }
            for r in results
        ]
    }
