import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://yvradvisory.com";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchSlugs(path: string): Promise<string[]> {
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map((item: any) => item.slug).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [venues, events, posts] = await Promise.all([
    fetchSlugs("/api/venues?limit=500"),
    fetchSlugs("/api/events?limit=500"),
    fetchSlugs("/api/blog?limit=500"),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/venues`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/events`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/music`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/tonight`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/guestlist`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/reserve`, changeFrequency: "monthly", priority: 0.7 },
  ];

  return [
    ...staticPages,
    ...venues.map((slug) => ({ url: `${SITE}/venues/${slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...events.map((slug) => ({ url: `${SITE}/events/${slug}`, changeFrequency: "daily" as const, priority: 0.9 })),
    ...posts.map((slug) => ({ url: `${SITE}/blog/${slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
