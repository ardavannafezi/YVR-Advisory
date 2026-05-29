# YVR Advisory

High-end Vancouver nightlife and events advisory platform. Helps users discover venues, events, and nightlife experiences personalized to their taste.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS + Framer Motion |
| Backend | FastAPI (Python, async) |
| Database | PostgreSQL (Railway managed) |
| ORM | SQLAlchemy 2.0 async |
| Migrations | Alembic |
| Auth | JWT (python-jose) |
| Deployment | Railway (2 services + Postgres add-on) |
| Automation | n8n webhook for event ingestion |

## Folder Structure

```
YVR-Advisory/
├── docs/          ← documentation
├── backend/       ← FastAPI app
└── frontend/      ← Next.js app
```

## Docs

- [Architecture](architecture.md)
- [API Reference](api-reference.md)
- [Deployment Guide](deployment.md)
- [n8n Integration](n8n-integration.md)
