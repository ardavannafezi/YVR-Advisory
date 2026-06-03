import type { Metadata } from "next";
import { Suspense } from "react";
import { api } from "@/lib/api";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import { EventsPageClient } from "@/components/events/EventsPageClient";
import type { PaginatedList, Event } from "@/types";

export const metadata: Metadata = {
  title: "Vancouver Events — Upcoming Nights Out | YVR Advisory",
  description: "Discover upcoming events, raves, latin nights, and DJ sets at Vancouver's top venues. Filter by music, entry type, and date.",
  alternates: { canonical: "/events" },
  openGraph: {
    title: "Vancouver Events | YVR Advisory",
    description: "Find the best events in Vancouver — nightclubs, cocktail bars, rooftop lounges. Guestlist, tickets, and reservations.",
    url: "/events",
    type: "website",
  },
};

async function getInitialEvents(musicType?: string, entryType?: string): Promise<PaginatedList<Event>> {
  try {
    const qs = new URLSearchParams({ limit: "12" });
    if (musicType) qs.set("music_type", musicType);
    if (entryType) qs.set("entry_type", entryType);
    return await api.get<PaginatedList<Event>>(`/api/events?${qs}`, { cache: "no-store" });
  } catch {
    return { items: [], total: 0, page: 1, limit: 12 };
  }
}

export default async function EventsPage({ searchParams }: { searchParams: { music_type?: string; date?: string; entry_type?: string } }) {
  const musicType = searchParams.music_type;
  const dateFilter = searchParams.date;
  const entryType = searchParams.entry_type;
  const initialData = await getInitialEvents(musicType, entryType);

  return (
    <main>
      <Suspense fallback={<div className="min-h-screen" />}>
        <EventsPageClient
          initialData={initialData}
          initialMusicFilter={musicType ?? null}
          initialDateFilter={dateFilter ?? null}
          initialEntryFilter={entryType ?? null}
        />
      </Suspense>
    </main>
  );
}
