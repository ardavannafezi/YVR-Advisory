"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { format, isPast } from "date-fns";
import { fadeUp } from "@/styles/animations";
import { Badge } from "@/components/ui/Badge";
import { EventGallery } from "@/components/events/EventGallery";
import type { Event } from "@/types";

interface EventCardProps {
  event: Event;
  index?: number;
}

const ENTRY_LABELS: Record<string, string> = {
  guestlist: "Guestlist",
  tickets: "Tickets",
  reservation: "Reservation",
};

export function EventCard({ event, index = 0 }: EventCardProps) {
  const date = new Date(event.date);
  const entryClosed = event.entry_closes_at ? isPast(new Date(event.entry_closes_at)) : false;

  const images = event.gallery?.length
    ? event.gallery
    : event.image_url
    ? [event.image_url]
    : [];

  const primaryEntryType = event.entry_types?.[0];
  const entryHref =
    !entryClosed && primaryEntryType === "guestlist" && event.our_guestlist
      ? `/guestlist?event_id=${event.id}`
      : !entryClosed && primaryEntryType === "reservation" && event.our_reservation
      ? `/reserve?event_id=${event.id}&venue_id=${event.venue_id}`
      : !entryClosed && event.ticket_url
      ? event.ticket_url
      : null;

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="group relative flex flex-col card-surface overflow-hidden hover:border-gold/30 transition-colors duration-300"
    >
      {/* Gallery / Image */}
      <div className="relative overflow-hidden">
        {images.length > 0 ? (
          <EventGallery images={images} alt={event.name} variant="compact" autoPlay={images.length > 1} />
        ) : (
          <div className="h-48 bg-gradient-to-br from-gold/5 to-transparent flex items-end p-3">
            <div className="w-8 h-px bg-gold/30" />
          </div>
        )}

        {/* Date badge */}
        <div className="absolute top-3 left-3 z-30 bg-background/90 backdrop-blur-sm px-3 py-2 text-center border border-white/10">
          <p className="text-gold text-[10px] uppercase tracking-widest">{format(date, "MMM")}</p>
          <p className="text-text-primary font-serif text-xl leading-none">{format(date, "d")}</p>
        </div>

        {/* Entry closed overlay */}
        {entryClosed && (
          <div className="absolute inset-0 z-30 bg-black/60 flex items-center justify-center">
            <span className="text-[10px] uppercase tracking-widest text-white/60 border border-white/20 px-3 py-1">
              Entry Closed
            </span>
          </div>
        )}

        {/* Music badge */}
        {event.music_type && !entryClosed && (
          <div className="absolute top-3 right-3 z-30">
            <Badge label={event.music_type} variant="gold" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Venue + time */}
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
          {format(date, "EEE, h:mm a")}
        </p>

        {/* Event name */}
        <Link href={`/events/${event.slug}`} className="flex-1">
          <h3 className="font-serif text-xl text-text-primary group-hover:text-gold transition-colors duration-300 mb-2">
            {event.name}
          </h3>

          {event.description && (
            <p className="text-text-muted text-sm line-clamp-2 leading-relaxed mb-3">{event.description}</p>
          )}
        </Link>

        {/* Lineup preview */}
        {event.lineup && event.lineup.length > 0 && (
          <p className="text-text-dim text-[11px] mb-3 truncate">
            ♪ {event.lineup.slice(0, 2).map(a => a.name).join(", ")}
            {event.lineup.length > 2 && ` +${event.lineup.length - 2} more`}
          </p>
        )}

        {/* Social proof */}
        {event.social_proof_count != null && (
          <p className="text-text-dim text-[10px] uppercase tracking-widest mb-3">
            {event.social_proof_count} people interested
          </p>
        )}

        {/* Entry type badges + CTA */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-white/5">
          <div className="flex gap-1.5 flex-wrap">
            {event.entry_types?.map(type => (
              <Badge key={type} label={ENTRY_LABELS[type] ?? type} variant="dim" />
            ))}
          </div>

          {entryHref && !entryClosed && (
            primaryEntryType === "tickets" && !event.our_guestlist ? (
              <a
                href={entryHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-[10px] uppercase tracking-widest text-gold border border-gold/30 px-3 py-1.5 hover:bg-gold/10 transition-colors flex-shrink-0"
              >
                Tickets
              </a>
            ) : (
              <Link
                href={entryHref}
                onClick={e => e.stopPropagation()}
                className="text-[10px] uppercase tracking-widest text-gold border border-gold/30 px-3 py-1.5 hover:bg-gold/10 transition-colors flex-shrink-0"
              >
                {primaryEntryType === "guestlist" ? "Guestlist" : "Reserve"}
              </Link>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}
