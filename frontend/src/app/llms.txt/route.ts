import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL || "https://back.yvradvisory.ca";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://yvradvisory.ca";

async function fetchItems(path: string, nameKey = "name", slugPrefix = "") {
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map((item: any) => `- [${item[nameKey] || item.title}](${SITE}${slugPrefix}/${item.slug})`);
  } catch {
    return [];
  }
}

export async function GET() {
  const [venues, events, posts] = await Promise.all([
    fetchItems("/api/venues?limit=500", "name", "/venues"),
    fetchItems("/api/events?limit=200", "name", "/events"),
    fetchItems("/api/blog?limit=200", "title", "/blog"),
  ]);

  const body = `# YVR Advisory

> Vancouver's premier nightlife advisory platform. Curated venue discovery, exclusive event listings, personalized recommendations, guestlist signups, and table reservations for YVR's finest nightlife.

## About

YVR Advisory helps people find the best nightlife experiences in Vancouver, BC, Canada. We cover nightclubs, cocktail bars, rooftop lounges, and bar restaurants across neighbourhoods including Gastown, Granville Street, Yaletown, and Coal Harbour.

## Key Pages

- [Home](${SITE}/) — Personalized nightlife recommendations
- [Venues](${SITE}/venues) — Browse all curated Vancouver venues
- [Events](${SITE}/events) — Upcoming events and club nights
- [Blog](${SITE}/blog) — Vancouver nightlife guides and editorial
- [Where to Go Tonight](${SITE}/tonight) — Quiz-based venue recommendations
- [Guestlist Signup](${SITE}/guestlist) — Free guestlist access
- [Table Reservations](${SITE}/reserve) — VIP table and bottle service

## Venues

${venues.join("\n") || "_(no venues yet)_"}

## Upcoming Events

${events.join("\n") || "_(no events yet)_"}

## Blog Posts

${posts.join("\n") || "_(no posts yet)_"}
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
