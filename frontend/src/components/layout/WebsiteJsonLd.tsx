const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://yvradvisory.ca";

export function WebsiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "YVR Advisory",
    alternateName: ["YVR Nightlife", "Vancouver Nightlife Guide"],
    url: SITE,
    description:
      "Vancouver's premier nightlife advisory — curated venues, exclusive events, guestlist signups, and personalized recommendations for the best night out in YVR.",
    inLanguage: "en-CA",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE}/venues?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "YVR Advisory",
      url: SITE,
      logo: { "@type": "ImageObject", url: `${SITE}/white.png` },
      sameAs: [],
      areaServed: { "@type": "City", name: "Vancouver", addressCountry: "CA" },
      knowsAbout: [
        "Vancouver nightlife",
        "Vancouver nightclubs",
        "Vancouver events",
        "YVR clubs",
        "Gastown bars",
        "Granville Street nightlife",
      ],
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
