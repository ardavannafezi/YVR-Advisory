import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format, isPast } from "date-fns";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { EventJsonLd } from "@/components/events/EventJsonLd";
import { EventGallery } from "@/components/events/EventGallery";
import { EventVideo } from "@/components/events/EventVideo";
import { EventSimilar } from "@/components/events/EventSimilar";
import { EventCTASidebar } from "@/components/events/EventCTASidebar";
import type { Event } from "@/types";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const event = await api.get<Event>(`/api/events/${params.slug}`);
    const venueName = event.venue?.name || "Vancouver";
    const dateStr = format(new Date(event.date), "MMMM d, yyyy");
    const performers = event.lineup?.map(a => a.name).join(", ");
    const description =
      event.description ||
      `${event.name} at ${venueName} on ${dateStr}.${performers ? ` Featuring ${performers}.` : ""} Book your guestlist or tickets on YVR Advisory.`;

    return {
      title: `${event.name} at ${venueName} — ${dateStr} | YVR Advisory`,
      description: description.slice(0, 160),
      alternates: { canonical: `/events/${event.slug}` },
      openGraph: {
        title: `${event.name} at ${venueName}`,
        description: description.slice(0, 160),
        images: event.image_url ? [{ url: event.image_url, alt: event.name }] : [],
        url: `/events/${event.slug}`,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${event.name} at ${venueName}`,
        description: description.slice(0, 160),
        images: event.image_url ? [event.image_url] : [],
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

  const images = event.gallery?.length
    ? event.gallery
    : event.image_url
    ? [event.image_url]
    : [];

  const hasGuestlistCTA = event.our_guestlist && !guestlistClosed;
  const hasTicketCTA = !!event.ticket_url && !entryClosed;
  const hasReserveCTA = event.our_reservation && !!event.venue_id && !entryClosed;

  return (
    <>
      <EventJsonLd event={event} />

      <div className="pt-20">
        {/* Hero Gallery */}
        {images.length > 0 ? (
          <div className="relative">
            <EventGallery images={images} alt={event.name} variant="full" autoPlay />
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
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-text-muted text-sm mb-6">
                <span>{format(date, "EEEE, MMMM d, yyyy")}</span>
                <span>·</span>
                <span>{format(date, "h:mm a")}</span>
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
                    <p className="text-[11px] uppercase tracking-widest text-text-dim">
                      {guestlistClosed
                        ? "Guestlist closed"
                        : `Guestlist closes ${format(new Date(event.guestlist_closes_at), "EEE, MMM d · h:mm a")}`}
                    </p>
                  )}
                  {event.entry_closes_at && (
                    <p className="text-[11px] uppercase tracking-widest text-text-dim">
                      {entryClosed
                        ? "Entry closed"
                        : `Entry closes ${format(new Date(event.entry_closes_at), "EEE, MMM d · h:mm a")}`}
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
                                className="text-[10px] uppercase tracking-widest text-text-dim hover:text-gold transition-colors">
                                IG
                              </a>
                            )}
                            {artist.tiktok && (
                              <a href={artist.tiktok} target="_blank" rel="noopener noreferrer"
                                className="text-[10px] uppercase tracking-widest text-text-dim hover:text-gold transition-colors">
                                TT
                              </a>
                            )}
                            {artist.youtube && (
                              <a href={artist.youtube} target="_blank" rel="noopener noreferrer"
                                className="text-[10px] uppercase tracking-widest text-text-dim hover:text-gold transition-colors">
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
                        <p className="text-text-dim text-[11px] mt-0.5">{event.venue.neighbourhood}</p>
                      )}
                      {event.venue.address && (
                        <p className="text-text-dim text-[11px]">{event.venue.address}</p>
                      )}
                    </div>
                    <span className="ml-auto text-gold text-lg opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                  </Link>
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
              />
            </div>
          </div>
        </div>

      </div>

      {/* Similar events */}
      <EventSimilar eventId={event.id} musicType={event.music_type ?? undefined} venueType={event.venue?.establishment_type ?? undefined} />
    </>
  );
}
