"use client";

interface Props {
  venueName: string;
  advisoryRating?: number;
  reservationLink?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  phone?: string;
  lat?: number;
  lng?: number;
  guestlistEnabled?: boolean;
  bottleServiceEnabled?: boolean;
}

function DirectionButtons({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const encoded = encodeURIComponent(name);
  const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const appleUrl = `https://maps.apple.com/?daddr=${lat},${lng}&q=${encoded}&dirflg=d`;
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

function scrollToEvents() {
  document.getElementById("venue-events")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function VenueCTAPanel({
  venueName, advisoryRating, reservationLink, websiteUrl, instagramUrl, phone, lat, lng,
  guestlistEnabled, bottleServiceEnabled,
}: Props) {
  return (
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

      {bottleServiceEnabled && (
        <div className="border border-gold/30 bg-gold/[0.04] p-4 flex flex-col gap-3">
          <div>
            <p className="text-[9px] uppercase tracking-[0.25em] text-gold mb-1">VIP Table Experience</p>
            <p className="font-serif text-base text-text-primary leading-snug">Private Table &amp; Bottle Service</p>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Reserve exclusive seating with curated bottle packages. Our team will confirm availability, pricing, and details — tailored to your group.
          </p>
          <button
            onClick={scrollToEvents}
            className="w-full text-center text-[11px] uppercase tracking-[0.15em] py-3 bg-gold text-black hover:bg-gold/90 active:bg-gold/80 transition-colors font-semibold"
          >
            Reserve a Table
          </button>
          <p className="text-[10px] text-text-dim text-center">
            Select an event below to begin your inquiry
          </p>
        </div>
      )}
      {guestlistEnabled && (
        <div className={bottleServiceEnabled ? "" : ""}>
          {!bottleServiceEnabled && <p className="text-xs uppercase tracking-widest text-gold">Reserve or Join</p>}
          <button
            onClick={scrollToEvents}
            className="w-full text-center text-[11px] uppercase tracking-widest py-3 border border-gold/50 text-gold hover:bg-gold/10 transition-colors"
          >
            Join Guestlist
          </button>
          {!bottleServiceEnabled && (
            <p className="text-[10px] text-text-dim text-center">
              Select an upcoming event below
            </p>
          )}
        </div>
      )}

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
  );
}
