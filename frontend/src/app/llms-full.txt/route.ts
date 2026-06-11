import { NextResponse } from "next/server";
import { buildLlmsFullText, fetchLlmsDirectory } from "@/lib/llms";

export const dynamic = "force-dynamic";

export async function GET() {
  const directory = await fetchLlmsDirectory();
  const body = buildLlmsFullText(directory);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
