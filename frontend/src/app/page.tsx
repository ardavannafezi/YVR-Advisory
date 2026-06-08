import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedVenues } from "@/components/home/FeaturedVenues";
import { UpcomingEvents } from "@/components/home/UpcomingEvents";
import { AdvisorSection } from "@/components/home/AdvisorSection";
import { CtaBanner } from "@/components/home/CtaBanner";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "YVR Advisory — Vancouver Nightlife Guide",
  description:
    "Vancouver's best nightclubs, bars, and events tonight. Curated venues, guestlist access, and personalized nightlife recommendations.",
  keywords: [
    "Vancouver nightlife",
    "nightclubs Vancouver",
    "events tonight Vancouver",
    "Vancouver clubs",
    "best bars Vancouver",
    "events Vancouver",
    "Vancouver where to go tonight",
    "Granville Street nightlife",
    "Gastown bars",
    "Yaletown lounges",
    "Vancouver nightclub guide",
    "YVR nightlife",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "YVR Advisory",
    title: "YVR Advisory — Vancouver Nightlife Guide",
    description:
      "Your advisor for Vancouver nightclubs, bars, and events. Find the best nights in YVR — curated, always current.",
    url: "/",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "YVR Advisory — Vancouver Nightlife Guide" }],
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <UpcomingEvents />
      <FeaturedVenues category="nightclub" title="Nightclubs" eyebrow="Vancouver's Best" />
      <FeaturedVenues category="lounge" title="Lounges & Bars" eyebrow="Elevated Escapes" />
      <AdvisorSection />
      <CtaBanner />
    </>
  );
}
