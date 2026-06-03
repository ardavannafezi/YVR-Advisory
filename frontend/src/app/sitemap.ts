import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://yvradvisory.ca";
const API = process.env.NEXT_PUBLIC_API_URL || "https://back.yvradvisory.ca";

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

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE, changeFrequency: "daily", priority: 1, lastModified: now },
    { url: `${SITE}/venues`, changeFrequency: "daily", priority: 0.9, lastModified: now },
    { url: `${SITE}/events`, changeFrequency: "daily", priority: 0.9, lastModified: now },
    { url: `${SITE}/blog`, changeFrequency: "weekly", priority: 0.8, lastModified: now },
    { url: `${SITE}/music`, changeFrequency: "weekly", priority: 0.8, lastModified: now },
    { url: `${SITE}/tonight`, changeFrequency: "daily", priority: 0.9, lastModified: now },
    { url: `${SITE}/guestlist`, changeFrequency: "monthly", priority: 0.7, lastModified: now },
    { url: `${SITE}/reserve`, changeFrequency: "monthly", priority: 0.7, lastModified: now },
  ];

  return [
    ...staticPages,
    ...venues.map((slug) => ({ url: `${SITE}/venues/${slug}`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now })),
    ...events.map((slug) => ({ url: `${SITE}/events/${slug}`, changeFrequency: "daily" as const, priority: 0.9, lastModified: now })),
    ...posts.map((slug) => ({ url: `${SITE}/blog/${slug}`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now })),
  ];
}
