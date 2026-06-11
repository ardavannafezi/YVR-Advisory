import { NextResponse } from "next/server";
import { buildUrlSet, staticSitemapEntries } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

export async function GET() {
  return new NextResponse(buildUrlSet(staticSitemapEntries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
