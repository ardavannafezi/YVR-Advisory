import type { Metadata } from "next";
import { Suspense } from "react";
import { api } from "@/lib/api";
import { VenueCard } from "@/components/venues/VenueCard";
import { VenueFilter } from "@/components/venues/VenueFilter";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import type { PaginatedList, Venue } from "@/types";

export const metadata: Metadata = {
  title: "Vancouver Nightclubs & Venues",
  description: "Discover Vancouver's best nightclubs and event venues. Filter by music type, neighbourhood, and vibe.",
  alternates: { canonical: "/venues" },
};

async function VenueList({ searchParams }: { searchParams: Record<string, string> }) {
  try {
    const qs = new URLSearchParams(searchParams).toString();
    const data = await api.get<PaginatedList<Venue>>(`/api/venues?${qs}`, { cache: "no-store" });
    if (!data.items.length) {
      return <p className="text-text-muted col-span-3">No venues match your filters.</p>;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.items.map((v, i) => <VenueCard key={v.id} venue={v} index={i} />)}
      </div>
    );
  } catch {
    return <ErrorState message="Could not load venues. Please refresh to try again." />;
  }
}

export default function VenuesPage({ searchParams }: { searchParams: Record<string, string> }) {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          eyebrow="Vancouver"
          title="Venues"
          subtitle="Handpicked nightclubs and event spaces across the city."
        />
        <div className="flex flex-col md:flex-row gap-10">
          <Suspense fallback={null}>
            <VenueFilter />
          </Suspense>
          <div className="flex-1">
            <Suspense fallback={<SkeletonGrid />}>
              <VenueList searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
