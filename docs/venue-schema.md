# Venue Schema Reference

Full column reference for the `venues` PostgreSQL table. Managed via SQLAlchemy in `backend/app/models/venue.py`.
Migrations live in `backend/alembic/versions/` (001 → 005).

---

## Identity

| Column | Type | Notes |
|--------|------|-------|
| `id` | `integer` | Primary key, auto-increment |
| `name` | `varchar(200)` | Unique. Display name (e.g. "Mansion Nightclub") |
| `slug` | `varchar(220)` | Unique, indexed. URL-safe version of name (e.g. `mansion-nightclub`) |

---

## Basic Info

| Column | Type | Notes |
|--------|------|-------|
| `description` | `text` | Long-form venue description for the detail page and SEO meta |
| `address` | `varchar(500)` | Full street address including postal code |
| `neighbourhood` | `varchar(100)` | Area label used for filtering (e.g. "Granville Strip", "Gastown") |
| `phone` | `varchar(50)` | Contact number; rendered as a `tel:` link on the detail page |

---

## Classification

| Column | Type | Notes |
|--------|------|-------|
| `establishment_type` | `varchar(100)` | Category label shown as a badge and used as a filter. Supported values: `Nightclub`, `Cocktail Bar`, `Bar & Restaurant`, `Rooftop Lounge` |

---

## Music & Vibe

| Column | Type | Notes |
|--------|------|-------|
| `music_types` | `text[]` | Array of genres (e.g. `["hip-hop", "house", "pop"]`) — drives filtering and quiz scoring |
| `vibe_tags` | `text[]` | Atmosphere descriptors (e.g. `["luxury", "high-energy", "bottle service"]`) — used in quiz scoring and displayed as badges |

---

## Operations

| Column | Type | Notes |
|--------|------|-------|
| `primary_nights` | `text[]` | Best nights to visit (e.g. `["friday", "saturday"]`) — used for filtering |
| `hours` | `jsonb` | Weekly hours keyed by day name; `null` = closed. Schema: `{"monday": null, "friday": "9:00 PM – 3:00 AM", ...}` |
| `special_nights` | `text[]` | Recurring themed nights (e.g. `"Mansion Fridays — Hip-Hop & House with VIP from $500"`) |
| `special_occasion` | `text` | **Optional.** Free-text description of any ongoing special occasion packages the venue offers (e.g. birthday booths, bachelorette packages, anniversary dinners). Leave `null` if not applicable. |

---

## Pricing

| Column | Type | Notes |
|--------|------|-------|
| `price_tier` | `varchar(10)` | Dollar-sign tier: `$`, `$$`, or `$$$` — shown as a badge and filter option |
| `cover_charge_info` | `varchar(500)` | Free-text cover charge description (e.g. "Free before midnight on guestlist, $20 door") |
| `bottle_minimum` | `integer` | Minimum bottle service spend in CAD (e.g. `500`) |

---

## Access & Atmosphere

| Column | Type | Notes |
|--------|------|-------|
| `dress_code` | `varchar(200)` | Dress code rule. Format: `"Label — detail"` (the label before ` — ` is shown in the quick stats card) |
| `age_restriction` | `integer` | Minimum age (e.g. `19`, `21`) — displayed as `{age}+` |
| `hospitality_company` | `varchar(200)` | Parent group (e.g. "Mansion Hospitality Group") — shown below the venue name |
| `capacity` | `integer` | Total venue capacity — shown in quick stats |

---

## Media

| Column | Type | Notes |
|--------|------|-------|
| `image_url` | `varchar(1000)` | Hero image URL — shown full-width at the top of the detail page and as the card thumbnail |
| `logo_url` | `varchar(1000)` | **Optional.** Venue brand logo URL — shown as a small icon overlay on the venue card and beside the venue name on the detail page |
| `gallery_urls` | `text[]` | Additional photo URLs — rendered as a 2–3 column photo grid on the detail page |

---

## Maps

