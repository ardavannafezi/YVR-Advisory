import type { Venue } from "@/types";

export function VenueJsonLd({ venue }: { venue: Venue }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "NightClub",
    name: venue.name,
    description: venue.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: venue.address,
      addressLocality: "Vancouver",
      addressRegion: "BC",
      addressCountry: "CA",
    },
    ...(venue.latitude && venue.longitude
      ? { geo: { "@type": "GeoCoordinates", latitude: venue.latitude, longitude: venue.longitude } }
      : {}),
    ...(venue.phone ? { telephone: venue.phone } : {}),
    ...(venue.image_url ? { image: venue.image_url } : {}),
    ...(venue.website_url ? { url: venue.website_url } : {}),
    ...(venue.instagram_url ? { sameAs: [venue.instagram_url] } : {}),
    ...(venue.price_tier ? { priceRange: venue.price_tier } : {}),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
