import type { Metadata } from "next";
import { Suspense } from "react";
import { api } from "@/lib/api";
import { VenueTabs } from "@/components/venues/VenueTabs";
import { VenueFilter } from "@/components/venues/VenueFilter";
import { VenueListClient } from "@/components/venues/VenueListClient";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import type { PaginatedList, Venue } from "@/types";

export const metadata: Metadata = {
  title: "Vancouver Nightclubs & Venues",
  description:
    "Discover Vancouver's best nightclubs, lounges, and bars. Filter by music type, neighbourhood, and vibe.",
  alternates: { canonical: "/venues" },
};

async function VenueSection({ searchParams }: { searchParams: Record<string, string> }) {
  try {
    const qs = new URLSearchParams({ ...searchParams, limit: "18" }).toString();
    const data = await api.get<PaginatedList<Venue>>(`/api/venues?${qs}`, { cache: "no-store" });
    return (
      <VenueListClient
        key={qs}
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
    <div className="min-h-screen">
      {/* Editorial header */}
      <div className="border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-6 md:pt-36 md:pb-16">
          <p className="text-gold text-[10px] uppercase tracking-[0.45em] mb-4 md:mb-8">Vancouver, BC</p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 md:gap-8">
            <h1 className="font-sans font-bold text-4xl md:text-6xl xl:text-7xl text-text-primary leading-[1.05]">
              Vancouver<br />
              <span className="text-gold">Venues</span>
            </h1>
            <p className="hidden md:block text-text-muted text-base leading-relaxed max-w-sm lg:mb-1">
              Handpicked nightclubs, cocktail bars, and lounges — curated for the night you have in mind.
            </p>
          </div>
        </div>
      </div>

      {/* Filters + grid */}
      <div className="max-w-7xl mx-auto px-6 py-4 md:py-10">
        <div className="flex flex-col gap-4 mb-10">
          <Suspense fallback={null}>
            <VenueTabs />
          </Suspense>
          <Suspense fallback={null}>
            <VenueFilter />
          </Suspense>
        </div>

        <Suspense fallback={<SkeletonGrid count={18} />}>
          <VenueSection searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
