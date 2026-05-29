# n8n Integration Guide

## How It Works

n8n sends event data to the YVR Advisory backend via a webhook. The backend upserts events automatically — creating new venues if needed.

## Webhook Endpoint

```
POST https://api.yourdomain.com/api/webhooks/n8n
Header: X-API-Key: <your N8N_WEBHOOK_API_KEY>
Content-Type: application/json
```

## Payload Schema

```json
{
  "event_name": "Techno Night at Celebrities",
  "venue_name": "Celebrities Nightclub",
  "date": "2026-06-15T22:00:00",
  "category": "rave",
  "music_type": "techno",
  "description": "Vancouver's premier techno night featuring local DJs.",
  "image_url": "https://example.com/flyer.jpg",
  "ticket_url": "https://tickets.com/event",
  "external_id": "eventbrite_123456"
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `event_name` | Yes | |
| `venue_name` | Yes | Creates venue if not exists |
| `date` | Yes | ISO 8601 format |
| `category` | No | e.g. "rave", "latin night", "hip-hop night" |
| `music_type` | No | e.g. "techno", "hip-hop", "house" |
| `description` | No | |
| `image_url` | No | |
| `ticket_url` | No | |
| `external_id` | No | Unique ID from source system for deduplication |

## Response

```json
{ "status": "ok", "action": "created", "event_id": 42 }
```

or

```json
{ "status": "ok", "action": "updated", "event_id": 42 }
```

## Upsert Logic

1. If `external_id` provided → lookup `Event` by `external_id`, update if found
2. If not found → match by `event_name` + `venue_name` + date (same calendar day)
3. If still not found → create new event
4. If `venue_name` doesn't match any venue → auto-create minimal venue record

## Setting Up in n8n

1. Add HTTP Request node
2. Method: POST
3. URL: `https://api.yourdomain.com/api/webhooks/n8n`
4. Headers: `X-API-Key: <your key>`
5. Body: JSON with fields above
6. Map your data source fields to the payload schema
