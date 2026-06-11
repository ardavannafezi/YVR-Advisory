import { ORGANIZATION, SITE_URL } from "@/lib/site";

export function WebsiteJsonLd() {
  const organizationId = `${SITE_URL}#organization`;
  const websiteId = `${SITE_URL}#website`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: ORGANIZATION.name,
        legalName: ORGANIZATION.legalName,
        url: ORGANIZATION.url,
        email: ORGANIZATION.email,
        description: ORGANIZATION.description,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/white.png`,
        },
        sameAs: [ORGANIZATION.instagramUrl],
        areaServed: {
          "@type": "City",
          name: "Vancouver",
          containedInPlace: {
            "@type": "AdministrativeArea",
            name: "British Columbia",
          },
          addressCountry: "CA",
        },
        knowsAbout: [
          "Vancouver nightlife",
          "Vancouver nightclubs",
          "Vancouver events",
          "YVR clubs",
          "Gastown bars",
          "Granville Street nightlife",
        ],
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "editorial",
            email: ORGANIZATION.email,
            areaServed: "CA",
            availableLanguage: ["English"],
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: SITE_URL,
        name: ORGANIZATION.name,
        alternateName: ["YVR Nightlife", "Vancouver Nightlife Guide"],
        description:
          "Vancouver's premier nightlife advisory with curated venues, events, guestlist access, and personalized recommendations for nights out in the city.",
        inLanguage: "en-CA",
        publisher: { "@id": organizationId },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/venues?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
