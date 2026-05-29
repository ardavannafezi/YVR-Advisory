# API Reference

Base URL: `https://api.yourdomain.com`

## Public Endpoints

### Venues
| Method | Path | Query Params | Description |
|--------|------|-------------|-------------|
| GET | `/api/venues` | `music_type`, `neighbourhood`, `vibe`, `page`, `limit` | List venues |
| GET | `/api/venues/featured` | — | Top 4 featured venues |
| GET | `/api/venues/{slug}` | — | Venue detail |

### Events
| Method | Path | Query Params | Description |
|--------|------|-------------|-------------|
| GET | `/api/events` | `date_from`, `date_to`, `category`, `music_type`, `venue_id`, `page`, `limit` | List events |
| GET | `/api/events/upcoming` | — | Next 6 upcoming events |
| GET | `/api/events/{slug}` | — | Event detail |

### Blog
| Method | Path | Query Params | Description |
|--------|------|-------------|-------------|
| GET | `/api/blog` | `tags`, `music_type`, `page`, `limit` | List published posts |
| GET | `/api/blog/{slug}` | — | Post detail |

### Music
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/music/genres` | All genres with venue/event counts |
| GET | `/api/music/{genre}` | Venues + events for genre |

### Tonight
| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/tonight/recommend` | `{music_type, vibe, party_size, budget}` | Ranked venue recommendations |

### Forms
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/guestlist` | Submit guestlist entry |
| POST | `/api/reservations` | Submit table reservation |
| POST | `/api/analytics/track` | Track user preference event |

### SEO / Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/sitemap.xml` | Full sitemap |
| GET | `/robots.txt` | Robots file |
| GET | `/health` | Health check |

## Webhook

### n8n Event Ingestion
```
POST /api/webhooks/n8n
X-API-Key: <N8N_WEBHOOK_API_KEY>
```
See [n8n-integration.md](n8n-integration.md) for full payload spec.

## Admin Endpoints (JWT Bearer required)

Get token: `POST /api/admin/auth/login` → `{"email":"...","password":"..."}`

All admin routes require: `Authorization: Bearer <token>`

### Venues CRUD
```
GET    /api/admin/venues
POST   /api/admin/venues
PUT    /api/admin/venues/{id}
DELETE /api/admin/venues/{id}
```

### Events CRUD
```
GET    /api/admin/events
POST   /api/admin/events
PUT    /api/admin/events/{id}
DELETE /api/admin/events/{id}
```

### Blog CRUD
```
GET    /api/admin/blog
POST   /api/admin/blog
PUT    /api/admin/blog/{id}
DELETE /api/admin/blog/{id}
```

### Guestlist & Reservations
```
GET    /api/admin/guestlist
GET    /api/admin/reservations
PUT    /api/admin/reservations/{id}   ← update status
```

### Analytics
```
GET    /api/admin/analytics/summary
GET    /api/admin/analytics/emails
```
