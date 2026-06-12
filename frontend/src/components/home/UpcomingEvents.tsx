import Link from "next/link";
import { api } from "@/lib/api";
import { EventCard } from "@/components/events/EventCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Event } from "@/types";

async function getUpcomingEvents(): Promise<Event[]> {
  try {
    return await api.get<Event[]>("/api/events/upcoming", { next: { revalidate: 900 } });
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

        {/* CTAs */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/where-to-go"
            className="w-full sm:w-auto text-center bg-gold text-[#0a0a0a] text-xs uppercase tracking-[0.2em] px-8 py-3.5 font-semibold hover:bg-gold/90 transition-colors"
          >
            Where to Go Tonight
          </Link>
          <Link
            href="/events"
            className="w-full sm:w-auto text-center text-xs uppercase tracking-[0.2em] text-gold border border-gold/40 px-8 py-3.5 hover:bg-gold/10 transition-colors"
          >
            All Events →
          </Link>
        </div>
      </div>
    </section>
  );
}
