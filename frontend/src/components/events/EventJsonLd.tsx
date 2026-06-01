import type { Event } from "@/types";

export function EventJsonLd({ event }: { event: Event }) {
  const performers = event.lineup?.map(a => ({
    "@type": "Person",
    name: a.name,
    ...(a.instagram ? { sameAs: [a.instagram] } : {}),
  }));

  const offers: object[] = [];
  if (event.our_guestlist) {
    offers.push({
      "@type": "Offer",
      name: "Guestlist",
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/guestlist?event_id=${event.id}`,
      availability: "https://schema.org/InStock",
      validThrough: event.guestlist_closes_at,
    });
  }
  if (event.ticket_url) {
    offers.push({
      "@type": "Offer",
      name: "Tickets",
      url: event.ticket_url,
      availability: "https://schema.org/InStock",
    });
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.description,
    startDate: event.date,
    endDate: event.entry_closes_at,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(event.image_url ? { image: [event.image_url, ...(event.gallery ?? [])] } : {}),
    ...(performers?.length ? { performer: performers } : {}),
    ...(offers.length ? { offers } : {}),
    location: event.venue
      ? {
          "@type": "Place",
          name: event.venue.name,
          address: {
            "@type": "PostalAddress",
            streetAddress: event.venue.address,
            addressLocality: "Vancouver",
            addressRegion: "BC",
            addressCountry: "CA",
          },
        }
      : { "@type": "Place", name: "Vancouver, BC" },
    organizer: { "@type": "Organization", name: "YVR Advisory", url: process.env.NEXT_PUBLIC_SITE_URL },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
