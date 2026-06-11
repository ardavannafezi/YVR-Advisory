import { SITE_URL } from "@/lib/site";

const API_BASE = "https://back.yvradvisory.ca";
const DEFAULT_LIMIT = 500;

export type SitemapSection = "venues" | "events" | "blog";

export type SitemapFeedItem = {
  slug: string;
  last_modified?: string | null;
};

type SitemapFeedResponse = {
  items: SitemapFeedItem[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
};

const sectionConfig: Record<SitemapSection, { apiPath: string; pagePath: string }> = {
  venues: { apiPath: "/api/venues/sitemap", pagePath: "/venues" },
  events: { apiPath: "/api/events/sitemap", pagePath: "/events" },
  blog: { apiPath: "/api/blog/sitemap", pagePath: "/blog" },
};

export function getSectionConfig(section: SitemapSection) {
  return sectionConfig[section];
}

export async function fetchSitemapFeed(
  section: SitemapSection,
  page = 1,
  limit = DEFAULT_LIMIT,
): Promise<SitemapFeedResponse> {
  const { apiPath } = getSectionConfig(section);
  const res = await fetch(`${API_BASE}${apiPath}?page=${page}&limit=${limit}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`Sitemap feed failed: ${section} page ${page} (${res.status})`);
  }

  return res.json();
}

export async function fetchAllSitemapEntries(section: SitemapSection): Promise<SitemapFeedItem[]> {
  const items: SitemapFeedItem[] = [];
  let page = 1;

  while (true) {
    const data = await fetchSitemapFeed(section, page);
    items.push(...data.items);
    if (!data.has_next) break;
    page += 1;
  }

  return items;
}

export function buildPageUrl(section: SitemapSection, slug: string) {
  return `${SITE_URL}${getSectionConfig(section).pagePath}/${slug}`;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function xmlLine(tag: string, value: string) {
  return `<${tag}>${escapeXml(value)}</${tag}>`;
}

export function buildUrlSet(
  entries: Array<{ loc: string; lastmod?: string }>,
) {
  const urls = entries
    .map(({ loc, lastmod }) => {
      const fields = [xmlLine("loc", loc)];
      if (lastmod) fields.push(xmlLine("lastmod", lastmod));
      return `<url>${fields.join("")}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

export function buildSitemapIndex(
  entries: Array<{ loc: string; lastmod?: string }>,
) {
  const sitemaps = entries
    .map(({ loc, lastmod }) => {
      const fields = [xmlLine("loc", loc)];
      if (lastmod) fields.push(xmlLine("lastmod", lastmod));
      return `<sitemap>${fields.join("")}</sitemap>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemaps}</sitemapindex>`;
}

export const staticSitemapEntries = [
  { loc: SITE_URL, lastmod: new Date().toISOString() },
  { loc: `${SITE_URL}/venues`, lastmod: new Date().toISOString() },
  { loc: `${SITE_URL}/events`, lastmod: new Date().toISOString() },
  { loc: `${SITE_URL}/where-to-go`, lastmod: new Date().toISOString() },
  { loc: `${SITE_URL}/tonight`, lastmod: new Date().toISOString() },
  { loc: `${SITE_URL}/blog`, lastmod: new Date().toISOString() },
  { loc: `${SITE_URL}/music`, lastmod: new Date().toISOString() },
  { loc: `${SITE_URL}/guestlist`, lastmod: new Date().toISOString() },
  { loc: `${SITE_URL}/reserve`, lastmod: new Date().toISOString() },
  { loc: `${SITE_URL}/about`, lastmod: new Date().toISOString() },
];
