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
            {
                "question": "How does the guestlist work?",
                "answer": (
                    "Guestlist is available for local nights only — not for ticketed events, concerts, or New Year's Eve. "
                    "Being on the guestlist provides free or discounted entry. Submit your name through the guestlist form; "
                    "confirmation is sent by email within 24–48 hours."
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
        "name": "Twelve West",
        "establishment_type": "Nightclub",
        "description": (
            "Twelve West is the flagship venue of the After Dark Hospitality Group — a 7,500-square-foot "
            "award-winning nightclub on the Granville Strip that has been recognized by the Top Bar Design Awards. "
            "The space is built for impact: three distinct VIP sections, a commanding dance floor, and production "
            "that rivals any major-market club. The music leans into hip-hop and R&B, with a rotation of "
            "Vancouver's best resident DJs and high-profile guest bookings. It draws a well-dressed, "
            "high-energy crowd looking for an elevated night out without leaving the city."
        ),
        "address": "1219 Granville St, Vancouver, BC V6Z 1M6",
        "neighbourhood": "Granville Strip",
        "phone": "(604) 653-6335",
        "latitude": 49.2752,
        "longitude": -123.1337,
        "music_types": ["hip-hop", "r&b"],
        "vibe_tags": ["upscale", "high-energy", "bottle service", "VIP", "award-winning design", "dance floor"],
        "primary_nights": ["friday", "saturday"],
        "hours": {
            "monday": None,
            "tuesday": None,
            "wednesday": None,
            "thursday": None,
            "friday": "9:30 PM – 3:00 AM",
            "saturday": "9:30 PM – 3:00 AM",
            "sunday": None,
        },
        "special_nights": [
            "Fridays — Hip-Hop & R&B with resident DJs and VIP bottle service",
            "Saturdays — High-energy club anthems and throwbacks with guest DJ bookings",
        ],
        "price_tier": "$$$",
        "cover_charge_info": "~$20 at the door; varies by event and DJ lineup. Guestlist available online.",
        "bottle_minimum": 500,
        "dress_code": "Upscale — collared shirts, jeans, and dress shoes for men. No jerseys, track jackets, hats, or sneakers.",
        "age_restriction": 19,
        "hospitality_company": "After Dark Hospitality Group",
        "capacity": 450,
        "image_url": "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [
            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
            "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&q=80",
        ],
        "website_url": "https://twelvewest.ca",
        "instagram_url": "https://www.instagram.com/twelve_west",
        "reservation_link": "https://twelvewest.ca/pages/table-reservation",
        "is_featured": True,
        "is_active": True,
        "faqs": [
            {
                "question": "What is the dress code at Twelve West?",
                "answer": (
                    "Upscale dress code is strictly enforced. Men must wear collared shirts, dress jeans or "
                    "trousers, and dress shoes. Jerseys, track jackets, baseball caps, hoodies, and sneakers "
                    "are not permitted. Management reserves the right to refuse entry."
                ),
            },
            {
                "question": "How do I get on the guestlist?",
                "answer": (
                    "Submit your name and party size via our guestlist form above. Guestlist entry is "
                    "complimentary before a set time, subject to capacity and dress code. "
                    "Door charge applies after guestlist cutoff."
                ),
            },
            {
                "question": "How do I book a VIP table?",
                "answer": (
                    "Use the Reserve a Table link above or visit twelvewest.ca/pages/table-reservation. "
                    "Twelve West has three VIP sections with bottle minimums starting at $500 CAD. "
                    "Reservations are recommended at least 48 hours in advance."
                ),
            },
            {
                "question": "What music plays at Twelve West?",
                "answer": (
                    "Twelve West focuses on hip-hop and R&B — a blend of current club anthems, throwbacks, "
                    "and high-energy sets curated by resident and guest DJs. Fridays and Saturdays both "
                    "feature full DJ production from open to close."
                ),
            },
            {
                "question": "What is the minimum age to enter?",
                "answer": (
                    "19+ with valid government-issued photo ID. BC driver's licence, passport, or NEXUS "
                    "card accepted. IDs are verified at the door."
                ),
            },
        ],
    },
    {
        "name": "Aura Nightclub",
        "establishment_type": "Nightclub",
        "description": (
            "Founded in July 2014 and located in the heart of the Granville Entertainment District, Aura Nightclub "
            "pairs classic decor with a postmodern, futuristic twist — high ceilings, state-of-the-art sound, and "
            "sophisticated lighting design across multiple environments ranging from high-energy dance floors to "
            "intimate lounge areas. The weekly programming is split between Global Fridays — an international party "
            "blending Top 40, Latin hits, and mainstream EDM — and Latin Saturdays, billed as Vancouver's busiest "
            "Saturday clubbing event. K-pop nights and themed parties round out a calendar that draws a diverse, "
            "international crowd to one of the Strip's most visually distinctive spaces."
        ),
        "address": "1180 Granville St, Vancouver, BC V6Z 1L8",
        "neighbourhood": "Granville Strip",
        "phone": "(604) 688-8889",
        "latitude": 49.2791,
        "longitude": -123.1243,
        "music_types": ["top-40", "latin", "edm", "k-pop"],
        "vibe_tags": ["upscale", "futuristic decor", "international crowd", "Latin", "EDM", "VIP tables", "high-energy"],
        "primary_nights": ["friday", "saturday"],
        "hours": {
            "monday": None,
            "tuesday": None,
            "wednesday": None,
            "thursday": None,
            "friday": "10:00 PM – 3:00 AM",
            "saturday": "10:00 PM – 3:00 AM",
            "sunday": None,
        },
        "special_nights": [
            "Global Fridays — Weekly international party blending Top 40, Latin hits, and mainstream EDM",
            "Latin Saturdays — Weekly reggaeton and Latin night, billed as Vancouver's busiest Saturday clubbing event. Two pieces of valid ID required for entry.",
            "K-pop nights and themed parties run periodically throughout the year",
        ],
        "special_occasion": (
            "Birthday and stagette packages bookable at auravancouver.ca/packages. "
            "Corporate event bookings also available directly through the venue."
        ),
        "price_tier": "$$$",
        "cover_charge_info": "Typically ~$20 at the door. Varies by event and advance vs. door purchase.",
        "bottle_minimum": None,
        "dress_code": "Smart and elegant — dress shirts, blazers, stylish tops, smart trousers, or elegant dresses. No sportswear, shorts, or flip-flops.",
        "age_restriction": 19,
        "hospitality_company": None,
        "capacity": None,
        "image_url": "https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [
            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
        ],
        "website_url": "https://auravancouver.ca",
        "instagram_url": "https://www.instagram.com/auravancouver",
        "reservation_link": "https://auravancouver.ca/vip-tables",
        "is_featured": True,
        "is_active": True,
        "faqs": [
            {
                "question": "What are the weekly nights at Aura?",
                "answer": (
                    "Aura runs two flagship weekly nights: Global Fridays — a high-energy international party "
                    "blending Top 40, Latin hits, and EDM — and Latin Saturdays, featuring reggaeton and Latin "
                    "music and billed as Vancouver's busiest Saturday night. K-pop and themed nights are "
                    "scheduled periodically throughout the year."
                ),
            },
            {
                "question": "What is the dress code?",
                "answer": (
                    "Smart and elegant. Dress shirts, blazers, stylish tops, and smart trousers or elegant "
                    "dresses are expected. No sportswear, shorts, or flip-flops. Management reserves the "
                    "right to refuse entry."
                ),
            },
            {
                "question": "Does Latin Saturdays have different entry rules?",
                "answer": (
                    "Yes — Latin Saturdays requires two pieces of valid government-issued identification "
                    "for entry, in addition to the standard 19+ age requirement."
                ),
            },
            {
                "question": "Can I book a VIP table or birthday package?",
                "answer": (
                    "Yes — VIP table reservations are available at auravancouver.ca/vip-tables. Birthday "
                    "and stagette packages with dedicated perks are bookable at auravancouver.ca/packages. "
                    "Corporate bookings can be arranged directly through the venue."
                ),
            },
            {
                "question": "How much is cover at Aura?",
                "answer": (
                    "Cover is typically around $20 at the door. Pricing varies by event and DJ lineup, "
                    "and advance tickets are often available at a lower rate. Check auravancouver.ca "
                    "or their Instagram for event-specific details."
                ),
            },
        ],
    },
    {
        "name": "The Roxy",
        "establishment_type": "Live Music Venue",
        "description": (
            "With live music 365 days a year, The Roxy is Vancouver's premier live music institution — "
            "a Granville Strip staple where bands of every genre take the stage seven nights a week. "
            "Four bars and thirteen high-energy staff keep the drinks moving, with a different special every "
            "night and the venue's famous double Long Island Iced Tea always on call. Between sets, some of "
            "the city's top DJs hold the floor. From Millennial Monday throwbacks to Girls Gone Roxy on "
            "Thursdays and ticketed live shows on weekends, The Roxy runs one of the most consistent "
            "weekly programmes on the strip — and has for decades."
        ),
        "address": "932 Granville St, Vancouver, BC V6Z 1L2",
        "neighbourhood": "Granville Strip",
        "phone": "(604) 331-7999",
        "latitude": 49.2800,
        "longitude": -123.1238,
        "music_types": ["live", "hip-hop", "r&b", "country", "rock"],
        "vibe_tags": ["live music institution", "Vancouver legend", "high-energy", "casual", "cover bands", "drink specials", "dance floor"],
        "primary_nights": ["friday", "saturday"],
        "hours": {
            "monday": "8:00 PM – 3:00 AM",
            "tuesday": "8:00 PM – 3:00 AM",
            "wednesday": "8:00 PM – 3:00 AM",
            "thursday": "8:00 PM – 3:00 AM",
            "friday": "8:00 PM – 3:00 AM",
            "saturday": "8:00 PM – 3:00 AM",
            "sunday": "8:00 PM – 3:00 AM",
        },
        "special_nights": [
            "Millennial Mondays — House band performs greatest hits from 1995–2008: hip-hop, dancehall, Afrobeat, and pop classics",
            "Girls Gone Roxy (Thursdays) — Female-focused weekly night with live performances, pop tributes, and throwback hits",
            "Weekend Live Shows — Ticketed performances presented with Live Acts Canada and We Outside promotions",
        ],
        "special_occasion": (
            "Birthday packages: free entry for up to 5 guests, VIP line, and table reservation. "
            "Bachelorette packages: complimentary cover for bride-to-be and maid of honour, VIP line, table, and goodie bag. "
            "High school reunions also catered for. Book via info@roxyvan.com."
        ),
        "price_tier": "$",
        "cover_charge_info": (
            "Cover every night, $5–$13 depending on the night. Saturday is the most expensive. "
            "Ticketed live events: advance $6–$15; door price typically $2–$10 higher."
        ),
        "bottle_minimum": None,
        "dress_code": "No bags, backpacks, tracksuits, or ripped jeans. One of the most relaxed dress codes on the strip.",
        "age_restriction": 19,
        "hospitality_company": None,
        "capacity": 275,
        "image_url": "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [
            "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80",
            "https://images.unsplash.com/photo-1598387180429-c06a8b4a9e28?w=800&q=80",
        ],
        "website_url": "http://www.roxyvan.com",
        "instagram_url": "https://www.instagram.com/roxyvanlive",
        "reservation_link": "http://www.roxyvan.com/guestlist",
        "is_featured": True,
        "is_active": True,
        "faqs": [
            {
                "question": "Does The Roxy have live music every night?",
                "answer": (
                    "Yes — live bands perform 365 days a year, seven nights a week. Between sets, "
                    "resident DJs keep the dance floor moving. Programming ranges from cover bands "
                    "and tribute acts to ticketed original artists on weekends."
                ),
            },
            {
                "question": "What is Millennial Monday?",
                "answer": (
                    "Millennial Mondays is The Roxy's weekly Monday night hosted by the house band, "
                    "performing greatest hits from 1995 to 2008 — spanning hip-hop, dancehall, "
                    "Afrobeat, Brit pop, and R&B classics."
                ),
            },
            {
                "question": "How much is cover at The Roxy?",
                "answer": (
                    "Cover ranges from $5 to $13 depending on the night — Saturday is the highest. "
                    "For ticketed live events, advance tickets are $6–$15 with door prices typically "
                    "$2–$10 higher. Check roxyvan.com/events for event-specific pricing."
                ),
            },
            {
                "question": "Is there a dress code?",
                "answer": (
                    "One of the most relaxed dress codes on the Granville Strip. No bags, backpacks, "
                    "tracksuits, or ripped jeans. Most other attire is welcome."
                ),
            },
            {
                "question": "Can I book a birthday or bachelorette package?",
                "answer": (
                    "Yes — birthday packages include free entry for up to 5 guests, VIP line access, and "
                    "a table reservation. Bachelorette packages include complimentary cover for the bride "
                    "and maid of honour, VIP entry, a reserved table, and a goodie bag. "
                    "Book in advance at info@roxyvan.com."
                ),
            },
        ],
    },
    {
        "name": "Cabana Lounge",
        "establishment_type": "Nightclub / Lounge",
        "description": (
            "Inspired by the vibrant style of South Beach, Cabana boasts rich colours, chic cabana-draped VIP booths, "
            "and stunning design elements including the venue's trademark — a gorgeous acacia tree growing throughout "
            "the intimate space. Longtime Vancouver nightlife figure Dave Kershaw oversees a venue that blends VIP "
            "table culture with high-energy dance programming across multiple rooms, drawing crowds for Top 40, "
            "hip-hop, Latin, and special themed nights. Wednesday's Festa Cabana splits the floor between "
            "reggaeton in the main room and Brazilian hits in the back Eden Lounge."
        ),
        "address": "1159 Granville St, Vancouver, BC V6Z 1L8",
        "neighbourhood": "Granville Strip",
        "phone": "(778) 251-3335",
        "latitude": 49.2784,
        "longitude": -123.1244,
        "music_types": ["top-40", "hip-hop", "r&b", "latin"],
        "vibe_tags": ["South Beach-inspired", "VIP booths", "high-energy", "tropical decor", "bottle service", "multi-room"],
        "primary_nights": ["wednesday", "friday", "saturday"],
        "hours": {
            "monday": None,
            "tuesday": None,
            "wednesday": "10:00 PM – 2:00 AM",
            "thursday": "10:00 PM – 2:00 AM",
            "friday": "10:00 PM – 3:00 AM",
            "saturday": "10:00 PM – 3:00 AM",
            "sunday": None,
        },
        "special_nights": [
            "Festa Cabana Wednesdays — Reggaeton and Latin hits in the main room; Brazilian hits in Eden Lounge (back room). Occasional 10–11 PM dance classes.",
            "Cabana Saturdays — Hip-hop, R&B, and dance hits with resident DJs",
            "Themed one-offs — Pop culture tributes and holiday parties throughout the year",
        ],
        "special_occasion": (
            "Birthday parties, bachelorette parties, and corporate events — private event bookings available. "
            "Contact the venue directly via cabanavancouver.com for group packages."
        ),
        "price_tier": "$$",
        "cover_charge_info": (
            "Regular cover $12. Party Pass $10 (cover + priority entry + 2 drinks). "
            "VIP Pass $20 (instant access, cover, 3 premium drinks including Grey Goose, Cîroc, Patrón, Hennessy, Corona)."
        ),
        "bottle_minimum": 315,
        "dress_code": "Smart, upscale attire required. No casualwear, athletic wear, or sneakers.",
        "age_restriction": 19,
        "hospitality_company": None,
        "capacity": 250,
        "image_url": "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [
            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
        ],
        "website_url": "https://cabanavancouver.com",
        "instagram_url": "https://www.instagram.com/cabanavancouver",
        "reservation_link": "https://cabanavancouver.com",
        "is_featured": True,
        "is_active": True,
        "faqs": [
            {
                "question": "What is the dress code at Cabana?",
                "answer": (
                    "Smart, upscale attire is required. No casualwear, athletic wear, or sneakers. "
                    "Management reserves the right to refuse entry at their discretion."
                ),
            },
            {
                "question": "What are the best nights to visit?",
                "answer": (
                    "Fridays and Saturdays are the most popular nights for Top 40, hip-hop, and R&B. "
                    "Wednesdays run Festa Cabana — a Latin night split between reggaeton in the main room "
                    "and Brazilian hits in the back Eden Lounge, with occasional dance classes at 10 PM."
                ),
            },
            {
                "question": "How much is cover charge?",
                "answer": (
                    "Regular cover is $12. The Party Pass ($10) includes cover, priority entry, and 2 drinks. "
                    "The VIP Pass ($20) includes instant access, cover, and 3 premium drinks (Grey Goose, "
                    "Cîroc, Patrón, Hennessy, or Corona)."
                ),
            },
            {
                "question": "Can I book a VIP table?",
                "answer": (
                    "Yes — Cabana has chic cabana-style VIP booths with full bottle service. "
                    "Pricing varies by spirit and party size. Contact the venue through cabanavancouver.com "
                    "to confirm minimums and availability for your date."
                ),
            },
            {
                "question": "Does Cabana host private events?",
                "answer": (
                    "Yes — birthday parties, bachelorette events, and corporate bookings are available. "
                    "Reach out through the website to discuss packages and venue availability."
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
    {
        "name": "Bimini's Since 1975",
        "establishment_type": "Pub / Bar / Dance Venue",
        "description": (
            "Renamed Bimini's Since 1975 to honour its legacy, this longtime Kitsilano bar reopened in December 2024 "
            "under new owner Harsh Sharma. The renovation kept the lofty ceilings and mezzanines and added a games room, "
            "jukebox, and patio. After 10 PM on Fridays and Saturdays the space transforms into a dance destination "
            "with DJs and no cover charge. Weekly programming includes karaoke, sapphic socials, drag brunch, and "
            "Whitecaps FC match screenings on Vancouver's largest screen."
        ),
        "address": "2010 W 4th Avenue, Vancouver, BC V6J 1M9",
        "neighbourhood": "Kitsilano",
        "phone": "(604) 739-0222",
        "latitude": 49.2675,
        "longitude": -123.1545,
        "music_types": ["live", "pop", "r&b"],
        "vibe_tags": ["neighbourhood pub", "historic", "multi-floor", "queer-friendly", "live music", "no cover", "sports bar"],
        "primary_nights": ["friday", "saturday"],
        "hours": {
            "monday": "11:00 AM – 12:00 AM",
            "tuesday": "11:00 AM – 12:00 AM",
            "wednesday": "11:00 AM – 1:00 AM",
            "thursday": "11:00 AM – 1:00 AM",
            "friday": "11:00 AM – 2:00 AM",
            "saturday": "11:00 AM – 2:00 AM",
            "sunday": "11:00 AM – 11:30 PM",
        },
        "special_nights": [
            "Wednesday Karaoke",
            "Thursday Sapphic Socials",
            "Friday & Saturday DJ Nights — no cover after 10 PM",
            "Monthly Drag Brunch",
            "Whitecaps FC match screenings on Vancouver's largest screen",
        ],
        "price_tier": "$",
        "cover_charge_info": "No cover charge on DJ nights.",
        "bottle_minimum": None,
        "dress_code": "Casual",
        "age_restriction": 19,
        "hospitality_company": None,
        "capacity": None,
        "image_url": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [],
        "website_url": "https://biminis1975.ca",
        "instagram_url": "https://www.instagram.com/biminis1975",
        "reservation_link": None,
        "is_featured": False,
        "is_active": True,
        "faqs": [
            {
                "question": "What kind of venue is Bimini's?",
                "answer": (
                    "A multi-floor Kitsilano pub by day that transforms into a DJ dance destination after 10 PM on "
                    "Fridays and Saturdays — all with no cover charge. It also runs weekly karaoke, sapphic socials, "
                    "drag brunch, and sports screenings."
                ),
            },
            {
                "question": "Is there a cover charge?",
                "answer": "No cover on DJ nights.",
            },
        ],
    },
    {
        "name": "Heist Nightclub",
        "establishment_type": "Nightclub",
        "description": (
            "Opened February 2026 in the former Bar None space in Yaletown, Heist draws inspiration from a baroque "
            "art museum crossed with an art thieves' hideout — layered textures, dramatic lighting, unique chandeliers "
            "above bottle service tables, and a Funktion-One sound system. The venue introduces a cocktail-forward "
            "approach to table service featuring custom house-made mixers. Operated by The Key Collection, Heist "
            "programs EDM and hip-hop with resident DJs and touring guest artists."
        ),
        "address": "1222 Hamilton Street, Vancouver, BC V6B 2S8",
        "neighbourhood": "Yaletown",
        "phone": None,
        "latitude": 49.2745,
        "longitude": -123.1219,
        "music_types": ["edm", "hip-hop"],
        "vibe_tags": ["new", "upscale", "baroque aesthetic", "cocktail-forward", "Funktion-One", "art-driven"],
        "primary_nights": ["thursday", "friday", "saturday", "sunday"],
        "hours": {
            "monday": None,
            "tuesday": None,
            "wednesday": None,
            "thursday": "10:00 PM – 3:00 AM",
            "friday": "10:00 PM – 3:00 AM",
            "saturday": "10:00 PM – 3:00 AM",
            "sunday": "10:00 PM – 3:00 AM",
        },
        "price_tier": "$$$",
        "cover_charge_info": "Ticketed events via Showpass. Regular cover not confirmed — check heist.ca or Instagram.",
        "bottle_minimum": None,
        "dress_code": "Upscale — smart attire expected. Contact venue for specifics.",
        "age_restriction": 19,
        "hospitality_company": "The Key Collection",
        "capacity": 300,
        "image_url": "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [],
        "website_url": None,
        "instagram_url": "https://www.instagram.com/heistvancouver",
        "reservation_link": "mailto:tables@thekeycollection.ca",
        "is_featured": True,
        "is_active": True,
        "faqs": [
            {
                "question": "What is Heist Nightclub?",
                "answer": (
                    "Heist is Yaletown's newest upscale nightclub, opened February 2026. The interior is inspired by "
                    "a baroque art museum and an art thieves' hideout, with a Funktion-One sound system and "
                    "cocktail-forward bottle service. Operated by The Key Collection."
                ),
            },
            {
                "question": "How do I book a VIP table?",
                "answer": "Email tables@thekeycollection.ca or DM @heistvancouver on Instagram.",
            },
        ],
    },
    {
        "name": "Gorg-o-Mish",
        "establishment_type": "After-Hours Club",
        "description": (
            "Vancouver's longest-running legal after-hours club with over 20 years of operation. Gorg-o-Mish opens "
            "at 2 AM when all other clubs are closing, running until 8 AM. No alcohol is sold — this is a sober "
            "after-hours club focused entirely on music and dancing, with stunning lighting, an electrifying "
            "atmosphere, and a zero-tolerance policy for hate. Rotating local and international DJs spin house "
            "and techno across the weekend."
        ),
        "address": "695 Smithe Street, Vancouver, BC V6B 2C9",
        "neighbourhood": "Downtown Vancouver",
        "phone": "(604) 694-9007",
        "latitude": 49.2795,
        "longitude": -123.1213,
        "music_types": ["house", "techno"],
        "vibe_tags": ["after-hours", "underground", "sober venue", "techno", "house", "inclusive", "20-year institution"],
        "primary_nights": ["saturday", "sunday"],
        "hours": {
            "monday": None,
            "tuesday": None,
            "wednesday": None,
            "thursday": None,
            "friday": None,
            "saturday": "2:00 AM – 8:00 AM",
            "sunday": "2:00 AM – 8:00 AM",
        },
        "special_nights": [
            "Saturday into Sunday morning — House and techno from 2–8 AM",
            "Sunday into Monday morning — House and techno from 2–8 AM",
            "Special themed nights for Halloween and Valentine's Day",
        ],
        "price_tier": "$",
        "cover_charge_info": "Cover charge applies — exact amount not confirmed, check Instagram or door.",
        "bottle_minimum": None,
        "dress_code": "Casual; theme-appropriate on special nights.",
        "age_restriction": 19,
        "hospitality_company": None,
        "capacity": 300,
        "image_url": "https://images.unsplash.com/photo-1598387180429-c06a8b4a9e28?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [],
        "website_url": "https://gorgomish.com",
        "instagram_url": None,
        "reservation_link": None,
        "is_featured": False,
        "is_active": True,
        "faqs": [
            {
                "question": "What makes Gorg-o-Mish different?",
                "answer": (
                    "It opens at 2 AM — when every other club closes — and runs until 8 AM. No alcohol is sold. "
                    "The focus is entirely on music and dancing. It's been operating legally for over 20 years, "
                    "making it Vancouver's most established after-hours club."
                ),
            },
            {
                "question": "What music is played?",
                "answer": "House and techno, with a rotating roster of local and international DJs.",
            },
        ],
    },
    {
        "name": "The Fox Cabaret",
        "establishment_type": "Live Music Venue / Cabaret",
        "description": (
            "A converted old movie theatre in Mount Pleasant, The Fox Cabaret has become one of Vancouver's most "
            "beloved independent venues. The projection room houses the main dance floor in a long, narrow two-level "
            "layout, with a balcony bar upstairs and the adjacent Cabaret Room for smaller events. Programming spans "
            "indie, alternative, electronic, rock, hip-hop, comedy, and community events — making it one of the "
            "most eclectic stages in the city."
        ),
        "address": "2321 Main Street, Vancouver, BC V5T 3C9",
        "neighbourhood": "Mount Pleasant",
        "phone": None,
        "latitude": 49.2632,
        "longitude": -123.1015,
        "music_types": ["live", "indie", "electronic", "hip-hop"],
        "vibe_tags": ["independent venue", "converted cinema", "intimate", "East Van", "alt-indie", "two-floor", "community"],
        "primary_nights": ["friday", "saturday"],
        "hours": {
            "monday": None,
            "tuesday": None,
            "wednesday": None,
            "thursday": None,
            "friday": "8:00 PM – 1:00 AM",
            "saturday": "8:00 PM – 1:00 AM",
            "sunday": None,
        },
        "special_occasion": "Private event bookings available for the venue or Cabaret Room.",
        "price_tier": "$$",
        "cover_charge_info": "Per-event ticketing; prices vary by show.",
        "bottle_minimum": None,
        "dress_code": "Casual",
        "age_restriction": 19,
        "hospitality_company": None,
        "capacity": None,
        "image_url": "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [],
        "website_url": "https://foxcabaret.com",
        "instagram_url": None,
        "reservation_link": None,
        "is_featured": False,
        "is_active": True,
        "faqs": [
            {
                "question": "What kind of shows does The Fox Cabaret book?",
                "answer": (
                    "The Fox books a wide range of programming: indie and alternative concerts, electronic dance nights, "
                    "hip-hop shows, stand-up comedy, and community events. Check foxcabaret.com for the current calendar."
                ),
            },
        ],
    },
    {
        "name": "Guilt & Company",
        "establishment_type": "Live Music Bar / Restaurant",
        "description": (
            "Gastown's premier underground live music venue since 2010, located in a subterranean space beneath "
            "Chill Winston, accessible via stairs from Alexander Street. Stone floors, exposed brick, and candlelit "
            "ambiance frame over 700 live performances per year — typically two different bands per night spanning "
            "jazz, funk, blues, rock, Latin, swing, and cabaret. Also hosts a weekly live radio broadcast with "
            "Roundhouse Radio 98.3."
        ),
        "address": "1 Alexander Street, Underground, Vancouver, BC V6A 1B2",
        "neighbourhood": "Gastown",
        "phone": None,
        "latitude": 49.2840,
        "longitude": -123.1050,
        "music_types": ["jazz", "live", "blues", "latin", "r&b"],
        "vibe_tags": ["underground", "candlelit", "intimate", "live music every night", "subterranean", "Gastown institution"],
        "primary_nights": ["thursday", "friday", "saturday"],
        "hours": {
            "monday": "6:00 PM – 12:00 AM",
            "tuesday": "6:00 PM – 12:00 AM",
            "wednesday": "6:00 PM – 12:00 AM",
            "thursday": "6:00 PM – 1:00 AM",
            "friday": "6:00 PM – 2:00 AM",
            "saturday": "6:00 PM – 2:00 AM",
            "sunday": "6:00 PM – 12:00 AM",
        },
        "special_nights": [
            "Hot Jazz Wednesdays",
            "Weekly Roundhouse Radio 98.3 broadcast",
            "Two live sets nightly: early show 7 PM, late show 9:30–10 PM",
        ],
        "price_tier": "$$",
        "cover_charge_info": "$6 per set per person, added to the bill when live music is playing.",
        "bottle_minimum": None,
        "dress_code": "Casual",
        "age_restriction": 19,
        "hospitality_company": None,
        "capacity": None,
        "image_url": "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [],
        "website_url": None,
        "instagram_url": None,
        "reservation_link": None,
        "is_featured": False,
        "is_active": True,
        "faqs": [
            {
                "question": "How does the cover charge work at Guilt & Company?",
                "answer": (
                    "$6 per set per person is added to your tab when live music is playing. "
                    "Not applicable for ticketed or special events."
                ),
            },
            {
                "question": "How many shows are there per night?",
                "answer": (
                    "Typically two sets: an early show with doors at 6 PM and music from 7 PM, "
                    "and a late show starting around 9:30–10 PM."
                ),
            },
        ],
    },
    {
        "name": "The Biltmore Cabaret",
        "establishment_type": "Live Music Venue / Cabaret",
        "description": (
            "A community fixture for over 50 years, The Biltmore Cabaret is one of Vancouver's most beloved indie "
            "live music venues. Known for eclectic programming across indie rock, alternative, pop, hip-hop, "
            "electronic, and stand-up comedy, the venue features state-of-the-art acoustics alongside classic "
            "vintage decor — red wallpaper, low lighting, and arcade machines. Operated by MRG Group, Canada's "
            "largest independent entertainment company."
        ),
        "address": "2755 Prince Edward Street, Vancouver, BC V5T 3J7",
        "neighbourhood": "Mount Pleasant",
        "phone": "(604) 676-0541",
        "latitude": 49.2592,
        "longitude": -123.0986,
        "music_types": ["live", "indie", "hip-hop", "electronic"],
        "vibe_tags": ["dive-chic", "indie", "red wallpaper", "live music institution", "comedy programming", "retro"],
        "primary_nights": ["thursday", "friday", "saturday"],
        "hours": {
            "monday": "8:00 PM – 1:00 AM",
            "tuesday": "8:00 PM – 1:00 AM",
            "wednesday": "8:00 PM – 1:00 AM",
            "thursday": "8:00 PM – 1:00 AM",
            "friday": "8:00 PM – 2:00 AM",
            "saturday": "8:00 PM – 2:00 AM",
            "sunday": None,
        },
        "special_nights": [
            "Kitty Nights on select Sundays",
            "Eclectic weekly programming varies by event — check biltmorecabaret.com",
        ],
        "price_tier": "$$",
        "cover_charge_info": "Ticketed events; advance tickets typically $10–$25, higher for larger acts.",
        "bottle_minimum": None,
        "dress_code": "Casual",
        "age_restriction": 19,
        "hospitality_company": "MRG Group",
        "capacity": None,
        "image_url": "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [],
        "website_url": "https://biltmorecabaret.com",
        "instagram_url": None,
        "reservation_link": None,
        "is_featured": False,
        "is_active": True,
        "faqs": [
            {
                "question": "What kind of shows does The Biltmore book?",
                "answer": (
                    "Eclectic programming across indie, alternative, pop, hip-hop, electronic, and stand-up comedy. "
                    "MRG Group also operates the Vogue Theatre and Imperial, so touring artists often play The Biltmore "
                    "before graduating to larger rooms."
                ),
            },
        ],
    },
    {
        "name": "The Portside Pub",
        "establishment_type": "Pub / Bar / Live Music Venue",
        "description": (
            "A historic three-level Gastown pub built with East Coast pub culture as its inspiration. Exposed brick, "
            "sandblasted walls, and heritage wood beams set the backdrop for 48 craft beer taps across three floors. "
            "Weekend DJ nights transform the space into a nightclub vibe, while weekday evenings feature live music, "
            "karaoke, and themed events. A neighbourhood anchor near Maple Tree Square."
        ),
        "address": "7 Alexander Street, Vancouver, BC V6A 1E9",
        "neighbourhood": "Gastown",
        "phone": "(604) 559-6333",
        "latitude": 49.2840,
        "longitude": -123.1047,
        "music_types": ["live", "hip-hop", "pop"],
        "vibe_tags": ["East Coast pub culture", "craft beer", "three-level", "live music", "DJ weekends", "Gastown"],
        "primary_nights": ["friday", "saturday"],
        "hours": {
            "monday": "5:00 PM – 2:00 AM",
            "tuesday": "5:00 PM – 2:00 AM",
            "wednesday": "5:00 PM – 2:00 AM",
            "thursday": "5:00 PM – 2:00 AM",
            "friday": "4:00 PM – 3:00 AM",
            "saturday": "5:00 PM – 3:00 AM",
            "sunday": "5:00 PM – 2:00 AM",
        },
        "special_nights": [
            "Wednesday Karaoke",
            "Thursday Wayback Playback — DJ Zeus spinning 80s, 90s, and 2000s hits",
            "Friday & Saturday — Resident DJs spinning hip-hop and Top 40",
            "Sunday–Thursday — Live music",
        ],
        "special_occasion": "Private bookings available for groups.",
        "price_tier": "$$",
        "cover_charge_info": "No cover on most nights; occasional event-specific charges.",
        "bottle_minimum": None,
        "dress_code": "Casual",
        "age_restriction": 19,
        "hospitality_company": None,
        "capacity": None,
        "image_url": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [],
        "website_url": "https://theportsidepub.com",
        "instagram_url": "https://www.instagram.com/theportsidepub",
        "reservation_link": None,
        "is_featured": False,
        "is_active": True,
        "faqs": [
            {
                "question": "What kind of venue is The Portside Pub?",
                "answer": (
                    "A three-level East Coast-inspired Gastown pub with 48 craft beer taps. Weekdays feature live "
                    "music and themed nights; weekends switch to resident DJs for a more club-oriented vibe."
                ),
            },
        ],
    },
    {
        "name": "The Pearl",
        "establishment_type": "Live Music Venue / Nightclub",
        "description": (
            "Independently owned and operated by MODO-LIVE, The Pearl reopened in 2023 in the historic Maple Leaf "
            "Theatre building (built 1908) on Granville Street. Over 10,000 sq ft across two levels with wrap-around "
            "balconies and a Meyer Sound MICA line array system. Positioned as a critical mid-sized room between "
            "smaller clubs and the Commodore Ballroom across the street, it hosts touring artists across indie, "
            "alternative, electronic, pop, hip-hop, and DJ nights including K-pop club nights."
        ),
        "address": "881 Granville Street, Vancouver, BC V6Z 1K9",
        "neighbourhood": "Granville Strip",
        "phone": None,
        "latitude": 49.2798,
        "longitude": -123.1234,
        "music_types": ["live", "indie", "electronic", "hip-hop", "pop"],
        "vibe_tags": ["independent", "mid-sized", "diverse bookings", "touring artists", "two-level", "balconies", "historic building"],
        "primary_nights": ["friday", "saturday"],
        "hours": {
            "monday": None,
            "tuesday": None,
            "wednesday": None,
            "thursday": None,
            "friday": "7:00 PM – 2:00 AM",
            "saturday": "7:00 PM – 2:00 AM",
            "sunday": None,
        },
        "special_occasion": "Four booths seating up to 12 guests each available for select shows.",
        "price_tier": "$$",
        "cover_charge_info": "Per-event ticketing; $13–$72 depending on artist. Club nights $13–$25.",
        "bottle_minimum": None,
        "dress_code": "Casual",
        "age_restriction": 19,
        "hospitality_company": "MODO-LIVE",
        "capacity": 365,
        "image_url": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [],
        "website_url": "https://thepearlvancouver.com",
        "instagram_url": "https://www.instagram.com/the.pearl.vancouver",
        "reservation_link": None,
        "is_featured": False,
        "is_active": True,
        "faqs": [
            {
                "question": "What kind of shows does The Pearl host?",
                "answer": (
                    "The Pearl books a wide range — touring indie and alternative artists, electronic and EDM nights, "
                    "hip-hop shows, and DJ club nights including K-pop events. It fills the gap between Vancouver's "
                    "smaller clubs and the Commodore Ballroom."
                ),
            },
            {
                "question": "What is the capacity?",
                "answer": "365 capacity across two levels with wrap-around balconies.",
            },
        ],
    },
    {
        "name": "Playhaus Nightclub",
        "establishment_type": "Nightclub / Show Lounge",
        "description": (
            "Vancouver's Luxury Show Lounge in Gastown, Playhaus Nightclub features an outdoor patio and themed nights "
            "blending hip-hop, urban Punjabi, and Latin beats. One of the few Vancouver venues licensed until 4 AM "
            "on special occasions. Known for South Asian-focused themed programming that draws a diverse crowd "
            "to the historic Gastown neighbourhood."
        ),
        "address": "350 Water Street, Vancouver, BC V6B 1B8",
        "neighbourhood": "Gastown",
        "phone": None,
        "latitude": 49.2845,
        "longitude": -123.1107,
        "music_types": ["hip-hop", "r&b", "latin", "pop"],
        "vibe_tags": ["luxury show lounge", "themed nights", "outdoor patio", "South Asian-focused", "Gastown"],
        "primary_nights": ["friday", "saturday"],
        "hours": {
            "monday": None,
            "tuesday": None,
            "wednesday": None,
            "thursday": None,
            "friday": "10:00 PM – 3:00 AM",
            "saturday": "10:00 PM – 3:00 AM",
            "sunday": None,
        },
        "price_tier": "$$",
        "cover_charge_info": "Varies by event; ticketed nights via Eventbrite.",
        "bottle_minimum": None,
        "dress_code": "Smart attire. Two pieces of government-issued photo ID required on busy nights.",
        "age_restriction": 19,
        "hospitality_company": None,
        "capacity": None,
        "image_url": "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [],
        "website_url": "https://playhausnightclub.com",
        "instagram_url": "https://www.instagram.com/playhausnightclub",
        "reservation_link": "https://www.instagram.com/playhausnightclub",
        "is_featured": False,
        "is_active": True,
        "faqs": [
            {
                "question": "What kind of nights does Playhaus run?",
                "answer": (
                    "Themed nights blending hip-hop, urban Punjabi, and Latin music. Check Instagram "
                    "@playhausnightclub for the current event schedule and ticket links."
                ),
            },
        ],
    },
    {
        "name": "The Blarney Stone",
        "establishment_type": "Irish Pub / Bar / Live Music Venue",
        "description": (
            "Established in 1972, The Blarney Stone is Vancouver's oldest Irish pub and the city's institution for "
            "Irish-inspired food, entertainment, and atmosphere. Live music plays every night, from rock and pop "
            "cover bands on Fridays and Saturdays to traditional Irish Sessions on Sundays. The venue is the "
            "definitive destination for St. Patrick's Day celebrations in Vancouver — an all-day ticketed festival "
            "starting at 9 AM."
        ),
        "address": "216 Carrall Street, Vancouver, BC V6B 2J1",
        "neighbourhood": "Gastown",
        "phone": "(604) 687-4322",
        "latitude": 49.2838,
        "longitude": -123.1052,
        "music_types": ["live", "rock", "pop"],
        "vibe_tags": ["Irish pub", "live music every night", "historic", "Gastown", "St. Patrick's Day institution", "tourist favourite"],
        "primary_nights": ["friday", "saturday"],
        "hours": {
            "monday": "11:00 AM – 2:00 AM",
            "tuesday": "11:00 AM – 2:00 AM",
            "wednesday": "11:00 AM – 2:00 AM",
            "thursday": "11:00 AM – 2:00 AM",
            "friday": "11:00 AM – 3:00 AM",
            "saturday": "11:00 AM – 3:00 AM",
            "sunday": "11:00 AM – 2:00 AM",
        },
        "special_nights": [
            "Sunday Irish Sessions — traditional Irish tunes",
            "All-day St. Patrick's Day festival (ticketed, doors 9 AM)",
            "Trivia nights and Irish appreciation nights throughout the year",
        ],
        "special_occasion": "Large group bookings available.",
        "price_tier": "$",
        "cover_charge_info": "Occasional cover charge around $12 on busy nights.",
        "bottle_minimum": None,
        "dress_code": "Casual",
        "age_restriction": 19,
        "hospitality_company": None,
        "capacity": None,
        "image_url": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [],
        "website_url": "https://blarneystone.ca",
        "instagram_url": None,
        "reservation_link": None,
        "is_featured": False,
        "is_active": True,
        "faqs": [
            {
                "question": "Is there live music every night?",
                "answer": (
                    "Yes — live bands on Fridays and Saturdays (rock, pop, Irish), and Sunday Irish Sessions "
                    "with traditional tunes. Other nights feature DJ music and themed events."
                ),
            },
        ],
    },
    {
        "name": "The Cambie Bar & Grill",
        "establishment_type": "Pub / Bar / Live Music Venue",
        "description": (
            "Established in 1897 after the Great Vancouver Fire, The Cambie is Vancouver's oldest bar. Known for cheap "
            "drinks, a lively atmosphere, and a diverse mix of locals and travellers — the building houses a hostel "
            "upstairs, creating a uniquely social energy. Regular live music, karaoke, beer pong, and themed events "
            "make it one of Gastown's most consistent night-out options."
        ),
        "address": "300 Cambie Street, Vancouver, BC V6B 2N3",
        "neighbourhood": "Gastown",
        "phone": "(604) 684-6466",
        "latitude": 49.2832,
        "longitude": -123.1083,
        "music_types": ["live", "pop", "rock"],
        "vibe_tags": ["oldest bar in Vancouver", "cheap drinks", "hostel above", "lively", "backpacker crowd", "casual", "Gastown"],
        "primary_nights": ["thursday", "friday", "saturday"],
        "hours": {
            "monday": "11:00 AM – 1:00 AM",
            "tuesday": "11:00 AM – 2:00 AM",
            "wednesday": "11:00 AM – 1:00 AM",
            "thursday": "11:00 AM – 1:00 AM",
            "friday": "11:00 AM – 3:00 AM",
            "saturday": "11:00 AM – 3:00 AM",
            "sunday": "10:00 AM – 1:00 AM",
        },
        "special_nights": [
            "Tuesday Cambie Pong",
            "Thursday Karaoke",
            "Friday Party Night — DJ",
            "Weekend live bands",
        ],
        "price_tier": "$",
        "cover_charge_info": "Generally no cover on regular nights; occasional event covers.",
        "bottle_minimum": None,
        "dress_code": "Casual",
        "age_restriction": 19,
        "hospitality_company": "Cambie Malones Group",
        "capacity": None,
        "image_url": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [],
        "website_url": "https://cambiepubs.com",
        "instagram_url": None,
        "reservation_link": None,
        "is_featured": False,
        "is_active": True,
        "faqs": [
            {
                "question": "What is The Cambie known for?",
                "answer": (
                    "The oldest bar in Vancouver (est. 1897), known for cheap drinks, a lively crowd, "
                    "and weekly events including karaoke, live bands, and DJ nights. The hostel upstairs "
                    "keeps the energy social and unpredictable."
                ),
            },
        ],
    },
    {
        "name": "The Yale Saloon",
        "establishment_type": "Country Bar / Saloon",
        "description": (
            "Vancouver's only country bar in the Lower Mainland, The Yale Saloon brings the full Western experience "
            "to the Granville Entertainment District — complimentary line dancing lessons, mechanical bull riding "
            "with prize competitions, BBQ food, and country and rock DJs Thursday through Saturday. Monday through "
            "Wednesday features live blues. The go-to destination for bachelorette parties and anyone looking for "
            "something different on the strip."
        ),
        "address": "1300 Granville Street, Vancouver, BC V6Z 1M5",
        "neighbourhood": "Granville Strip",
        "phone": None,
        "latitude": 49.2770,
        "longitude": -123.1240,
        "music_types": ["live", "rock", "pop"],
        "vibe_tags": ["country bar", "Western-themed", "bull riding", "line dancing", "BBQ", "bachelorette destination", "only country bar in Vancouver"],
        "primary_nights": ["thursday", "friday", "saturday"],
        "hours": {
            "monday": "12:00 PM – 1:00 AM",
            "tuesday": "12:00 PM – 1:00 AM",
            "wednesday": "12:00 PM – 1:00 AM",
            "thursday": "12:00 PM – 2:00 AM",
            "friday": "12:00 PM – 3:00 AM",
            "saturday": "12:00 PM – 3:00 AM",
            "sunday": "12:00 PM – 1:00 AM",
        },
        "special_nights": [
            "Homecoming Thursdays — country and rock DJs, line dancing 8–10 PM",
            "Cowgirl Fridays — ladies free 10–11 PM, line dancing, bull riding",
            "Saddle Up Saturdays — bull riding competition with $100–$200 prize on select nights",
            "Monday–Wednesday live blues",
        ],
        "special_occasion": "Bachelorette packages available.",
        "price_tier": "$",
        "cover_charge_info": "Ticketed nights via Admitone; occasional free entry for concert afterparty ticket holders.",
        "bottle_minimum": None,
        "dress_code": "Western and boots encouraged; casual acceptable.",
        "age_restriction": 19,
        "hospitality_company": None,
        "capacity": None,
        "image_url": "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [],
        "website_url": "https://yalesaloon.com",
        "instagram_url": None,
        "reservation_link": None,
        "is_featured": False,
        "is_active": True,
        "faqs": [
            {
                "question": "Does The Yale Saloon have mechanical bull riding?",
                "answer": (
                    "Yes — bull riding competitions run on select nights with $100–$200 cash prizes. "
                    "Line dancing lessons are also complimentary Thursday through Saturday from 8–10 PM."
                ),
            },
            {
                "question": "Is The Yale Saloon good for a bachelorette party?",
                "answer": (
                    "Yes — it's one of the most popular bachelorette destinations in Vancouver. "
                    "Contact the venue through yalesaloon.com for package details."
                ),
            },
        ],
    },
    {
        "name": "Pierre's Champagne Lounge",
        "establishment_type": "Champagne Lounge / Nightclub",
        "description": (
            "Located in historic Yaletown behind a hidden door and exposed brick walls, Pierre's is Vancouver's "
            "most exclusive champagne lounge. A marble bar, classic craftsmanship, and a sophisticated atmosphere "
            "set it apart from the city's conventional nightlife. Operated by After Dark Hospitality Group, the "
            "venue specializes in champagne, bottle service, and high-end cocktails in an intimate, speakeasy-adjacent "
            "setting."
        ),
        "address": "1035 Mainland Street, Vancouver, BC V6B 2R9",
        "neighbourhood": "Yaletown",
        "phone": "(604) 250-5126",
        "latitude": 49.2742,
        "longitude": -123.1214,
        "music_types": ["hip-hop", "pop"],
        "vibe_tags": ["speakeasy-adjacent", "exclusive", "champagne lounge", "hidden door", "intimate", "Yaletown", "upscale"],
        "primary_nights": ["wednesday", "thursday", "friday", "saturday"],
        "hours": {
            "monday": None,
            "tuesday": None,
            "wednesday": "9:00 PM – 2:00 AM",
            "thursday": "9:00 PM – 2:00 AM",
            "friday": "8:00 PM – 3:00 AM",
            "saturday": "8:00 PM – 3:00 AM",
            "sunday": "9:00 PM – 2:00 AM",
        },
        "price_tier": "$$$$",
        "cover_charge_info": "Cover charge not confirmed — contact venue directly.",
        "bottle_minimum": None,
        "dress_code": "Upscale / smart attire required.",
        "age_restriction": 19,
        "hospitality_company": "After Dark Hospitality Group",
        "capacity": None,
        "image_url": "https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [],
        "website_url": "https://pierreslounge.ca",
        "instagram_url": None,
        "reservation_link": None,
        "is_featured": False,
        "is_active": True,
        "faqs": [
            {
                "question": "What makes Pierre's different?",
                "answer": (
                    "Pierre's is a hidden champagne lounge behind an unmarked door in Yaletown, focused on "
                    "champagne, premium cocktails, and bottle service in an intimate, upscale setting. "
                    "Part of the After Dark Hospitality Group alongside Twelve West."
                ),
            },
        ],
    },
    {
        "name": "Hello Goodbye Bar",
        "establishment_type": "Speakeasy Lounge / Nightclub",
        "description": (
            "Accessible through an unmarked red door and down a hidden staircase in Yaletown, Hello Goodbye Bar "
            "is a subterranean boutique nightlife experience. Artfully designed interiors, a seasonal cocktail menu, "
            "and VIP bottle service create an intimate atmosphere that transitions from a relaxed cocktail lounge "
            "to a lively nightclub as the night progresses. Hip-hop and R&B from resident DJs from around 10:30 PM "
            "onward, with private event bookings available."
        ),
        "address": "1120 Hamilton Street, Vancouver, BC V6B 2S2",
        "neighbourhood": "Yaletown",
        "phone": "(604) 669-6292",
        "latitude": 49.2741,
        "longitude": -123.1217,
        "music_types": ["hip-hop", "r&b"],
        "vibe_tags": ["speakeasy", "hidden door", "underground", "boutique", "intimate", "Yaletown", "cocktail-forward"],
        "primary_nights": ["thursday", "friday", "saturday"],
        "hours": {
            "monday": None,
            "tuesday": None,
            "wednesday": None,
            "thursday": "10:00 PM – 2:00 AM",
            "friday": "10:00 PM – 3:00 AM",
            "saturday": "10:00 PM – 3:00 AM",
            "sunday": None,
        },
        "special_nights": [
            "Happy Hour Thursday & Friday 8–10 PM",
            "Long weekend Sundays open on select occasions",
        ],
        "special_occasion": "Private event and corporate bookings available.",
        "price_tier": "$$$",
        "cover_charge_info": "Cover charge not confirmed publicly — check Instagram or contact venue.",
        "bottle_minimum": None,
        "dress_code": "Upscale casual implied — smart attire recommended.",
        "age_restriction": 19,
        "hospitality_company": None,
        "capacity": None,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [],
        "website_url": "https://hellogoodbyebar.com",
        "instagram_url": "https://www.instagram.com/hellogoodbyebar",
        "reservation_link": "https://hellogoodbyebar.com",
        "is_featured": False,
        "is_active": True,
        "faqs": [
            {
                "question": "How do I find Hello Goodbye Bar?",
                "answer": (
                    "Look for the unmarked red door on Hamilton Street in Yaletown, then take the hidden "
                    "staircase down. It's a subterranean speakeasy-style lounge."
                ),
            },
            {
                "question": "What is the vibe?",
                "answer": (
                    "Intimate and cocktail-forward early in the night, transitioning to a hip-hop and R&B "
                    "nightclub atmosphere after 10:30 PM. Bottle service available on club nights."
                ),
            },
        ],
    },
    {
        "name": "Parker Rooftop",
        "establishment_type": "Rooftop Bar / Restaurant / Event Space",
        "description": (
            "Located 120 feet above Downtown Vancouver's Beach District on the 9th floor of The Parker Hotel, "
            "Parker Rooftop features three breathtaking patios, 20-foot ceilings, floor-to-ceiling windows, "
            "and unparalleled city and ocean views. A 4,000 sq ft indoor Living Room concept sits alongside "
            "extensive patio space. The menu is Japanese-inspired drawing from the style of Nobu, featuring "
            "sashimi, crudos, signature rolls, premium seafood, and grilled steaks with Peruvian influences "
            "including yuzu, miso, truffle, and jalapeño, paired with handcrafted cocktails and an exceptional "
            "sake program."
        ),
        "address": "9th Floor, 1379 Howe Street, Vancouver, BC V6Z 1R7",
        "neighbourhood": "Downtown / Beach District",
        "phone": "(604) 696-6951",
        "latitude": 49.2757,
        "longitude": -123.1271,
        "music_types": ["live", "electronic"],
        "vibe_tags": ["rooftop", "upscale", "ocean views", "Japanese-Peruvian menu", "sake program", "luxury hotel bar", "sunset destination"],
        "primary_nights": ["friday", "saturday"],
        "hours": {
            "monday": None,
            "tuesday": None,
            "wednesday": "3:00 PM – 11:00 PM",
            "thursday": "3:00 PM – 11:00 PM",
            "friday": "3:00 PM – 11:00 PM",
            "saturday": "12:00 PM – 11:00 PM",
            "sunday": "12:00 PM – 11:00 PM",
        },
        "special_nights": [
            "Live music last Sunday of every month",
            "Happy Hour daily 3:00 PM – 6:00 PM",
        ],
        "special_occasion": "Full venue buyout from C$10,000. Private events up to 215 guests.",
        "price_tier": "$$$$",
        "cover_charge_info": "No cover charge — reservation-based.",
        "bottle_minimum": None,
        "dress_code": "Upscale casual",
        "age_restriction": 19,
        "hospitality_company": "Executive Table Group",
        "capacity": 215,
        "image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [],
        "website_url": "https://parkerrooftop.com",
        "instagram_url": "https://www.instagram.com/parkerrooftop",
        "reservation_link": "https://parkerrooftop.com",
        "is_featured": True,
        "is_active": True,
        "faqs": [
            {
                "question": "Do I need a reservation?",
                "answer": (
                    "Reservations are strongly recommended for Thursday through Sunday evenings. "
                    "Walk-ins may be accommodated but space is limited, especially on weekends."
                ),
            },
            {
                "question": "Can I book for a private event?",
                "answer": (
                    "Yes — full venue buyouts start from C$10,000 and can accommodate up to 215 guests. "
                    "Contact the Parker Rooftop events team directly for pricing and availability."
                ),
            },
            {
                "question": "Is there live music?",
                "answer": (
                    "Live music is featured on the last Sunday of every month. DJ sets run on select "
                    "evening events. Check Instagram for current programming."
                ),
            },
        ],
    },
    {
        "name": "D6 Bar & Lounge",
        "establishment_type": "Rooftop Lounge / Bar / Restaurant",
        "description": (
            "A vibrant indoor/outdoor experience on the 6th floor of Parq Vancouver, adjacent to BC Place stadium. "
            "The space features a 30,000 sq ft green space called The Park, a steam fireplace, curated bookshelves, "
            "a pool table, and panoramic views of the Vancouver skyline. Self-described as 'Vancouver's elite cocktail "
            "lounge — Vegas-inspired nights nestled within a resort and casino.' Menu features bluefin tuna, oysters, "
            "jumbo prawns, sushi, caviar, and elevated bar bites alongside handcrafted cocktails, champagne, and a "
            "carefully chosen wine program."
        ),
        "address": "39 Smithe Street, 6th Floor, Vancouver, BC V6B 0R3",
        "neighbourhood": "Downtown / Yaletown",
        "phone": None,
        "latitude": 49.2757,
        "longitude": -123.1096,
        "music_types": ["electronic", "hip-hop"],
        "vibe_tags": ["casino rooftop", "Vegas-inspired", "luxury", "outdoor terrace", "pool table", "fireplace", "skyline views", "pre-show destination"],
        "primary_nights": ["friday", "saturday"],
        "hours": {
            "monday": None,
            "tuesday": "3:00 PM – 11:00 PM",
            "wednesday": "3:00 PM – 11:00 PM",
            "thursday": "3:00 PM – 11:00 PM",
            "friday": "3:00 PM – 11:00 PM",
            "saturday": "3:00 PM – 11:00 PM",
            "sunday": "3:00 PM – 11:00 PM",
        },
        "special_nights": [
            "DJ nights on select Fridays and Saturdays — ticketed events",
        ],
        "special_occasion": "Private event bookings available via Parq Vancouver.",
        "price_tier": "$$$$",
        "cover_charge_info": "No standard cover. Ticketed for special DJ events.",
        "bottle_minimum": None,
        "dress_code": "Smart casual; polished attire recommended for DJ nights",
        "age_restriction": 19,
        "hospitality_company": "Parq Vancouver",
        "capacity": None,
        "image_url": "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1600&q=80",
        "logo_url": None,
        "gallery_urls": [],
        "website_url": "https://parqcasino.com/d-6-lounge",
        "instagram_url": "https://www.instagram.com/d6barandlounge",
        "reservation_link": "https://www.opentable.com/r/d6-lounge-parq-vancouver",
        "is_featured": False,
        "is_active": True,
        "faqs": [
            {
                "question": "How do I access D6?",
                "answer": (
                    "D6 is located on the 6th floor of Parq Vancouver at 39 Smithe Street. "
                    "Access via The DOUGLAS hotel lobby. ID is strictly enforced as it sits within a casino resort."
                ),
            },
            {
                "question": "Is D6 open when there are events at BC Place?",
                "answer": (
                    "Yes — D6 is a popular pre-show and post-show destination given its proximity to BC Place. "
                    "Reservations are recommended on event nights as it gets busy."
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
