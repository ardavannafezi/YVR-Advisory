import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/site";
import { buildSitemapIndex, fetchSitemapFeed, type SitemapSection } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

const sections: SitemapSection[] = ["venues", "events", "blog"];

export async function GET() {
  const snapshots = await Promise.all(
    sections.map(async (section) => {
      try {
        return { section, data: await fetchSitemapFeed(section, 1) };
      } catch (error) {
        console.error("[sitemap-index] section fetch failed", section, error);
        return null;
      }
    }),
  );

  const entries = [{ loc: `${SITE_URL}/sitemaps/static` }];

  for (const snapshot of snapshots) {
    if (!snapshot || snapshot.data.total === 0) continue;
    const pageCount = Math.ceil(snapshot.data.total / snapshot.data.limit);
    for (let page = 1; page <= pageCount; page += 1) {
      entries.push({
        loc: `${SITE_URL}/sitemaps/${snapshot.section}/${page}`,
      });
    }
  }

  return new NextResponse(buildSitemapIndex(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
