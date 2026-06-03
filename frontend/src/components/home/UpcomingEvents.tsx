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
    <section className="py-24 border-t border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <SectionHeading eyebrow="What's On" title="Upcoming Events" />
          <Link
            href="/events"
            className="hidden md:block text-xs uppercase tracking-widest text-gold hover:text-gold-light transition-colors"
          >
            All Events →
          </Link>
        </div>

        {events.length === 0 ? (
          <p className="text-text-muted">No upcoming events yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
            {events.slice(0, 6).map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        )}

        {/* Mobile "All Events" link */}
        <div className="mt-8 text-center md:hidden">
          <Link href="/events" className="text-xs uppercase tracking-widest text-gold">
            All Events →
          </Link>
        </div>
      </div>
    </section>
  );
}
