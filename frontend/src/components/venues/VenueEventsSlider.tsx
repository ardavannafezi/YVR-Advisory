"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { api } from "@/lib/api";
import { EventFormModal } from "@/components/events/EventFormModal";
import { Badge } from "@/components/ui/Badge";
import type { Event, PaginatedList } from "@/types";

interface Props {
  venueId: number;
  venueName: string;
}

export function VenueEventsSlider({ venueId, venueName }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [modal, setModal] = useState<{ mode: "guestlist" | "reservation"; event: Event } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get<PaginatedList<Event>>(`/api/events?venue_id=${venueId}&limit=12`)
      .then(data => {
        setEvents(data.items);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [venueId]);

  if (!loaded || events.length === 0) return null;

  const displayed = showAll ? events : events.slice(0, 6);

  return (
    <>
      {modal && (
        <EventFormModal
          mode={modal.mode}
          eventId={modal.event.id}
          venueId={venueId}
          eventName={modal.event.name}
          venueName={venueName}
          onClose={() => setModal(null)}
        />
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs uppercase tracking-widest text-gold">Upcoming Events</p>
          {total > 6 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="text-[11px] uppercase tracking-widest text-text-dim hover:text-text-muted transition-colors"
            >
              Show all {total} →
            </button>
          )}
        </div>

        {/* Horizontal scroll slider */}
        {!showAll ? (
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: "none" }}
          >
            {displayed.map(event => (
              <EventSliderCard
                key={event.id}
                event={event}
                onGuestlist={() => setModal({ mode: "guestlist", event })}
                onReservation={() => setModal({ mode: "reservation", event })}
              />
            ))}
          </div>
        ) : (
          /* Expanded grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {events.map(event => (
              <EventSliderCard
                key={event.id}
                event={event}
                onGuestlist={() => setModal({ mode: "guestlist", event })}
                onReservation={() => setModal({ mode: "reservation", event })}
                wide
              />
            ))}
          </div>
        )}

        {showAll && (
          <button
            onClick={() => setShowAll(false)}
            className="mt-4 text-[11px] uppercase tracking-widest text-text-dim hover:text-text-muted transition-colors"
          >
            ← Show less
          </button>
        )}
      </div>
    </>
  );
}

function EventSliderCard({
  event,
  onGuestlist,
  onReservation,
  wide = false,
}: {
  event: Event;
  onGuestlist: () => void;
  onReservation: () => void;
  wide?: boolean;
}) {
  const date = new Date(event.date);
  const hasGuestlist = event.our_guestlist;
  const hasReservation = event.our_reservation;

  return (
    <div
      className={`flex-shrink-0 snap-start border border-white/8 bg-white/[0.02] hover:border-gold/25 transition-colors duration-200 ${
        wide ? "w-full" : "w-64"
      }`}
    >
      {/* Image */}
      {event.image_url && (
        <div className="relative h-32 overflow-hidden">
          <img src={event.image_url} alt={event.name} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1.5 text-center border border-white/10">
            <p className="text-gold text-[9px] uppercase tracking-widest">{format(date, "MMM")}</p>
            <p className="text-text-primary font-serif text-base leading-none">{format(date, "d")}</p>
          </div>
          {event.music_type && (
            <div className="absolute top-2 right-2">
              <Badge label={event.music_type} variant="gold" />
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        {!event.image_url && (
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-background/90 border border-white/10 px-2 py-1 text-center">
              <p className="text-gold text-[9px] uppercase tracking-widest">{format(date, "MMM")}</p>
              <p className="text-text-primary font-serif text-base leading-none">{format(date, "d")}</p>
            </div>
            {event.music_type && <Badge label={event.music_type} variant="gold" />}
          </div>
        )}

        <Link href={`/events/${event.slug}`}>
          <h4 className="font-serif text-base text-text-primary hover:text-gold transition-colors line-clamp-1 mb-1">
            {event.name}
          </h4>
        </Link>
        <p className="text-text-dim text-[10px] mb-3">{format(date, "EEE, h:mm a")}</p>

        <div className="flex gap-2">
          {hasGuestlist && (
            <button
              onClick={onGuestlist}
              className="flex-1 text-[10px] uppercase tracking-widest text-gold border border-gold/30 py-1.5 hover:bg-gold/10 transition-colors"
            >
              Guestlist
            </button>
          )}
          {hasReservation && (
            <button
              onClick={onReservation}
              className="flex-1 text-[10px] uppercase tracking-widest text-text-muted border border-white/15 py-1.5 hover:border-gold/30 hover:text-gold transition-colors"
            >
              Table
            </button>
          )}
          {!hasGuestlist && !hasReservation && event.ticket_url && (
            <a
              href={event.ticket_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-[10px] uppercase tracking-widest text-gold border border-gold/30 py-1.5 hover:bg-gold/10 transition-colors"
            >
              Tickets
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
