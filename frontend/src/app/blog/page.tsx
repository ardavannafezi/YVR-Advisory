import type { Metadata } from "next";
import { api } from "@/lib/api";
import { BlogCard } from "@/components/blog/BlogCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ErrorState } from "@/components/ui/ErrorState";
import type { PaginatedList, BlogPost } from "@/types";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Vancouver Nightlife Journal — Guides & Stories | YVR Advisory",
  description:
    "Inside guides, venue spotlights, and nightlife stories from Vancouver. Expert coverage of clubs, bars, events, and the city's after-dark scene.",
  keywords: [
    "Vancouver nightlife guide",
    "Vancouver club reviews",
    "Vancouver bar guide",
    "Vancouver events guide",
    "Vancouver nightlife blog",
    "Vancouver nightlife tips",
    "Vancouver club scene",
  ],
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    siteName: "YVR Advisory",
    title: "Vancouver Nightlife Journal — Guides & Stories | YVR Advisory",
    description: "Inside guides, venue spotlights, and stories from Vancouver's nightlife scene.",
    url: "/blog",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "YVR Advisory Journal" }],
  },
};

export default async function BlogPage() {
  try {
    const data = await api.get<PaginatedList<BlogPost>>("/api/blog?limit=50");
    return (
      <div className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading eyebrow="Journal" title="Vancouver Nightlife" subtitle="Stories, guides, and insider knowledge from the city's finest nights." />
          {data.items.length === 0 ? (
            <p className="text-text-muted">No articles published yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.items.map((p, i) => <BlogCard key={p.id} post={p} index={i} />)}
            </div>
          )}
        </div>
      </div>
    );
  } catch {
    return (
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        <ErrorState message="Could not load the journal. Please try refreshing." />
      </div>
    );
  }
}
