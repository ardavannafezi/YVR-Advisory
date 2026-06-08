import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isPast } from "date-fns";
import { api } from "@/lib/api";
import { ptDateLong, ptGuestlistClose, ptTime } from "@/lib/date";
import { Badge } from "@/components/ui/Badge";
import { EventJsonLd } from "@/components/events/EventJsonLd";
import { EventGallery } from "@/components/events/EventGallery";
import { EventVideo } from "@/components/events/EventVideo";
import { EventSimilar } from "@/components/events/EventSimilar";
import { EventCTASidebar } from "@/components/events/EventCTASidebar";
import { EventPageTracker } from "@/components/events/EventPageTracker";
import { EventDisclaimer } from "@/components/events/EventDisclaimer";
import type { Event } from "@/types";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const API = process.env.NEXT_PUBLIC_API_URL || "https://back.yvradvisory.ca";
    const res = await fetch(`${API}/api/events?limit=500`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map((e: { slug: string }) => ({ slug: e.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const event = await api.get<Event>(`/api/events/${params.slug}`);
    const venueName = event.venue?.name || "Vancouver";
    const dateStr = ptDateLong(new Date(event.date));
    const performers = event.lineup?.map(a => a.name).join(", ");
    const description =
      event.description ||
      `${event.name} at ${venueName} on ${dateStr}.${performers ? ` Featuring ${performers}.` : ""} Book your guestlist or tickets on YVR Advisory.`;

    const keywords = [
      event.name,
      `${event.name} Vancouver`,
      ...(event.music_type ? [event.music_type, `${event.music_type} night Vancouver`] : []),
      ...(event.venue?.name ? [`${event.venue.name} events`] : []),
      "Vancouver events",
      "Vancouver nightlife",
    ];
    return {
      title: `${event.name} at ${venueName} — ${dateStr} | YVR Advisory`,
      description: description.slice(0, 160),
      keywords,
      alternates: { canonical: `/events/${event.slug}` },
      openGraph: {
        type: "website",
        siteName: "YVR Advisory",
        title: `${event.name} at ${venueName}`,
        description: description.slice(0, 160),
        images: event.image_url ? [{ url: event.image_url, alt: event.name }] : [{ url: "/api/og" }],
        url: `/events/${event.slug}`,
      },
      twitter: {
        card: "summary_large_image",
        title: `${event.name} at ${venueName}`,
        description: description.slice(0, 160),
        images: event.image_url ? [event.image_url] : ["/api/og"],
      },
    };
  } catch {
    return { title: "Event Not Found | YVR Advisory" };
  }
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  let event: Event;
  try {
    event = await api.get<Event>(`/api/events/${params.slug}`);
  } catch {
    notFound();
  }

  const date = new Date(event.date);
  const entryClosed = event.entry_closes_at ? isPast(new Date(event.entry_closes_at)) : false;
  const guestlistClosed = event.guestlist_closes_at ? isPast(new Date(event.guestlist_closes_at)) : false;

  const heroImage = event.image_url || null;
  const galleryImages = event.gallery?.length ? event.gallery : [];

  const hasGuestlistCTA = event.our_guestlist && !guestlistClosed;
  const hasTicketCTA = !!event.ticket_url && !entryClosed;
  const hasReserveCTA = event.our_reservation && !!event.venue_id && !guestlistClosed;

  return (
    <>
      <EventJsonLd event={event} />
      <EventPageTracker
        eventId={event.id}
        eventName={event.name}
        venueName={event.venue?.name}
        musicType={event.music_type ?? undefined}
        date={event.date}
      />

      <div className="pt-20">
        {/* Hero — full-width event image */}
        {heroImage ? (
          <div className="relative">
            <EventGallery images={[heroImage]} alt={event.name} variant="full" autoPlay={false} />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent pointer-events-none" />
          </div>
        ) : (
          <div className="h-[40vh] bg-gradient-to-br from-gold/5 to-transparent relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>
        )}

        {/* Main content */}
        <div className="max-w-5xl mx-auto px-6 pb-32 relative z-10 -mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Left — main content */}
            <div className="lg:col-span-2">
              {/* Badges */}
              <div className="flex gap-2 flex-wrap mb-5">
                {event.music_type && <Badge label={event.music_type} variant="gold" />}
                {event.category && <Badge label={event.category} variant="dim" />}
                {event.entry_types?.map(t => (
                  <Badge key={t} label={t} variant="dim" />
                ))}
              </div>

              {/* Title */}
              <h1 className="font-serif text-4xl md:text-5xl text-text-primary leading-tight mb-3">
                {event.name}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm mb-6" style={{color: '#b0b0b0'}}>
                <span>{ptDateLong(date)}</span>
                <span>·</span>
                <span>{ptTime(date)} PT</span>
                {event.venue && (
                  <>
                    <span>·</span>
                    <Link href={`/venues/${event.venue.slug}`} className="text-gold hover:underline">
                      {event.venue.name}
                    </Link>
                  </>
                )}
              </div>

              {/* Entry timing info */}
              {(event.guestlist_closes_at || event.entry_closes_at) && (
                <div className="border border-white/8 bg-white/[0.02] p-4 mb-6 space-y-1">
                  {event.guestlist_closes_at && (
                    <p className="text-[11px] uppercase tracking-widest text-[#a0a0a0]">
                      {guestlistClosed
                        ? "Guestlist closed"
                        : `Guestlist closes ${ptGuestlistClose(new Date(event.guestlist_closes_at))} PT`}
                    </p>
                  )}
                  {event.entry_closes_at && (
                    <p className="text-[11px] uppercase tracking-widest text-[#a0a0a0]">
                      {entryClosed
                        ? "Entry closed"
                        : `Entry closes ${ptGuestlistClose(new Date(event.entry_closes_at))} PT`}
                    </p>
                  )}
                </div>
              )}

              {/* Social proof */}
              {event.social_proof_count != null && (
                <p className="text-text-dim text-[11px] uppercase tracking-widest mb-6">
                  {event.social_proof_count} people interested
                </p>
              )}

              {/* Description */}
              {event.description && (
                <div className="mb-8">
                  <p className="text-text-muted leading-relaxed text-base">{event.description}</p>
                </div>
              )}

              {/* Gallery */}
              {galleryImages.length > 0 && (
                <div className="mb-10">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gold mb-4">Gallery</p>
                  <EventGallery images={galleryImages} alt={event.name} variant="slider" />
                </div>
              )}

              {/* Lineup */}
              {event.lineup && event.lineup.length > 0 && (
                <div className="mb-10">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gold mb-4">Lineup</p>
                  <div className="flex flex-wrap gap-3">
                    {event.lineup.map((artist, i) => (
                      <div key={i} className="border border-white/10 px-4 py-3 hover:border-gold/30 transition-colors duration-200">
                        <p className="text-text-primary text-sm font-medium">{artist.name}</p>
                        {(artist.instagram || artist.tiktok || artist.youtube) && (
                          <div className="flex gap-3 mt-1.5">
                            {artist.instagram && (
                              <a href={artist.instagram} target="_blank" rel="noopener noreferrer"
                                className="text-[10px] uppercase tracking-widest text-[#888] hover:text-gold transition-colors">
                                IG
                              </a>
                            )}
                            {artist.tiktok && (
                              <a href={artist.tiktok} target="_blank" rel="noopener noreferrer"
                                className="text-[10px] uppercase tracking-widest text-[#888] hover:text-gold transition-colors">
                                TT
                              </a>
                            )}
                            {artist.youtube && (
                              <a href={artist.youtube} target="_blank" rel="noopener noreferrer"
                                className="text-[10px] uppercase tracking-widest text-[#888] hover:text-gold transition-colors">
                                YT
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Venue card */}
              {event.venue && (
                <div className="mb-10">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gold mb-4">Venue</p>
                  <Link
                    href={`/venues/${event.venue.slug}`}
                    className="flex items-center gap-4 border border-white/10 p-4 hover:border-gold/30 transition-colors duration-200 group"
                  >
                    {event.venue.image_url && (
                      <img
                        src={event.venue.image_url}
                        alt={event.venue.name}
                        className="w-16 h-16 object-cover flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    )}
                    <div>
                      <p className="text-text-primary text-sm font-medium group-hover:text-gold transition-colors">
                        {event.venue.name}
                      </p>
                      {event.venue.neighbourhood && (
                        <p className="text-[#888] text-[11px] mt-0.5">{event.venue.neighbourhood}</p>
                      )}
                      {event.venue.address && (
                        <p className="text-[#888] text-[11px]">{event.venue.address}</p>
                      )}
                    </div>
                    <span className="ml-auto text-gold text-lg opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                  </Link>
                  {event.venue.latitude && event.venue.longitude && (
                    <div className="flex gap-2 mt-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${event.venue.latitude},${event.venue.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center text-[10px] uppercase tracking-widest py-2.5 border border-white/10 text-text-muted hover:border-gold/40 hover:text-gold transition-colors"
                      >
                        Google Maps
                      </a>
                      <a
                        href={`https://maps.apple.com/?daddr=${event.venue.latitude},${event.venue.longitude}&q=${encodeURIComponent(event.venue.name)}&dirflg=d`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center text-[10px] uppercase tracking-widest py-2.5 border border-white/10 text-text-muted hover:border-gold/40 hover:text-gold transition-colors"
                      >
                        Apple Maps
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Video */}
              {event.video_url && (
                <div className="mb-10">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gold mb-4">Watch</p>
                  <EventVideo url={event.video_url} />
                </div>
              )}
            </div>

            {/* Right — sticky CTAs */}
            <div className="lg:col-span-1">
              <EventCTASidebar
                eventId={event.id}
                venueId={event.venue_id ?? undefined}
                eventName={event.name}
                venueName={event.venue?.name}
                venueEstType={event.venue?.establishment_type ?? undefined}
                date={event.date}
                hasGuestlistCTA={hasGuestlistCTA}
                hasTicketCTA={hasTicketCTA}
                ticketUrl={event.ticket_url ?? undefined}
                hasReserveCTA={hasReserveCTA}
                entryClosed={entryClosed}
                guestlistClosed={guestlistClosed}
                venueHasGuestlist={event.venue?.guestlist_enabled ?? false}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Similar events */}
      <EventSimilar eventId={event.id} musicType={event.music_type ?? undefined} venueType={event.venue?.establishment_type ?? undefined} />

      <EventDisclaimer />
    </>
  );
}
