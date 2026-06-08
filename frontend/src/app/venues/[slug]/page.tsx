import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { VenueJsonLd } from "@/components/venues/VenueJsonLd";
import { VenueFaqAccordion } from "@/components/venues/VenueFaqAccordion";
import { VenueViewTracker } from "@/components/venues/VenueViewTracker";
import { VenueEventsSlider } from "@/components/venues/VenueEventsSlider";
import { VenueCTAPanel } from "@/components/venues/VenueCTAPanel";
import type { Venue, VenueHours } from "@/types";

export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const API = process.env.NEXT_PUBLIC_API_URL || "https://back.yvradvisory.ca";
    const res = await fetch(`${API}/api/venues?limit=500`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map((v: { slug: string }) => ({ slug: v.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const venue = await api.get<Venue>(`/api/venues/${params.slug}`);
    const estType = venue.establishment_type ?? "Nightclub";
    const description = venue.description ||
      `${venue.name} is a ${estType.toLowerCase()} in ${venue.neighbourhood ?? "Vancouver"}. Discover events, guestlist access, and table reservations at YVR Advisory.`;
    const keywords = [
      venue.name,
      `${venue.name} Vancouver`,
      estType,
      ...(venue.neighbourhood ? [venue.neighbourhood, `${venue.neighbourhood} ${estType.toLowerCase()}`] : []),
      ...(venue.music_types ?? []).map(m => `${m} ${estType.toLowerCase()} Vancouver`),
      "Vancouver nightlife",
    ];
    return {
      title: `${venue.name} — ${estType} in Vancouver | YVR Advisory`,
      description: description.slice(0, 160),
      keywords,
      alternates: { canonical: `/venues/${venue.slug}` },
      openGraph: {
        type: "website",
        siteName: "YVR Advisory",
        title: `${venue.name} — ${estType} Vancouver`,
        description: description.slice(0, 160),
        images: venue.image_url ? [{ url: venue.image_url, alt: venue.name }] : [{ url: "/api/og" }],
        url: `/venues/${venue.slug}`,
      },
      twitter: {
        card: "summary_large_image",
        title: `${venue.name} — ${estType} Vancouver`,
        description: description.slice(0, 160),
        images: venue.image_url ? [venue.image_url] : ["/api/og"],
      },
    };
  } catch {
    return { title: "Venue Not Found" };
  }
}

const DAY_ORDER: (keyof VenueHours)[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

function HoursTable({ hours }: { hours: VenueHours }) {
  return (
    <div className="flex flex-col gap-1.5">
      {DAY_ORDER.map((day) => {
        const val = hours[day];
        return (
          <div key={day} className="flex justify-between text-sm">
            <span className="text-text-dim capitalize">{day}</span>
            <span className={val ? "text-text-primary" : "text-text-dim"}>{val || "Closed"}</span>
          </div>
        );
      })}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-gold mb-1">{label}</p>
      <p className="text-text-muted text-sm">{value}</p>
    </div>
  );
}

function DirectionButtons({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const encoded = encodeURIComponent(name);
  const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const appleUrl = `https://maps.apple.com/?daddr=${lat},${lng}&q=${encoded}&dirflg=d`;

  return (
    <div className="flex gap-2">
      <a
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 text-center text-[10px] uppercase tracking-widest py-2.5 border border-white/10 text-text-muted hover:border-gold/40 hover:text-gold transition-colors"
      >
        Google Maps
      </a>
      <a
        href={appleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 text-center text-[10px] uppercase tracking-widest py-2.5 border border-white/10 text-text-muted hover:border-gold/40 hover:text-gold transition-colors"
      >
        Apple Maps
      </a>
    </div>
  );
}

export default async function VenueDetailPage({ params }: { params: { slug: string } }) {
  let venue: Venue;
  try {
    venue = await api.get<Venue>(`/api/venues/${params.slug}`);
  } catch {
    notFound();
  }

  return (
    <>
      <VenueJsonLd venue={venue} />
      <VenueViewTracker slug={venue.slug} />
      <div className="pt-20">
        {/* Hero image */}
        <div className="relative h-[55vh] overflow-hidden bg-white/[0.04] animate-pulse">
          {venue.image_url ? (
            <Image src={venue.image_url} alt={venue.name} fill className="object-cover" priority />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="max-w-5xl mx-auto px-6 -mt-20 pb-24 relative z-10">
          {/* Badges row */}
          <div className="flex flex-wrap gap-2 mb-4">
            {venue.establishment_type && (
              <span className="text-[10px] uppercase tracking-widest text-text-dim border border-white/10 px-2.5 py-1">
                {venue.establishment_type}
              </span>
            )}
            {(venue.music_types ?? []).map((t) => <Badge key={t} label={t} variant="gold" />)}
            {venue.price_tier && (
              <span className="text-[10px] uppercase tracking-widest text-gold border border-gold/40 px-2.5 py-1">
                {venue.price_tier}
              </span>
            )}
          </div>

          <div className="flex items-center gap-5 mb-1">
            {venue.logo_url && (
              <div className="relative w-16 h-16 shrink-0 bg-white/5 border border-white/10 overflow-hidden">
                <Image
                  src={venue.logo_url}
                  alt={`${venue.name} logo`}
                  fill
                  className="object-contain p-1"
                  sizes="64px"
                />
              </div>
            )}
            <h1 className="font-serif text-5xl md:text-6xl text-text-primary">{venue.name}</h1>
          </div>
          {venue.hospitality_company && (
            <p className="text-xs uppercase tracking-widest text-text-dim mb-1">{venue.hospitality_company}</p>
          )}
          {venue.neighbourhood && (
            <p className="text-text-muted text-sm uppercase tracking-widest mb-6">{venue.neighbourhood}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10">
            {/* ── Left column ── */}
            <div className="md:col-span-2 flex flex-col gap-10">
              {venue.description && (
                <p className="text-text-muted leading-relaxed">{venue.description}</p>
              )}

              {/* Advisory rating */}
              {venue.advisory_rating != null && (
                <div className="flex items-center gap-4 border border-gold/30 px-5 py-4 bg-gold/5">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gold mb-0.5">YVR Advisory Rating</p>
                    <p className="font-serif text-4xl text-text-primary leading-none">
                      {venue.advisory_rating.toFixed(1)}
                      <span className="text-text-dim text-lg font-sans font-normal"> / 10</span>
                    </p>
                  </div>
                  {/* pip bar */}
                  <div className="flex gap-1 items-end ml-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 rounded-sm transition-all"
                        style={{
                          height: `${8 + i * 3}px`,
                          backgroundColor:
                            i < Math.floor(venue.advisory_rating!)
                              ? "#c9a84c"
                              : i < venue.advisory_rating!
                              ? "rgba(201,168,76,0.45)"
                              : "rgba(255,255,255,0.08)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(venue.primary_nights ?? []).length > 0 && (
                  <div className="card-surface p-4">
                    <p className="text-[10px] uppercase tracking-widest text-gold mb-1">Best Nights</p>
                    <p className="text-text-primary text-sm capitalize">{(venue.primary_nights ?? []).join(", ")}</p>
                  </div>
                )}
                {venue.dress_code && (
                  <div className="card-surface p-4">
                    <p className="text-[10px] uppercase tracking-widest text-gold mb-1">Dress Code</p>
                    <p className="text-text-primary text-sm">{venue.dress_code.split(" — ")[0]}</p>
                  </div>
                )}
                {venue.age_restriction && (
                  <div className="card-surface p-4">
                    <p className="text-[10px] uppercase tracking-widest text-gold mb-1">Age</p>
                    <p className="text-text-primary text-sm">{venue.age_restriction}+</p>
                  </div>
                )}
                {venue.capacity && (
                  <div className="card-surface p-4">
                    <p className="text-[10px] uppercase tracking-widest text-gold mb-1">Capacity</p>
                    <p className="text-text-primary text-sm">{venue.capacity.toLocaleString()}</p>
                  </div>
                )}
              </div>

              {/* Gallery */}
              {(venue.gallery_urls ?? []).length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-gold mb-3">Photos</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(venue.gallery_urls ?? []).map((url, i) => (
                      <div key={i} className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={url}
                          alt={`${venue.name} photo ${i + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing */}
              {(venue.cover_charge_info || venue.bottle_minimum) && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-gold mb-3">Pricing</p>
                  <div className="card-surface p-5 flex flex-col gap-3">
                    <InfoRow label="Cover Charge" value={venue.cover_charge_info} />
                    <InfoRow
                      label="Bottle Minimum"
                      value={venue.bottle_minimum ? `$${venue.bottle_minimum.toLocaleString()} CAD` : null}
                    />
                  </div>
                </div>
              )}

              {/* Special nights */}
              {(venue.special_nights ?? []).length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-gold mb-3">Special Nights</p>
                  <ul className="card-surface p-5 flex flex-col gap-2">
                    {(venue.special_nights ?? []).map((night) => (
                      <li key={night} className="text-text-muted text-sm flex items-start gap-2">
                        <span className="text-gold mt-0.5 shrink-0">›</span>
                        {night}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Special occasions */}
              {venue.special_occasion && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-gold mb-3">Special Occasions</p>
                  <div className="card-surface p-5">
                    <p className="text-text-muted text-sm leading-relaxed">{venue.special_occasion}</p>
                  </div>
                </div>
              )}

              {/* Hours */}
              {venue.hours && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-gold mb-3">Hours</p>
                  <div className="card-surface p-5">
                    <HoursTable hours={venue.hours} />
                  </div>
                </div>
              )}

              {/* Location + directions */}
              {venue.address && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-gold mb-3">Location</p>
                  <div className="card-surface p-5 flex flex-col gap-4">
                    <p className="text-text-muted text-sm">{venue.address}</p>
                    {venue.latitude && venue.longitude && (
                      <DirectionButtons lat={venue.latitude} lng={venue.longitude} name={venue.name} />
                    )}
                  </div>
                </div>
              )}

              {/* Vibe tags */}
              {(venue.vibe_tags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(venue.vibe_tags ?? []).map((tag) => <Badge key={tag} label={tag} />)}
                </div>
              )}

              {/* FAQ */}
              {venue.faqs && venue.faqs.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-gold mb-3">FAQ</p>
                  <div className="card-surface px-5">
                    <VenueFaqAccordion faqs={venue.faqs} />
                  </div>
                </div>
              )}

              {/* Upcoming events */}
              <div id="venue-events">
                <VenueEventsSlider venueId={venue.id} venueName={venue.name} />
              </div>
            </div>

            {/* ── Right column: CTA panel ── */}
            <div className="flex flex-col gap-4">
              <VenueCTAPanel
                venueName={venue.name}
                advisoryRating={venue.advisory_rating ?? undefined}
                reservationLink={venue.reservation_link ?? undefined}
                websiteUrl={venue.website_url ?? undefined}
                instagramUrl={venue.instagram_url ?? undefined}
                phone={venue.phone ?? undefined}
                lat={venue.latitude ?? undefined}
                lng={venue.longitude ?? undefined}
                guestlistEnabled={venue.guestlist_enabled}
                bottleServiceEnabled={venue.bottle_service_enabled}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
