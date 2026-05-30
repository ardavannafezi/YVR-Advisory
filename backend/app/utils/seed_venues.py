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
        "image_url": "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [
            "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800&q=80",
            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
        ],
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
    {
        "name": "Celebrities Nightclub",
        "establishment_type": "Nightclub",
        "description": (
            "One of Vancouver's most legendary nightclubs, Celebrities has been the heartbeat of the city's "
            "electronic music scene since 1984. Set in the heart of Davie Village, it hosts world-renowned DJs "
            "and draws a diverse, energetic crowd across multiple rooms. Known for its state-of-the-art sound "
            "system, theatrical lighting, and an atmosphere that blurs the line between a concert and a club night."
        ),
        "address": "1022 Davie St, Vancouver, BC V6E 1M3",
        "neighbourhood": "Davie Village",
        "phone": "(604) 689-3180",
        "latitude": 49.2784,
        "longitude": -123.1358,
        "music_types": ["house", "techno", "edm"],
        "vibe_tags": ["iconic", "high-energy", "diverse", "dance floor", "live events"],
        "primary_nights": ["friday", "saturday", "sunday"],
        "hours": {
            "monday": None,
            "tuesday": None,
            "wednesday": None,
            "thursday": "9:00 PM – 3:00 AM",
            "friday": "9:00 PM – 3:00 AM",
            "saturday": "9:00 PM – 3:00 AM",
            "sunday": "9:00 PM – 3:00 AM",
        },
        "special_nights": [
            "Fridays — Resident DJs and international guest acts",
            "Saturdays — Themed nights and headliner performances",
            "Sundays — Late-night dance parties",
        ],
        "price_tier": "$$",
        "cover_charge_info": "Varies by event, typically $10–$20 at the door. Guestlist available online.",
        "bottle_minimum": None,
        "dress_code": "Casual and expressive — no dress code, all styles welcome",
        "age_restriction": 19,
        "hospitality_company": None,
        "capacity": 750,
        "image_url": "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [
            "https://images.unsplash.com/photo-1598387180429-c06a8b4a9e28?w=800&q=80",
            "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80",
        ],
        "website_url": "https://www.celebritiesnightclub.com",
        "instagram_url": "https://www.instagram.com/celebsnightclub",
        "reservation_link": None,
        "is_featured": True,
        "is_active": True,
        "faqs": [
            {
                "question": "What kind of music plays at Celebrities?",
                "answer": (
                    "Celebrities specializes in electronic music — house, techno, and EDM — with rotating "
                    "resident DJs and internationally touring artists. Programming varies by night."
                ),
            },
            {
                "question": "Is there a dress code?",
                "answer": (
                    "No strict dress code. Celebrities is known for welcoming all styles and expressions. "
                    "Come as you are."
                ),
            },
            {
                "question": "How much is cover?",
                "answer": (
                    "Cover varies by event and DJ lineup, typically $10–$20 at the door. Check social media "
                    "or the website for event-specific pricing. Guestlist options available online."
                ),
            },
        ],
    },
    {
        "name": "The Red Room",
        "establishment_type": "Nightclub",
        "description": (
            "Tucked beneath the streets of Downtown Vancouver, The Red Room is a subterranean nightclub "
            "with an intimate, underground feel. The space is defined by exposed brick, moody red lighting, "
            "and a layout that wraps the dance floor tightly around the DJ booth. A go-to for hip-hop, R&B, "
            "and soul nights — with a loyal crowd that shows up to actually dance."
        ),
        "address": "398 Richards St, Vancouver, BC V6B 2Z3",
        "neighbourhood": "Gastown",
        "phone": "(604) 687-5007",
        "latitude": 49.2820,
        "longitude": -123.1150,
        "music_types": ["hip-hop", "r&b"],
        "vibe_tags": ["underground", "intimate", "dark", "dance-focused", "moody"],
        "primary_nights": ["thursday", "friday", "saturday"],
        "hours": {
            "monday": None,
            "tuesday": None,
            "wednesday": None,
            "thursday": "9:00 PM – 2:00 AM",
            "friday": "9:00 PM – 3:00 AM",
            "saturday": "9:00 PM – 3:00 AM",
            "sunday": None,
        },
        "special_nights": [
            "Throwback Thursdays — Classic hip-hop and R&B",
            "Fridays — New school hip-hop and trap",
            "Saturdays — R&B and dancehall crossover nights",
        ],
        "price_tier": "$$",
        "cover_charge_info": "$10–$15 at the door depending on the night. Free before 10 PM Thursdays.",
        "bottle_minimum": 300,
        "dress_code": "Urban casual — clean sneakers welcome, no hats or athletic shorts",
        "age_restriction": 19,
        "hospitality_company": None,
        "capacity": 350,
        "image_url": "https://images.unsplash.com/photo-1619983081563-430f63602796?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [
            "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&q=80",
            "https://images.unsplash.com/photo-1485872299829-c673f5194813?w=800&q=80",
        ],
        "website_url": None,
        "instagram_url": "https://www.instagram.com/theredroomvancouver",
        "reservation_link": None,
        "is_featured": True,
        "is_active": True,
        "faqs": [
            {
                "question": "What is the vibe at The Red Room?",
                "answer": (
                    "Underground and intimate. The space is compact and built around the dance floor — "
                    "expect close quarters, heavy bass, and a crowd that's there to move."
                ),
            },
            {
                "question": "What music nights do they run?",
                "answer": (
                    "Thursdays are throwback hip-hop and R&B classics. Fridays lean new school — trap, "
                    "drill, and current hip-hop. Saturdays mix R&B, dancehall, and Afrobeats."
                ),
            },
            {
                "question": "Can I book a table?",
                "answer": (
                    "Yes. Bottle minimums start at $300 CAD and include reserved space near the dance "
                    "floor. Contact the venue directly or use the reservation form above."
                ),
            },
        ],
    },
    {
        "name": "Eleven",
        "establishment_type": "Nightclub",
        "description": (
            "Eleven is Yaletown's sleekest nightclub — a polished space favoured by the after-dinner crowd "
            "looking to extend the night with cocktails and dancing. The interior balances dark wood, leather "
            "banquettes, and warm lighting with a sound system that hits without overpowering conversation "
            "early in the night. As the evening progresses it transforms into a full dance floor experience "
            "with rotating DJs spinning house and Top 40."
        ),
        "address": "1011 Hamilton St, Vancouver, BC V6B 5T4",
        "neighbourhood": "Yaletown",
        "phone": "(604) 669-1111",
        "latitude": 49.2757,
        "longitude": -123.1205,
        "music_types": ["house", "pop"],
        "vibe_tags": ["sleek", "upscale", "cocktail crowd", "after-dinner", "polished"],
        "primary_nights": ["friday", "saturday"],
        "hours": {
            "monday": None,
            "tuesday": None,
            "wednesday": None,
            "thursday": "8:00 PM – 2:00 AM",
            "friday": "8:00 PM – 3:00 AM",
            "saturday": "8:00 PM – 3:00 AM",
            "sunday": None,
        },
        "special_nights": [
            "Fridays — House sets with resident DJ from 10 PM",
            "Saturdays — Curated Top 40 and throwback mixes",
        ],
        "price_tier": "$$$",
        "cover_charge_info": "No cover for guestlist before 11 PM. $20 at the door after.",
        "bottle_minimum": 400,
        "dress_code": "Smart casual — dress to impress, no sportswear",
        "age_restriction": 19,
        "hospitality_company": None,
        "capacity": 300,
        "image_url": "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
        ],
        "website_url": None,
        "instagram_url": None,
        "reservation_link": None,
        "is_featured": False,
        "is_active": True,
        "faqs": [
            {
                "question": "What's the best time to arrive?",
                "answer": (
                    "Arrive between 9 and 10 PM to skip the queue and get guestlist entry. "
                    "The venue fills up quickly after 11 PM on weekends."
                ),
            },
            {
                "question": "Is there parking nearby?",
                "answer": (
                    "Yaletown has several parkades within a short walk. The Impark lot on Homer St "
                    "is a 3-minute walk from the door."
                ),
            },
        ],
    },
    {
        "name": "The Keefer Bar",
        "establishment_type": "Cocktail Bar",
        "description": (
            "One of Vancouver's most celebrated cocktail bars, The Keefer Bar sits at the edge of Chinatown "
            "and draws a discerning crowd with its inventive, herb-forward cocktail menu and low-lit, intimate "
            "atmosphere. The bar is known for blending Eastern botanicals and traditional apothecary inspiration "
            "into each drink. On select nights, live DJs and musicians take the small stage — making it as much "
            "a late-night haunt as a pre-dinner destination."
        ),
        "address": "135 Keefer St, Vancouver, BC V6A 1X3",
        "neighbourhood": "Gastown",
        "phone": "(604) 688-1961",
        "latitude": 49.2799,
        "longitude": -123.1028,
        "music_types": ["r&b", "live"],
        "vibe_tags": ["intimate", "craft cocktails", "dim lighting", "apothecary", "date night"],
        "primary_nights": ["thursday", "friday", "saturday"],
        "hours": {
            "monday": None,
            "tuesday": "5:00 PM – 12:00 AM",
            "wednesday": "5:00 PM – 12:00 AM",
            "thursday": "5:00 PM – 1:00 AM",
            "friday": "5:00 PM – 2:00 AM",
            "saturday": "5:00 PM – 2:00 AM",
            "sunday": "5:00 PM – 12:00 AM",
        },
        "special_nights": [
            "Thursdays — Guest bartender nights and seasonal menu previews",
            "Weekends — Live DJ sets from 9 PM",
        ],
        "price_tier": "$$",
        "cover_charge_info": "No cover charge. Walk-in and reservations welcome.",
        "bottle_minimum": None,
        "dress_code": "Smart casual — come as you are, dress with intention",
        "age_restriction": 19,
        "hospitality_company": None,
        "capacity": 80,
        "image_url": "https://images.unsplash.com/photo-1575444758702-4a6b9222336e?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [
            "https://images.unsplash.com/photo-1560512823-829485b8bf24?w=800&q=80",
            "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80",
        ],
        "website_url": "https://www.thekeeferbar.com",
        "instagram_url": "https://www.instagram.com/thekeeferbar",
        "reservation_link": None,
        "is_featured": True,
        "is_active": True,
        "faqs": [
            {
                "question": "What makes The Keefer Bar unique?",
                "answer": (
                    "The cocktail menu is inspired by traditional Chinese apothecary — ingredients like "
                    "chrysanthemum, lychee, and goji berry feature alongside classic spirits. Every drink "
                    "is crafted to balance flavour with botanical intention."
                ),
            },
            {
                "question": "Do I need a reservation?",
                "answer": (
                    "Reservations are recommended Thursday through Saturday, especially for groups of 4 or more. "
                    "Walk-ins are always welcome at the bar."
                ),
            },
            {
                "question": "Is there live music?",
                "answer": (
                    "Yes — select Thursday evenings feature guest bartenders and live sets. Weekends often have "
                    "a resident DJ from 9 PM onwards. Check Instagram for the current lineup."
                ),
            },
        ],
    },
    {
        "name": "Juniper Restaurant & Bar",
        "establishment_type": "Bar & Restaurant",
        "description": (
            "Perched on the edge of Coal Harbour with sweeping views of the North Shore mountains and Burrard Inlet, "
            "Juniper is the city's most scenic dining and cocktail destination. The menu centres on Pacific Northwest "
            "cuisine — fresh, seasonal, and locally sourced — while the bar program elevates classic cocktails with "
            "foraged BC ingredients. Whether you're booking for dinner or arriving for late-night drinks, the space "
            "transitions effortlessly from restaurant to bar as the evening unfolds."
        ),
        "address": "185 Victory Ship Way, Vancouver, BC V6B 0B6",
        "neighbourhood": "Coal Harbour",
        "phone": "(604) 566-3977",
        "latitude": 49.2882,
        "longitude": -123.1215,
        "music_types": ["pop", "live"],
        "vibe_tags": ["waterfront views", "upscale dining", "seasonal menu", "date night", "scenic"],
        "primary_nights": ["friday", "saturday", "sunday"],
        "hours": {
            "monday": "11:30 AM – 10:00 PM",
            "tuesday": "11:30 AM – 10:00 PM",
            "wednesday": "11:30 AM – 10:00 PM",
            "thursday": "11:30 AM – 11:00 PM",
            "friday": "11:30 AM – 12:00 AM",
            "saturday": "10:00 AM – 12:00 AM",
            "sunday": "10:00 AM – 10:00 PM",
        },
        "special_nights": [
            "Friday & Saturday — Late-night bar menu and cocktails until midnight",
            "Sunday Brunch — 10 AM to 3 PM with weekend cocktail specials",
        ],
        "price_tier": "$$$",
        "cover_charge_info": "No cover. Reservations strongly recommended for dinner.",
        "bottle_minimum": None,
        "dress_code": "Smart casual — polished but relaxed",
        "age_restriction": 19,
        "hospitality_company": None,
        "capacity": 180,
        "image_url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [
            "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80",
            "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
            "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80",
        ],
        "website_url": "https://www.junipervancouver.com",
        "instagram_url": "https://www.instagram.com/junipervancouver",
        "reservation_link": "https://www.opentable.com/juniper-restaurant-and-bar",
        "is_featured": True,
        "is_active": True,
        "faqs": [
            {
                "question": "Do I need a reservation for dinner?",
                "answer": (
                    "Yes — dinner reservations are strongly recommended, especially on weekends. "
                    "Bar seating is available on a walk-in basis."
                ),
            },
            {
                "question": "Can I come just for drinks?",
                "answer": (
                    "Absolutely. The bar is open to walk-ins and the full cocktail menu is available "
                    "all evening. The bar area has spectacular harbour views."
                ),
            },
            {
                "question": "What kind of food do you serve?",
                "answer": (
                    "Pacific Northwest cuisine — seasonal ingredients sourced from BC farms and waters. "
                    "The menu changes regularly to reflect what's at its peak."
                ),
            },
        ],
    },
    {
        "name": "Reflections: The Garden Terrace",
        "establishment_type": "Rooftop Lounge",
        "description": (
            "Perched atop the historic Hotel Georgia in the heart of downtown Vancouver, Reflections is the city's "
            "premier rooftop lounge — an open-air terrace wrapped in lush greenery, warm lighting, and unobstructed "
            "views of the Vancouver skyline. The menu spans elevated small plates, seasonal cocktails, and an "
            "extensive wine list. As one of the only true rooftop lounges in the downtown core, it draws a "
            "sophisticated crowd for after-work drinks, private events, and summer evening gatherings that stretch "
            "well past midnight."
        ),
        "address": "801 W Georgia St, Vancouver, BC V6C 1P7",
        "neighbourhood": "Granville Strip",
        "phone": "(604) 682-5566",
        "latitude": 49.2830,
        "longitude": -123.1208,
        "music_types": ["house", "pop"],
        "vibe_tags": ["rooftop", "open-air", "skyline views", "upscale", "summer terrace", "intimate"],
        "primary_nights": ["thursday", "friday", "saturday", "sunday"],
        "hours": {
            "monday": None,
            "tuesday": None,
            "wednesday": "4:00 PM – 11:00 PM",
            "thursday": "4:00 PM – 12:00 AM",
            "friday": "3:00 PM – 1:00 AM",
            "saturday": "12:00 PM – 1:00 AM",
            "sunday": "12:00 PM – 10:00 PM",
        },
        "special_nights": [
            "Thursdays — Sunset cocktail hour from 4–6 PM with half-price selected drinks",
            "Friday & Saturday — DJ sets from 9 PM with late-night small plates",
            "Sunday Sessions — Afternoon drinks and light bites from noon",
        ],
        "price_tier": "$$$",
        "cover_charge_info": "No cover. Reservations recommended Thursday–Sunday evenings.",
        "bottle_minimum": None,
        "dress_code": "Smart casual — no athletic wear or flip-flops",
        "age_restriction": 19,
        "hospitality_company": "Hotel Georgia",
        "capacity": 150,
        "image_url": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [
            "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80",
            "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
        ],
        "website_url": "https://www.hotelgeorgia.ca/reflections",
        "instagram_url": "https://www.instagram.com/hotelgeorgia",
        "reservation_link": None,
        "is_featured": True,
        "is_active": True,
        "faqs": [
            {
                "question": "Is Reflections open year-round?",
                "answer": (
                    "The terrace operates seasonally — primarily spring through fall (May to October). "
                    "Hours and availability vary; check the website or Instagram before visiting in "
                    "shoulder seasons."
                ),
            },
            {
                "question": "Can I book for a private event?",
                "answer": (
                    "Yes — Reflections is available for private buyouts and corporate events. "
                    "Contact the Hotel Georgia events team directly for pricing and availability."
                ),
            },
            {
                "question": "Is food available?",
                "answer": (
                    "Yes — an elevated small plates menu is available all evening, including charcuterie, "
                    "fresh oysters, and seasonal shared plates designed for grazing alongside cocktails."
                ),
            },
            {
                "question": "What is the best time to visit for the view?",
                "answer": (
                    "Arrive at sunset — roughly 8–9 PM in summer — for the best light over the downtown "
                    "skyline. The terrace is warmest mid-evening and fills up quickly after 9 PM on weekends."
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
