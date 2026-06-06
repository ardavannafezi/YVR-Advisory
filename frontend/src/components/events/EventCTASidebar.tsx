"use client";

import { useState } from "react";
import { ptDateShort, ptTime } from "@/lib/date";
import { GoldButton } from "@/components/ui/GoldButton";
import { EventFormModal } from "@/components/events/EventFormModal";
import { gtagEvent } from "@/lib/gtag";

interface Props {
  eventId: number;
  venueId?: number;
  eventName: string;
  venueName?: string;
  venueEstType?: string;
  date: string;
  hasGuestlistCTA: boolean;
  hasTicketCTA: boolean;
  ticketUrl?: string;
  hasReserveCTA: boolean;
  entryClosed: boolean;
  guestlistClosed: boolean;
  venueHasGuestlist: boolean;
}

export function EventCTASidebar({
  eventId, venueId, eventName, venueName, venueEstType,
  date, hasGuestlistCTA, hasTicketCTA, ticketUrl, hasReserveCTA,
  entryClosed, guestlistClosed, venueHasGuestlist,
}: Props) {
  const [modal, setModal] = useState<"guestlist" | "reservation" | null>(null);
  const d = new Date(date);

  return (
    <>
      {modal && (
        <EventFormModal
          mode={modal}
          eventId={eventId}
          venueId={venueId}
          eventName={eventName}
          venueName={venueName}
          onClose={() => setModal(null)}
        />
      )}

      {/* Sticky desktop sidebar */}
      <div className="sticky top-28">
        <div className="card-surface p-6 space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-gold mb-4">Reserve Your Spot</p>

          {entryClosed ? (
            <p className="text-text-muted text-sm">Entry for this event has closed.</p>
          ) : (
            <>
              {/* Guestlist closed notice */}
              {venueHasGuestlist && guestlistClosed && (
                <p className="text-[11px] uppercase tracking-widest text-text-dim border border-white/10 px-3 py-2">
                  Guestlist closed
                </p>
              )}

              {hasGuestlistCTA && (
                <button onClick={() => { gtagEvent("generate_lead", { item_name: eventName, item_category: "Guestlist", venue: venueName }); setModal("guestlist"); }} className="block w-full">
                  <GoldButton className="w-full">Join Guestlist</GoldButton>
                </button>
              )}
              {hasReserveCTA && (
                <button onClick={() => { gtagEvent("generate_lead", { item_name: eventName, item_category: "Reservation", venue: venueName }); setModal("reservation"); }} className="block w-full">
                  <GoldButton variant={hasGuestlistCTA ? "outline" : "solid"} className="w-full">
                    Book Bottle Service
                  </GoldButton>
                </button>
              )}
              {hasTicketCTA && (
                <a href={ticketUrl!} target="_blank" rel="noopener noreferrer" className="block" onClick={() => gtagEvent("begin_checkout", { item_name: eventName, item_category: "Tickets", venue: venueName, ticket_url: ticketUrl })}>
                  <GoldButton variant={hasGuestlistCTA || hasReserveCTA ? "ghost" : "solid"} className="w-full">
                    Get Tickets
                  </GoldButton>
                </a>
              )}
              {!hasGuestlistCTA && !hasTicketCTA && !hasReserveCTA && !guestlistClosed && (
                <p className="text-text-muted text-sm">Check back for availability.</p>
              )}
            </>
          )}

          {/* Event meta summary */}
          <div className="pt-4 border-t border-white/8 space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-text-dim">Date</span>
              <span className="text-text-muted">{ptDateShort(d)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-text-dim">Time</span>
              <span className="text-text-muted">{ptTime(d)} PT</span>
            </div>
            {venueName && (
              <div className="flex justify-between text-[11px]">
                <span className="text-text-dim">Venue</span>
                <span className="text-text-muted">{venueName}</span>
              </div>
            )}
            {venueEstType && (
              <div className="flex justify-between text-[11px]">
                <span className="text-text-dim">Type</span>
                <span className="text-text-muted">{venueEstType}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sticky bar */}
      {!entryClosed && (hasGuestlistCTA || hasTicketCTA || hasReserveCTA) && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-white/10 p-4 flex gap-3">
          {hasGuestlistCTA && (
            <button onClick={() => { gtagEvent("generate_lead", { item_name: eventName, item_category: "Guestlist", venue: venueName, source: "mobile_bar" }); setModal("guestlist"); }} className="flex-1">
              <GoldButton className="w-full">Join Guestlist</GoldButton>
            </button>
          )}
          {hasReserveCTA && (
            <button onClick={() => { gtagEvent("generate_lead", { item_name: eventName, item_category: "Reservation", venue: venueName, source: "mobile_bar" }); setModal("reservation"); }} className="flex-1">
              <GoldButton variant="outline" className="w-full">Book Table</GoldButton>
            </button>
          )}
          {hasTicketCTA && !hasGuestlistCTA && !hasReserveCTA && (
            <a href={ticketUrl!} target="_blank" rel="noopener noreferrer" className="flex-1" onClick={() => gtagEvent("begin_checkout", { item_name: eventName, item_category: "Tickets", venue: venueName, source: "mobile_bar" })}>
              <GoldButton className="w-full">Get Tickets</GoldButton>
            </a>
          )}
        </div>
      )}
    </>
  );
}
