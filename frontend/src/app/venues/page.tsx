import type { Metadata } from "next";
import { Suspense } from "react";
import { api } from "@/lib/api";
import { VenueTabs } from "@/components/venues/VenueTabs";
import { VenueFilter } from "@/components/venues/VenueFilter";
import { VenueListClient } from "@/components/venues/VenueListClient";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import type { PaginatedList, Venue } from "@/types";

export const metadata: Metadata = {
  title: "Vancouver Nightclubs & Venues",
  description: "Discover Vancouver's best nightclubs, lounges, and bars. Filter by music type, neighbourhood, and vibe.",
  alternates: { canonical: "/venues" },
};

async function VenueSection({ searchParams }: { searchParams: Record<string, string> }) {
  try {
    const qs = new URLSearchParams({ ...searchParams, limit: "18" }).toString();
    const data = await api.get<PaginatedList<Venue>>(`/api/venues?${qs}`, { cache: "no-store" });
    const key = qs;
    return (
      <VenueListClient
        key={key}
        initialItems={data.items}
        total={data.total}
        searchParams={searchParams}
      />
    );
  } catch {
    return (
      <p className="text-text-muted py-16 text-center text-sm uppercase tracking-widest">
        Could not load venues — please refresh.
      </p>
    );
  }
}

export default function VenuesPage({ searchParams }: { searchParams: Record<string, string> }) {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          eyebrow="Vancouver"
          title="Venues"
          subtitle="Handpicked nightclubs, lounges, and bars across the city."
        />

        <div className="mt-10 flex flex-col gap-3">
          <Suspense fallback={null}>
            <VenueTabs />
          </Suspense>
          <Suspense fallback={null}>
            <VenueFilter />
          </Suspense>
        </div>

        <div className="mt-8">
          <Suspense fallback={<SkeletonGrid count={18} />}>
            <VenueSection searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
