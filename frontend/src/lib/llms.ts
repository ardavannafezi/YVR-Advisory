import { ORGANIZATION, SITE_URL } from "@/lib/site";

const API_BASE = "https://back.yvradvisory.ca";
const DEFAULT_LIMIT = 250;

export type VenueLlmsItem = {
  name: string;
  slug: string;
  description?: string | null;
  neighbourhood?: string | null;
  establishment_type?: string | null;
  music_types: string[];
  updated_at?: string | null;
};

export type EventLlmsItem = {
  name: string;
  slug: string;
  description?: string | null;
  date?: string | null;
  music_type?: string | null;
  venue_name?: string | null;
  updated_at?: string | null;
};

export type BlogLlmsItem = {
  title: string;
  slug: string;
  summary?: string | null;
  music_type?: string | null;
  tags: string[];
  author?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
};

type FeedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
};

type Section = "venues" | "events" | "blog";

const feedPaths: Record<Section, string> = {
  venues: "/api/venues/llms",
  events: "/api/events/llms",
  blog: "/api/blog/llms",
};

async function fetchFeed<T>(section: Section, page = 1, limit = DEFAULT_LIMIT): Promise<FeedResponse<T>> {
  const res = await fetch(`${API_BASE}${feedPaths[section]}?page=${page}&limit=${limit}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`LLMS feed failed: ${section} page ${page} (${res.status})`);
  }

  return res.json();
}

async function fetchAll<T>(section: Section): Promise<T[]> {
  const items: T[] = [];
  let page = 1;

  while (true) {
    const data = await fetchFeed<T>(section, page);
    items.push(...data.items);
    if (!data.has_next) break;
    page += 1;
  }

  return items;
}

export async function fetchLlmsDirectory() {
  const [venues, events, posts] = await Promise.all([
    fetchAll<VenueLlmsItem>("venues"),
    fetchAll<EventLlmsItem>("events"),
    fetchAll<BlogLlmsItem>("blog"),
  ]);

  return { venues, events, posts };
}

export function trimSentence(value?: string | null, max = 160) {
  if (!value) return "";
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 3).trimEnd()}...`;
}

export function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function buildLlmsIndexText(counts: { venues: number; events: number; posts: number }) {
  return [
    "# YVR Advisory",
    "",
    `> ${ORGANIZATION.description}`,
    `> Organization: ${ORGANIZATION.name}`,
    `> Location: ${ORGANIZATION.location}`,
    `> Contact: ${ORGANIZATION.email}`,
    `> Instagram: ${ORGANIZATION.instagramUrl}`,
    `> Site: ${SITE_URL}`,
    "",
    "## Key Pages",
    "",
    `- [Home](${SITE_URL}/)`,
    `- [Venues](${SITE_URL}/venues)`,
    `- [Events](${SITE_URL}/events)`,
    `- [Where to Go Tonight](${SITE_URL}/where-to-go)`,
    `- [Tonight](${SITE_URL}/tonight)`,
    `- [Blog](${SITE_URL}/blog)`,
    `- [Guestlist](${SITE_URL}/guestlist)`,
    `- [Reservations](${SITE_URL}/reserve)`,
    `- [About](${SITE_URL}/about)`,
    `- [Full LLM Directory](${SITE_URL}/llms-full.txt)`,
    "",
    "## Coverage",
    "",
    `- Active venues: ${counts.venues}`,
    `- Published events: ${counts.events}`,
    `- Published blog posts: ${counts.posts}`,
    "",
    "## Notes",
    "",
    "- This file is generated from live site data.",
    "- Added, updated, unpublished, or deactivated items are reflected automatically.",
    "- Canonical public URLs only.",
    "",
  ].join("\n");
}

export function buildLlmsFullText(directory: {
  venues: VenueLlmsItem[];
  events: EventLlmsItem[];
  posts: BlogLlmsItem[];
}) {
  const venueLines = directory.venues.map((venue) => {
    const parts = [
      venue.neighbourhood,
      venue.establishment_type,
      venue.music_types.length ? venue.music_types.join(", ") : "",
    ].filter(Boolean);
    const suffix = parts.length ? ` - ${parts.join(" | ")}` : "";
    const desc = trimSentence(venue.description, 140);
    return `- [${venue.name}](${SITE_URL}/venues/${venue.slug})${suffix}${desc ? `. ${desc}` : ""}`;
  });

  const eventLines = directory.events.map((event) => {
    const parts = [formatDate(event.date), event.venue_name, event.music_type].filter(Boolean);
    const suffix = parts.length ? ` - ${parts.join(" | ")}` : "";
    const desc = trimSentence(event.description, 140);
    return `- [${event.name}](${SITE_URL}/events/${event.slug})${suffix}${desc ? `. ${desc}` : ""}`;
  });

  const postLines = directory.posts.map((post) => {
    const parts = [formatDate(post.published_at), post.author, post.music_type].filter(Boolean);
    const suffix = parts.length ? ` - ${parts.join(" | ")}` : "";
    const desc = trimSentence(post.summary, 140);
    return `- [${post.title}](${SITE_URL}/blog/${post.slug})${suffix}${desc ? `. ${desc}` : ""}`;
  });

  return [
    "# YVR Advisory Full Directory",
    "",
    `> ${ORGANIZATION.description}`,
    `> Contact: ${ORGANIZATION.email}`,
    `> Instagram: ${ORGANIZATION.instagramUrl}`,
    `> Site: ${SITE_URL}`,
    "",
    "## Venues",
    "",
    ...(venueLines.length ? venueLines : ["_(no active venues)_"]),
    "",
    "## Events",
    "",
    ...(eventLines.length ? eventLines : ["_(no published events)_"]),
    "",
    "## Blog",
    "",
    ...(postLines.length ? postLines : ["_(no published posts)_"]),
    "",
  ].join("\n");
}
