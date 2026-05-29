import type { Metadata } from "next";
import { Suspense } from "react";
import { api } from "@/lib/api";
import { EventCard } from "@/components/events/EventCard";
import { EventFilter } from "@/components/events/EventFilter";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import type { PaginatedList, Event } from "@/types";

export const metadata: Metadata = {
  title: "Vancouver Events",
  description: "Upcoming events, raves, and nights out in Vancouver. Filter by music type and category.",
  alternates: { canonical: "/events" },
};

async function EventList({ searchParams }: { searchParams: Record<string, string> }) {
  try {
    const qs = new URLSearchParams(searchParams).toString();
    const data = await api.get<PaginatedList<Event>>(`/api/events?${qs}`, { cache: "no-store" });
    if (!data.items.length) return <p className="text-text-muted">No upcoming events match your filters.</p>;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.items.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}
      </div>
    );
  } catch {
    return <ErrorState message="Could not load events. Please refresh to try again." />;
  }
}

export default function EventsPage({ searchParams }: { searchParams: Record<string, string> }) {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading eyebrow="What's On" title="Events" subtitle="Upcoming nights across Vancouver's best venues." />
        <div className="flex flex-col md:flex-row gap-10">
          <Suspense fallback={null}><EventFilter /></Suspense>
          <div className="flex-1">
            <Suspense fallback={<SkeletonGrid />}><EventList searchParams={searchParams} /></Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
