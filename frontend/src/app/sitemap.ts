import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://yvradvisory.ca";
// Use public backend URL — NEXT_PUBLIC_API_URL may be an internal Railway URL unreachable server-side
const API = "https://back.yvradvisory.ca";

async function fetchSlugs(path: string): Promise<string[]> {
  const url = `${API}${path}`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.error(`[sitemap] fetch failed ${url} → ${res.status}`);
      return [];
    }
    const data = await res.json();
    const slugs = (data.items || []).map((item: { slug?: string }) => item.slug).filter(Boolean) as string[];
    console.log(`[sitemap] ${url} → ${slugs.length} slugs`);
    return slugs;
  } catch (e) {
    console.error(`[sitemap] fetch error ${url}`, e);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [venues, events, posts] = await Promise.all([
    fetchSlugs("/api/venues?limit=500"),
    fetchSlugs("/api/events?limit=500"),
    fetchSlugs("/api/blog?limit=500"),
  ]);

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE,                        changeFrequency: "daily",   priority: 1.0, lastModified: now },
    { url: `${SITE}/venues`,            changeFrequency: "daily",   priority: 0.9, lastModified: now },
    { url: `${SITE}/events`,            changeFrequency: "daily",   priority: 0.9, lastModified: now },
    { url: `${SITE}/where-to-go`,       changeFrequency: "daily",   priority: 0.9, lastModified: now },
    { url: `${SITE}/tonight`,           changeFrequency: "daily",   priority: 0.8, lastModified: now },
    { url: `${SITE}/blog`,              changeFrequency: "daily",   priority: 0.8, lastModified: now },
    { url: `${SITE}/music`,             changeFrequency: "weekly",  priority: 0.7, lastModified: now },
    { url: `${SITE}/guestlist`,         changeFrequency: "monthly", priority: 0.7, lastModified: now },
    { url: `${SITE}/reserve`,           changeFrequency: "monthly", priority: 0.7, lastModified: now },
    { url: `${SITE}/about`,             changeFrequency: "monthly", priority: 0.6, lastModified: now },
  ];

  return [
    ...staticPages,
    ...venues.map((slug) => ({
      url: `${SITE}/venues/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      lastModified: now,
    })),
    ...events.map((slug) => ({
      url: `${SITE}/events/${slug}`,
      changeFrequency: "daily" as const,
      priority: 0.9,
      lastModified: now,
    })),
    ...posts.map((slug) => ({
      url: `${SITE}/blog/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      lastModified: now,
    })),
  ];
}
