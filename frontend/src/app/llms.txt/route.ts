export const revalidate = 3600;

import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL || "https://back.yvradvisory.ca";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://yvradvisory.ca";

async function fetchItems(path: string, nameKey: string, slugPrefix: string): Promise<string[]> {
  try {
    const res = await fetch(`${API}${path}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map(
      (item: any) => `- [${item[nameKey] || item.title || item.name}](${SITE}${slugPrefix}/${item.slug})`
    );
  } catch {
    return [];
  }
}

export async function GET() {
  const [venues, events, posts] = await Promise.all([
    fetchItems("/api/venues?limit=500", "name", "/venues"),
    fetchItems("/api/events?limit=500", "name", "/events"),
    fetchItems("/api/blog?limit=500", "title", "/blog"),
  ]);

  const body = `# YVR Advisory
> Vancouver's premier nightlife advisory — curated venue discovery, exclusive events, guestlist signups, and table reservations.
> Site: ${SITE}

## Key Pages

- [Home](${SITE}/) — Personalised nightlife recommendations
- [Venues](${SITE}/venues) — All curated Vancouver venues
- [Events](${SITE}/events) — Upcoming events and club nights
- [Where to Go Tonight](${SITE}/where-to-go) — Quiz-based venue recommendations
- [Music](${SITE}/music) — Browse by music genre
- [Blog / Journal](${SITE}/blog) — Vancouver nightlife guides and editorial
- [Guestlist Signup](${SITE}/guestlist) — Free guestlist access
- [Table Reservations](${SITE}/reserve) — VIP table and bottle service

## Venues

${venues.join("\n") || "_(no venues)_"}

## Upcoming Events

${events.join("\n") || "_(no events)_"}

## Blog Posts

${posts.join("\n") || "_(no posts)_"}
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
