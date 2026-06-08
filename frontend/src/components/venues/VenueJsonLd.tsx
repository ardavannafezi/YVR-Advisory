import type { Venue, VenueHours } from "@/types";

function schemaType(estType?: string | null) {
  switch (estType) {
    case "Cocktail Bar":
    case "Bar & Restaurant":
      return "BarOrPub";
    case "Rooftop Lounge":
    case "Nightclub":
    default:
      return "NightClub";
  }
}

const DAY_MAP: Record<keyof VenueHours, string> = {
  monday: "Mo", tuesday: "Tu", wednesday: "We", thursday: "Th",
  friday: "Fr", saturday: "Sa", sunday: "Su",
};

function buildOpeningHours(hours?: VenueHours | null): string[] {
  if (!hours) return [];
  return (Object.entries(hours) as [keyof VenueHours, string | null | undefined][])
    .filter(([, v]) => v)
    .map(([day, v]) => `${DAY_MAP[day]} ${v}`);
}

export function VenueJsonLd({ venue }: { venue: Venue }) {
  const openingHours = buildOpeningHours(venue.hours);
  const schema = {
    "@context": "https://schema.org",
    "@type": schemaType(venue.establishment_type),
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
    ...(openingHours.length ? { openingHours } : {}),
    ...(venue.age_restriction ? { typicalAgeRange: `${venue.age_restriction}-` } : {}),
    ...(venue.music_types?.length ? { knowsAbout: venue.music_types.map(m => `${m} music`) } : {}),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
