import type { Metadata } from "next";
import { Suspense } from "react";
import { api } from "@/lib/api";
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

async function getInitialEvents(): Promise<PaginatedList<Event>> {
  try {
    return await api.get<PaginatedList<Event>>("/api/events?limit=12", { cache: "no-store" });
  } catch {
    return { items: [], total: 0, page: 1, limit: 12 };
  }
}

export default async function EventsPage() {
  const initialData = await getInitialEvents();

  return (
    <main>
      <Suspense fallback={<div className="min-h-screen" />}>
        <EventsPageClient initialData={initialData} />
      </Suspense>
    </main>
  );
}
