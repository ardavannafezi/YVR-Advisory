import Link from "next/link";
import { api } from "@/lib/api";
import { EventCard } from "@/components/events/EventCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Event } from "@/types";

async function getUpcomingEvents(): Promise<Event[]> {
  try {
    return await api.get<Event[]>("/api/events/upcoming", { next: { revalidate: 300 } });
  } catch {
    return [];
  }
}

export async function UpcomingEvents() {
  const events = await getUpcomingEvents();

  return (
    <section className="bg-white/[0.02] py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <SectionHeading eyebrow="What's On" title="Upcoming Events" />
          <Link href="/events" className="hidden md:block text-xs uppercase tracking-widest text-gold hover:text-gold-light transition-colors">
            All Events →
          </Link>
        </div>

        {events.length === 0 ? (
          <p className="text-text-muted">No upcoming events yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
