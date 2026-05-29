import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedVenues } from "@/components/home/FeaturedVenues";
import { UpcomingEvents } from "@/components/home/UpcomingEvents";
import { CtaBanner } from "@/components/home/CtaBanner";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "YVR Advisory | Vancouver Nightlife & Events",
  description:
    "Your guide to Vancouver's finest nightlife — curated venues, exclusive events, and personalized recommendations for the discerning night out.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "YVR Advisory | Vancouver Nightlife & Events",
    description: "Your guide to Vancouver's finest nightlife.",
    url: "/",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedVenues />
      <UpcomingEvents />
      <CtaBanner />
    </>
  );
}
