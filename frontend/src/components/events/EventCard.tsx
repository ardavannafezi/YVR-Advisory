"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { isPast } from "date-fns";
import { fadeUp } from "@/styles/animations";
import { Badge } from "@/components/ui/Badge";
import { EventGallery } from "@/components/events/EventGallery";
import { EventFormModal } from "@/components/events/EventFormModal";
import { ptMonthShort, ptDay, ptWeekdayTime } from "@/lib/date";
import type { Event } from "@/types";

interface EventCardProps {
  event: Event;
  index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const [modal, setModal] = useState<"guestlist" | "reservation" | null>(null);
  const date = new Date(event.date);

  const guestlistClosed = event.guestlist_closes_at ? isPast(new Date(event.guestlist_closes_at)) : false;
  const entryClosed = event.entry_closes_at ? isPast(new Date(event.entry_closes_at)) : false;

  const images = event.gallery?.length
    ? event.gallery
    : event.image_url
    ? [event.image_url]
    : [];

  // Loosened gates — show CTAs whenever the event opts in, regardless of venue flags
  const hasGuestlist = event.our_guestlist && !guestlistClosed;
  const hasReservation = event.our_reservation && !entryClosed;
  const hasTickets = !hasGuestlist && !hasReservation && !!event.ticket_url && !entryClosed;

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
        variants={fadeUp}
        custom={index}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#0d0d0d] border border-white/[0.07] hover:border-gold/25 transition-colors duration-300 h-full"
      >
        {/* Gallery / Image */}
        <div className="relative overflow-hidden flex-shrink-0">
          {images.length > 0 ? (
            <EventGallery images={images} alt={event.name} variant="compact" autoPlay={images.length > 1} />
          ) : (
            <div className="h-44 bg-gradient-to-br from-gold/5 to-transparent flex items-end p-4">
              <div className="w-8 h-px bg-gold/30" />
            </div>
          )}

          {/* Date badge */}
          <div className="absolute top-3 left-3 z-30 bg-black/90 backdrop-blur-sm px-3 py-2 text-center border border-white/10 rounded-lg">
            <p className="text-gold text-[10px] uppercase tracking-widest">{ptMonthShort(date)}</p>
            <p className="text-text-primary font-sans font-bold text-xl leading-none">{ptDay(date)}</p>
          </div>

          {/* Entry closed */}
          {entryClosed && (
            <div className="absolute inset-0 z-30 bg-black/60 flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-widest text-white/60 border border-white/20 px-3 py-1">
                Entry Closed
              </span>
            </div>
          )}

          {event.music_type && !entryClosed && (
            <div className="absolute top-3 right-3 z-30">
              <Badge label={event.music_type} variant="gold" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5">
          <p className="text-text-dim text-[10px] uppercase tracking-widest mb-1.5">
            {event.venue?.name && (
              <Link
                href={`/venues/${event.venue.slug}`}
                onClick={e => e.stopPropagation()}
                className="hover:text-gold transition-colors"
              >
                {event.venue.name}
              </Link>
            )}
            {event.venue?.name && " · "}
            {ptWeekdayTime(date)}
          </p>

          <Link href={`/events/${event.slug}`} className="flex-1 min-w-0">
            <h3 className="font-sans font-semibold text-lg text-text-primary group-hover:text-gold transition-colors duration-300 mb-2 leading-snug">
              {event.name}
            </h3>
            {event.description && (
              <p className="text-text-muted text-sm line-clamp-2 leading-relaxed">{event.description}</p>
            )}
          </Link>

          {event.lineup && event.lineup.length > 0 && (
            <p className="text-text-dim text-[11px] mt-2 truncate">
              ♪ {event.lineup.slice(0, 2).map(a => a.name).join(", ")}
              {event.lineup.length > 2 && ` +${event.lineup.length - 2} more`}
            </p>
          )}

          {/* CTAs — always show at least "View Event" */}
          <div className="mt-auto pt-4 border-t border-white/5 flex flex-wrap gap-2 items-center">
            {hasGuestlist && (
              <button
                onClick={e => { e.preventDefault(); setModal("guestlist"); }}
                className="text-[10px] uppercase tracking-widest text-gold border border-gold/35 px-4 py-2 hover:bg-gold/10 transition-colors rounded-md"
              >
                Join Guestlist
              </button>
            )}
            {hasReservation && (
              <button
                onClick={e => { e.preventDefault(); setModal("reservation"); }}
                className="text-[10px] uppercase tracking-widest text-text-muted border border-white/12 px-4 py-2 hover:border-gold/35 hover:text-gold transition-colors rounded-md"
              >
                Reserve Table
              </button>
            )}
            {hasTickets && (
              <a
                href={event.ticket_url!}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-[10px] uppercase tracking-widest text-gold border border-gold/35 px-4 py-2 hover:bg-gold/10 transition-colors rounded-md"
              >
                Get Tickets
              </a>
            )}
            <Link
              href={`/events/${event.slug}`}
              onClick={e => e.stopPropagation()}
              className="ml-auto text-[10px] uppercase tracking-widest text-text-dim hover:text-gold transition-colors"
            >
              Details →
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  );
}
