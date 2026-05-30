"""
Seed initial venues into the database.

Usage (from Railway shell or locally with DATABASE_URL set):
    python -m app.utils.seed_venues
"""
import asyncio

from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.venue import Venue
from app.utils.slugify import slugify

VENUES = [
    {
        "name": "Mansion Nightclub",
        "establishment_type": "Nightclub",
        "description": (
            "Mansion is Vancouver's premier multi-room nightclub, set inside a stunning heritage building "
            "on the Granville Strip. Known for its grand interior, world-class production, and curated nights "
            "spanning hip-hop, house, and Top 40, Mansion consistently draws the city's most stylish crowd. "
            "With multiple VIP areas, elevated bottle service, and an unmatched sound system, it sets the "
            "standard for upscale nightlife in Vancouver."
        ),
        "address": "1280 Granville St, Vancouver, BC V6Z 1M4",
        "neighbourhood": "Granville Strip",
        "phone": "(604) 684-7699",
        "latitude": 49.2757,
        "longitude": -123.1342,
        "music_types": ["hip-hop", "house", "pop"],
        "vibe_tags": ["luxury", "upscale", "high-energy", "bottle service", "multi-room"],
        "primary_nights": ["friday", "saturday"],
        "hours": {
            "monday": None,
            "tuesday": None,
            "wednesday": None,
            "thursday": None,
            "friday": "9:00 PM – 3:00 AM",
            "saturday": "9:00 PM – 3:00 AM",
            "sunday": None,
        },
        "special_nights": [
            "Mansion Fridays — Hip-Hop & House with VIP bottle service from $500",
            "Saturday Night — Multi-genre showcase with international DJs",
        ],
        "price_tier": "$$$",
        "cover_charge_info": "Guestlist: Free before midnight (Fri), $20 door. Saturday $25 door.",
        "bottle_minimum": 500,
        "dress_code": "Smart and Elegant — no athletic wear, hoodies, caps, or work boots",
        "age_restriction": 21,
        "hospitality_company": "Mansion Hospitality Group",
        "capacity": 1000,
        "image_url": None,
        "gallery_urls": [],
        "website_url": "https://www.mansionvancouver.com",
        "instagram_url": "https://www.instagram.com/mansionvancouver",
        "reservation_link": None,
        "is_featured": True,
        "is_active": True,
        "faqs": [
            {
                "question": "How do I get on the guestlist?",
                "answer": (
                    "Submit your name and party size through our guestlist form. Guestlist entry is free before "
                    "midnight on Fridays, subject to capacity and dress code compliance. Saturday guestlist "
                    "provides priority access — door charge may apply after midnight."
                ),
            },
            {
                "question": "What is the dress code?",
                "answer": (
                    "Smart and elegant. We do not permit athletic wear, hoodies, baseball caps, ripped jeans, "
                    "or work boots. Management reserves the right to refuse entry at their discretion."
                ),
            },
            {
                "question": "What music will I hear?",
                "answer": (
                    "Mansion spans multiple rooms with different sounds — expect hip-hop and Top 40 in the main "
                    "room and house in the second room. Programming varies by night and DJ lineup."
                ),
            },
            {
                "question": "How do I book a VIP table?",
                "answer": (
                    "Use the Reserve a Table button above or contact us directly. Friday bottle minimums start "
                    "at $500 CAD, Saturdays from $750. Reservations are recommended at least 48 hours in advance."
                ),
            },
            {
                "question": "What are the best nights to go?",
                "answer": (
                    "Friday and Saturday are the main event nights. Doors open at 9 PM — arriving before "
                    "11 PM gives you the best experience and avoids long queues."
                ),
            },
            {
                "question": "What is the minimum age?",
                "answer": (
                    "21+ with valid government-issued photo ID. BC driver's licence, passport, or NEXUS card "
                    "accepted. No exceptions — IDs are scanned at the door."
                ),
            },
        ],
    },
]


async def seed():
    async with AsyncSessionLocal() as db:
        for data in VENUES:
            slug = slugify(data["name"])
            existing = await db.scalar(select(Venue).where(Venue.slug == slug))
            if existing:
                print(f"[skip] {data['name']} already exists")
                continue
            venue = Venue(**data, slug=slug)
            db.add(venue)
            print(f"[add]  {data['name']}")
        await db.commit()
    print("Done.")


if __name__ == "__main__":
    asyncio.run(seed())
