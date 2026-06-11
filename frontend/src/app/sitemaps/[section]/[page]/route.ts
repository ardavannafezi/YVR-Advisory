import { NextRequest, NextResponse } from "next/server";
import { buildPageUrl, buildUrlSet, fetchSitemapFeed, type SitemapSection } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

const validSections = new Set<SitemapSection>(["venues", "events", "blog"]);

export async function GET(
  _request: NextRequest,
  { params }: { params: { section: string; page: string } },
) {
  if (!validSections.has(params.section as SitemapSection)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const page = Number(params.page);
  if (!Number.isInteger(page) || page < 1) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    const data = await fetchSitemapFeed(params.section as SitemapSection, page);
    const entries = data.items.map((item) => ({
      loc: buildPageUrl(params.section as SitemapSection, item.slug),
      lastmod: item.last_modified ?? undefined,
    }));

    return new NextResponse(buildUrlSet(entries), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[sitemap-section] feed failed", params.section, page, error);
    return new NextResponse("Not Found", { status: 404 });
  }
}