| Column | Type | Notes |
|--------|------|-------|
| `latitude` | `float` | WGS 84 latitude — used to build Google Maps and Apple Maps direction links |
| `longitude` | `float` | WGS 84 longitude — used to build Google Maps and Apple Maps direction links |

Direction links are constructed client-side with no API key:
- Google: `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}`
- Apple: `https://maps.apple.com/?daddr={lat},{lng}&dirflg=d`

---

## FAQs

| Column | Type | Notes |
|--------|------|-------|
| `faqs` | `jsonb` | Array of `{question, answer}` objects — rendered as an animated accordion on the detail page |

Example value:
```json
[
  { "question": "What is the dress code?", "answer": "Smart and elegant..." },
  { "question": "How do I book a table?", "answer": "Use the Reserve button..." }
]
```

---

## Links

| Column | Type | Notes |
|--------|------|-------|
| `website_url` | `varchar(1000)` | Official website — rendered as "Official Website" link in the sidebar |
| `instagram_url` | `varchar(1000)` | Instagram profile URL — rendered as "Instagram" link in the sidebar; also written to `sameAs` in JSON-LD |
| `reservation_link` | `varchar(1000)` | Third-party booking URL (e.g. OpenTable) — rendered as "Book Directly" link |

---

## Status & Timestamps

| Column | Type | Notes |
|--------|------|-------|
| `is_featured` | `boolean` | If `true`, venue appears on the home page featured section (max 4 shown) |
| `is_active` | `boolean` | If `false`, venue is hidden from all public listings |
| `created_at` | `timestamp` | Set automatically on insert |
| `updated_at` | `timestamp` | Updated automatically on every write |

---

## SEO / JSON-LD

The venue detail page at `/venues/{slug}` emits `schema.org/NightClub` structured data using:
- `name`, `description`, `address` → `PostalAddress`
- `latitude` + `longitude` → `GeoCoordinates`
- `phone` → `telephone`
- `image_url` → `image`
- `website_url` → `url`
- `instagram_url` → `sameAs`
- `price_tier` → `priceRange`

---

## Filter API

`GET /api/venues` accepts these query params (all optional, combinable):

| Param | Matches on |
|-------|-----------|
| `establishment_type` | `establishment_type` ilike match |
| `music_type` | any element of `music_types` array |
| `neighbourhood` | `neighbourhood` ilike match |
| `price_tier` | exact match on `price_tier` |
| `primary_night` | any element of `primary_nights` array |
| `vibe` | any element of `vibe_tags` array |
| `dress_code` | `dress_code` ilike match |

---

## Migration History

| Migration | What it adds |
|-----------|-------------|
| `001_initial_schema` | Core venue fields: `id`, `slug`, `name`, `description`, `address`, `neighbourhood`, `music_types`, `vibe_tags`, `image_url`, `website_url`, `instagram_url`, `is_featured`, `is_active`, `capacity`, `establishment_type` |
| `002_venue_extended_fields` | `phone`, `primary_nights`, `hours`, `special_nights`, `price_tier`, `cover_charge_info`, `bottle_minimum`, `dress_code`, `age_restriction`, `hospitality_company`, `reservation_link` |
| `003_venue_maps_gallery_faq` | `establishment_type` (moved here), `gallery_urls`, `latitude`, `longitude`, `faqs` |
| `004_venue_logo_url` | `logo_url` |
| `005_venue_special_occasion` | `special_occasion` |

---

## Adding a New Venue

Add an entry to the `VENUES` list in `backend/app/utils/seed_venues.py`. The seed runs automatically on every Railway deploy (idempotent — skips slugs that already exist). To run manually:

```bash
python -m app.utils.seed_venues
```

### Supported `establishment_type` values

| Value | Description |
|-------|-------------|
| `Nightclub` | Full-service nightclub with DJ and dance floor |
| `Cocktail Bar` | Craft cocktail focused, typically smaller and more intimate |
| `Bar & Restaurant` | Full food menu alongside a bar program |
| `Rooftop Lounge` | Open-air or partially covered rooftop venue |
