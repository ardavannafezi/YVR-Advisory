"use client";

import { useState } from "react";
import { GoldButton } from "@/components/ui/GoldButton";
import { EventFormModal } from "@/components/events/EventFormModal";

interface Props {
  venueId: number;
  venueName: string;
  advisoryRating?: number;
  reservationLink?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  phone?: string;
  lat?: number;
  lng?: number;
}

function DirectionButtons({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const encoded = encodeURIComponent(name);
  const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encoded}`;
  const appleUrl = `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
  return (
    <div className="flex gap-2">
      <a href={googleUrl} target="_blank" rel="noopener noreferrer"
        className="flex-1 text-center text-[10px] uppercase tracking-widest py-2.5 border border-white/10 text-text-muted hover:border-gold/40 hover:text-gold transition-colors">
        Google Maps
      </a>
      <a href={appleUrl} target="_blank" rel="noopener noreferrer"
        className="flex-1 text-center text-[10px] uppercase tracking-widest py-2.5 border border-white/10 text-text-muted hover:border-gold/40 hover:text-gold transition-colors">
        Apple Maps
      </a>
    </div>
  );
}

export function VenueCTAPanel({
  venueId, venueName, advisoryRating, reservationLink, websiteUrl, instagramUrl, phone, lat, lng,
}: Props) {
  const [modal, setModal] = useState<"guestlist" | "reservation" | null>(null);

  return (
    <>
      {modal && (
        <EventFormModal
          mode={modal}
          venueId={venueId}
          venueName={venueName}
          onClose={() => setModal(null)}
        />
      )}

      <div className="card-surface p-6 flex flex-col gap-4 sticky top-24">
        {advisoryRating != null && (
          <div className="text-center border-b border-white/5 pb-4">
            <p className="text-[10px] uppercase tracking-widest text-gold mb-1">YVR Rating</p>
            <p className="font-serif text-3xl text-text-primary">
              {advisoryRating.toFixed(1)}
              <span className="text-text-dim text-sm font-sans font-normal"> / 10</span>
            </p>
          </div>
        )}
        <p className="text-xs uppercase tracking-widest text-gold">Reserve or Join</p>
        <button onClick={() => setModal("reservation")} className="block w-full">
          <GoldButton className="w-full">Book Bottle Service</GoldButton>
        </button>
        <button onClick={() => setModal("guestlist")} className="block w-full">
          <GoldButton variant="outline" className="w-full">Join Guestlist</GoldButton>
        </button>
        {reservationLink && (
          <a href={reservationLink} target="_blank" rel="noopener noreferrer"
            className="text-center text-xs uppercase tracking-widest text-text-muted hover:text-gold transition-colors">
            Book Directly
          </a>
        )}
        {websiteUrl && (
          <a href={websiteUrl} target="_blank" rel="noopener noreferrer"
            className="text-center text-xs uppercase tracking-widest text-text-muted hover:text-gold transition-colors">
            Official Website
          </a>
        )}
        {instagramUrl && (
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
            className="text-center text-xs uppercase tracking-widest text-text-muted hover:text-gold transition-colors">
            Instagram
          </a>
        )}
        {phone && (
          <a href={`tel:${phone}`}
            className="text-center text-xs uppercase tracking-widest text-text-muted hover:text-gold transition-colors">
            {phone}
          </a>
        )}
        {lat && lng && (
          <div className="pt-2 border-t border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-text-dim mb-2">Get Directions</p>
            <DirectionButtons lat={lat} lng={lng} name={venueName} />
          </div>
        )}
      </div>
    </>
  );
}
