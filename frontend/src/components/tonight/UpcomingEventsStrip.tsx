"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { ptMonthShort, ptDay, ptWeekdayTime } from "@/lib/date";
import { Badge } from "@/components/ui/Badge";
import { EventFormModal } from "@/components/events/EventFormModal";
import { isPast } from "date-fns";
import type { Event, PaginatedList } from "@/types";

type DateFilter = "tonight" | "weekend" | "week" | "upcoming";

const FILTERS: { key: DateFilter; label: string }[] = [
  { key: "tonight", label: "Tonight" },
  { key: "weekend", label: "This Weekend" },
  { key: "week", label: "This Week" },
  { key: "upcoming", label: "All Upcoming" },
];

function getDateRange(filter: DateFilter): Record<string, string> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (filter === "tonight") {
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);
    return { date_from: today.toISOString(), date_to: end.toISOString() };
  }
  if (filter === "weekend") {
    const day = today.getDay();
    const daysToFri = day === 0 ? -2 : day <= 5 ? 5 - day : 0;
    const fri = new Date(today);
    fri.setDate(today.getDate() + daysToFri);
    const sun = new Date(fri);
    sun.setDate(fri.getDate() + 2);
    sun.setHours(23, 59, 59, 999);
    return { date_from: fri.toISOString(), date_to: sun.toISOString() };
  }
  if (filter === "week") {
    const end = new Date(today);
    end.setDate(today.getDate() + 7);
    end.setHours(23, 59, 59, 999);
    return { date_from: today.toISOString(), date_to: end.toISOString() };
  }
  return { date_from: today.toISOString() };
}

interface EventChipProps {
  event: Event;
}

function EventChip({ event }: EventChipProps) {
  const [modal, setModal] = useState<"guestlist" | "reservation" | null>(null);
  const date = new Date(event.date);

  const guestlistClosed = event.guestlist_closes_at ? isPast(new Date(event.guestlist_closes_at)) : false;
  const entryClosed = event.entry_closes_at ? isPast(new Date(event.entry_closes_at)) : false;

  const hasGuestlist = event.our_guestlist && !guestlistClosed && (event.venue?.guestlist_enabled ?? false);
  const hasTickets = !hasGuestlist && !!event.ticket_url && !entryClosed;

  return (
    <>
      {modal && (
        <EventFormModal
          mode={modal}
          eventId={event.id}
          venueId={event.venue_id ?? undefined}
          eventName={event.name}
          venueName={event.venue?.name}
          onClose={() => setModal(null)}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative flex-shrink-0 w-[260px] card-surface overflow-hidden hover:border-gold/40 transition-colors duration-300 cursor-pointer flex flex-col"
      >
        {/* Date bar */}
        <div className="flex items-stretch border-b border-white/5">
          {/* Day block */}
          <div className="flex flex-col items-center justify-center px-4 py-3 border-r border-white/5 bg-gold/5 min-w-[60px]">
            <span className="text-gold text-[9px] uppercase tracking-[0.2em]">{ptMonthShort(date)}</span>
            <span className="font-serif text-2xl text-text-primary leading-none">{ptDay(date)}</span>
          </div>

          {/* Time + venue */}
          <div className="flex flex-col justify-center px-4 py-3 min-w-0">
            <p className="text-text-dim text-[9px] uppercase tracking-widest truncate">{ptWeekdayTime(date)}</p>
            {event.venue?.name && (
              <Link
                href={`/venues/${event.venue.slug}`}
                onClick={e => e.stopPropagation()}
                className="text-text-muted text-[10px] truncate hover:text-gold transition-colors mt-0.5"
              >
                {event.venue.name}
              </Link>
            )}
          </div>

          {/* Music badge */}
          {event.music_type && (
            <div className="flex items-center pr-3 ml-auto">
              <Badge label={event.music_type} variant="gold" />
            </div>
          )}
        </div>

        {/* Event name + CTA */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 flex-1">
          <Link href={`/events/${event.slug}`} className="flex-1 min-w-0">
            <h4 className="font-serif text-base text-text-primary group-hover:text-gold transition-colors leading-snug line-clamp-2">
              {event.name}
            </h4>
            {event.lineup && event.lineup.length > 0 && (
              <p className="text-text-dim text-[10px] mt-1 truncate">
                ♪ {event.lineup.slice(0, 2).map(a => a.name).join(", ")}
              </p>
            )}
          </Link>

          {hasGuestlist && (
            <button
              onClick={e => { e.stopPropagation(); setModal("guestlist"); }}
              className="flex-shrink-0 text-[9px] uppercase tracking-widest text-gold border border-gold/40 px-2.5 py-1.5 hover:bg-gold/10 transition-colors"
            >
              List
            </button>
          )}
          {hasTickets && (
            <a
              href={event.ticket_url!}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex-shrink-0 text-[9px] uppercase tracking-widest text-gold border border-gold/40 px-2.5 py-1.5 hover:bg-gold/10 transition-colors"
            >
              Tickets
            </a>
          )}
        </div>
      </motion.div>
    </>
  );
}

export function UpcomingEventsStrip() {
  const [filter, setFilter] = useState<DateFilter>("upcoming");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ ...getDateRange(filter), limit: "20" });
    api
      .get<PaginatedList<Event>>(`/api/events?${params}`)
      .then(data => setEvents(data.items))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <section className="py-20 border-t border-white/5">
      {/* Header */}
      <div className="px-6 max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end gap-6">
          <div>
            <p className="text-gold text-[10px] uppercase tracking-[0.3em] mb-2">What&apos;s On</p>
            <h2 className="font-serif text-3xl md:text-4xl text-text-primary">Upcoming Events</h2>
            <div className="h-px w-12 bg-gold mt-3" />
          </div>

          {/* Date filters */}
          <div className="flex gap-1 flex-wrap sm:ml-auto">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`text-[9px] uppercase tracking-[0.2em] px-4 py-2 border transition-all duration-200 ${
                  filter === f.key
                    ? "border-gold text-gold bg-gold/5"
                    : "border-white/10 text-text-dim hover:border-gold/40 hover:text-text-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Horizontal scroll strip */}
      <div className="relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-background to-transparent z-10" />

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-6 pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              // Skeletons
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[260px] h-[108px] bg-white/3 animate-pulse border border-white/5"
                />
              ))
            ) : events.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-shrink-0 text-text-dim text-sm px-2 py-8"
              >
                No events found for this period.
              </motion.div>
            ) : (
              events.map(event => <EventChip key={event.id} event={event} />)
            )}
          </AnimatePresence>

          {/* View all link */}
          {!loading && events.length > 0 && (
            <Link
              href="/events"
              className="flex-shrink-0 w-[140px] flex flex-col items-center justify-center border border-white/5 hover:border-gold/30 text-text-dim hover:text-gold transition-colors gap-2 text-[10px] uppercase tracking-widest"
            >
              <span className="font-serif text-2xl text-gold/40 group-hover:text-gold">→</span>
              <span>View All</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
