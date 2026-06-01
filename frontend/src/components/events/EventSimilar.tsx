import { api } from "@/lib/api";
import { EventCard } from "@/components/events/EventCard";
import type { Event } from "@/types";

interface Props {
  eventId: number;
  musicType?: string;
  venueType?: string;
}

export async function EventSimilar({ eventId, musicType, venueType }: Props) {
  try {
    const res = await api.post<{ results: Event[]; similar: Event[] }>("/api/events/recommend", {
      music_types: musicType ? [musicType] : [],
      venue_types: venueType ? [venueType] : [],
      date: null,
    });

    const related = [...res.results, ...res.similar]
      .filter(e => e.id !== eventId)
      .slice(0, 3);

    if (!related.length) return null;

    return (
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-white/5" />
          <p className="text-[10px] uppercase tracking-widest text-text-dim">You Might Also Like</p>
          <div className="flex-1 h-px bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {related.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
