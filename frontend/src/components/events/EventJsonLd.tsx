import type { Event } from "@/types";

export function EventJsonLd({ event }: { event: Event }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.description,
    startDate: event.date,
    ...(event.image_url ? { image: event.image_url } : {}),
    ...(event.ticket_url ? { url: event.ticket_url } : {}),
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
      : undefined,
    organizer: { "@type": "Organization", name: "YVR Advisory", url: process.env.NEXT_PUBLIC_SITE_URL },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
