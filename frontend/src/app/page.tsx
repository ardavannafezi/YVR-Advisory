import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedVenues } from "@/components/home/FeaturedVenues";
import { UpcomingEvents } from "@/components/home/UpcomingEvents";
import { AdvisorSection } from "@/components/home/AdvisorSection";
import { CtaBanner } from "@/components/home/CtaBanner";

function EventsSkeleton() {
  return (
    <section className="py-24 border-t border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-10 w-52 bg-white/[0.05] animate-pulse mb-12 rounded-sm" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 bg-white/[0.05] animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  );
}

function VenuesSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="h-10 w-44 bg-white/[0.05] animate-pulse mb-12 rounded-sm" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 bg-white/[0.05] animate-pulse" />
        ))}
      </div>
    </section>
  );
}

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
      <Suspense fallback={<EventsSkeleton />}>
        <UpcomingEvents />
      </Suspense>
      <Suspense fallback={<VenuesSkeleton />}>
        <FeaturedVenues category="nightclub" title="Nightclubs" eyebrow="Vancouver's Best" />
      </Suspense>
      <Suspense fallback={<VenuesSkeleton />}>
        <FeaturedVenues category="lounge" title="Lounges & Bars" eyebrow="Elevated Escapes" />
      </Suspense>
      <AdvisorSection />
      <CtaBanner />
    </>
  );
}
