import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedVenues } from "@/components/home/FeaturedVenues";
import { UpcomingEvents } from "@/components/home/UpcomingEvents";
import { AdvisorSection } from "@/components/home/AdvisorSection";
import { CtaBanner } from "@/components/home/CtaBanner";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "YVR Advisory — Vancouver Nightlife Guide | Best Clubs & Events Tonight",
  description:
    "YVR Advisory is Vancouver's independent nightlife guide. Discover the best nightclubs, cocktail bars, and events in Vancouver tonight — curated venues, honest recommendations, no commissions.",
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
    title: "YVR Advisory — Vancouver Nightlife Guide",
    description:
      "Your independent guide to Vancouver nightclubs, bars, and events. Find the best nights in YVR — curated, unbiased, always current.",
    url: "/",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedVenues category="nightclub" title="Nightclubs" eyebrow="Vancouver's Best" />
      <FeaturedVenues category="lounge" title="Lounges & Bars" eyebrow="Elevated Escapes" />
      <UpcomingEvents />
      <AdvisorSection />
      <CtaBanner />
    </>
  );
}
